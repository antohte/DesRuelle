<template>
  <DashboardLayout title="Paiement">
    <div v-if="loadingDevis" class="loading">Chargement…</div>

    <div v-else-if="devis" class="payment-layout">
      <!-- Résumé -->
      <div class="summary-card">
        <h3>Récapitulatif</h3>
        <div class="summary-row"><span>Service</span><strong>{{ devis.type_service }}</strong></div>
        <div class="summary-row"><span>Adresse</span><strong>{{ devis.adresse_service }}</strong></div>
        <div v-if="devis.heures_estimees" class="summary-row"><span>Durée</span><strong>{{ devis.heures_estimees }}h</strong></div>
        <div class="summary-row"><span>Techniciens</span><strong>{{ devis.nb_techniciens }}</strong></div>
        <div class="summary-row total"><span>Total</span><strong>{{ devis.prix }} €</strong></div>
        <p class="payment-note">
          Le paiement sera mis en attente et encaissé uniquement au début de l'intervention.<br>
          Annulation remboursée si effectuée plus de 24h avant le service.
        </p>
      </div>

      <!-- Choix du créneau -->
      <div class="right-col">
        <div v-if="!selectedSlot" class="calendar-card">
          <h3>Choisissez votre créneau</h3>
          <p class="calendar-hint">Cliquez et faites glisser pour sélectionner une plage horaire disponible.</p>
          <AppCalendar
            :selectable="true"
            initialView="timeGridWeek"
            @select="onSlotSelected"
          />
        </div>

        <!-- Slot sélectionné + paiement Stripe -->
        <div v-else class="pay-card">
          <div class="slot-confirmed">
            <h3>Créneau sélectionné</h3>
            <p>{{ formatSlot(selectedSlot) }}</p>
            <button class="btn-change" @click="selectedSlot = null">Changer le créneau</button>
          </div>

          <div class="stripe-section">
            <h3>Paiement sécurisé</h3>
            <div id="card-element" class="stripe-input"></div>
            <p v-if="stripeError" class="form-error">{{ stripeError }}</p>
            <button class="btn-pay" @click="pay" :disabled="payLoading">
              {{ payLoading ? 'Traitement…' : `Payer ${devis.prix} € et confirmer` }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="successMsg" class="form-success">{{ successMsg }}</p>
    <p v-if="globalError" class="form-error">{{ globalError }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadStripe } from '@stripe/stripe-js'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import AppCalendar from '../../../components/shared/AppCalendar.vue'
import { useDevis } from '../../../composables/useDevis.js'
import { useInterventions } from '../../../composables/useInterventions.js'
import { useAuth } from '../../../composables/useAuth.js'

const route  = useRoute()
const router = useRouter()
const { getDevis } = useDevis()
const { createIntervention } = useInterventions()
const { authHeader } = useAuth()

const API = 'http://localhost:3001/api'

const devis        = ref(null)
const loadingDevis = ref(true)
const selectedSlot = ref(null)
const payLoading   = ref(false)
const stripeError  = ref('')
const successMsg   = ref('')
const globalError  = ref('')

let stripe = null, cardElement = null

onMounted(async () => {
  try {
    devis.value = await getDevis(route.params.id)
  } catch (e) {
    globalError.value = e.message
  } finally {
    loadingDevis.value = false
  }
})

async function onSlotSelected(slot) {
  selectedSlot.value = slot
  // Initialiser Stripe
  await initStripe()
}

async function initStripe() {
  const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  if (!pk || pk.startsWith('pk_test_VOTRE')) {
    stripeError.value = 'Clé Stripe non configurée (voir .env)'
    return
  }
  stripe = await loadStripe(pk)
  const elements = stripe.elements()
  cardElement = elements.create('card', {
    style: { base: { fontSize: '16px', color: '#2d1020' } },
  })
  setTimeout(() => cardElement.mount('#card-element'), 100)
}

async function pay() {
  payLoading.value = true
  stripeError.value = ''
  try {
    // Créer le PaymentIntent (paiement différé)
    const piRes = await fetch(`${API}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ devis_id: devis.value.id }),
    })
    const piData = await piRes.json()
    if (!piData.success) throw new Error(piData.error)

    // Confirmer le paiement côté Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(piData.clientSecret, {
      payment_method: { card: cardElement },
    })
    if (error) throw new Error(error.message)
    if (paymentIntent.status !== 'requires_capture') {
      throw new Error('Statut de paiement inattendu : ' + paymentIntent.status)
    }

    // Créer l'intervention en base
    await createIntervention({
      devis_id: devis.value.id,
      date_debut: selectedSlot.value.start,
      date_fin: selectedSlot.value.end,
      stripe_payment_intent_id: paymentIntent.id,
    })

    successMsg.value = 'Paiement enregistré ! Votre intervention est planifiée.'
    setTimeout(() => router.push('/dashboard/client/interventions'), 2500)
  } catch (e) {
    stripeError.value = e.message
  } finally {
    payLoading.value = false
  }
}

function formatSlot(slot) {
  const opts = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }
  const start = new Date(slot.start).toLocaleDateString('fr-FR', opts)
  const end   = new Date(slot.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${start} → ${end}`
}

onUnmounted(() => { if (cardElement) cardElement.destroy() })
</script>

<style scoped>
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.payment-layout { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) { .payment-layout { grid-template-columns: 1fr; } }
.summary-card, .calendar-card, .pay-card {
  background: #fff; border-radius: 12px; padding: 1.8rem;
  border: 1.5px solid #e5e4e7;
}
.summary-card h3, .calendar-card h3, .pay-card h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 1.2rem; }
.summary-row { display: flex; justify-content: space-between; font-size: .9rem; padding: .5rem 0; border-bottom: 1px solid #f0eff2; }
.summary-row.total { font-size: 1.05rem; color: #6D1F3E; font-weight: 700; border-top: 2px solid #6D1F3E; border-bottom: none; margin-top: .5rem; padding-top: .8rem; }
.payment-note { font-size: .82rem; color: #6b6375; margin-top: 1.2rem; line-height: 1.5; }
.calendar-hint { font-size: .88rem; color: #6b6375; margin-bottom: 1rem; }
.slot-confirmed { background: #fdf8f9; border: 1.5px solid #eddde4; border-radius: 10px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.slot-confirmed h3 { font-size: .95rem; margin: 0 0 .5rem; }
.slot-confirmed p { color: #6D1F3E; font-weight: 600; margin: 0 0 .8rem; }
.btn-change { background: none; border: none; color: #6D1F3E; font-size: .85rem; cursor: pointer; text-decoration: underline; }
.stripe-section h3 { font-size: .95rem; margin-bottom: 1rem; }
.stripe-input {
  border: 1.5px solid #e5e4e7; border-radius: 8px; padding: .9rem 1rem; margin-bottom: 1.2rem;
}
.btn-pay {
  width: 100%; padding: .9rem; background: #6D1F3E; color: #fff;
  border: none; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer;
}
.btn-pay:hover:not(:disabled) { background: #5a1830; }
.btn-pay:disabled { opacity: .6; cursor: default; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: .8rem; }
.form-success { color: #2e7d32; background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
</style>
