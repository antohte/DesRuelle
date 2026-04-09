<template>
  <DashboardLayout title="Suivi de l'intervention">
    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="interv" class="suivi-layout">
      <div class="main-col">
        <!-- En-tête -->
        <div class="card">
          <div class="card-head">
            <div>
              <h2>{{ interv.type_service }}</h2>
              <p class="date-info">{{ formatDate(interv.date_debut) }} → {{ formatHour(interv.date_fin) }}</p>
              <p class="addr">{{ interv.adresse_service || interv.client_adresse }}</p>
            </div>
            <StatusBadge :statut="interv.statut" />
          </div>

          <!-- Progression -->
          <div class="progress-section">
            <div class="progress-header">
              <span>Avancement</span><span>{{ interv.progression }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: interv.progression + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Techniciens -->
        <div class="card">
          <h3>Techniciens assignés</h3>
          <div v-if="!interv.techniciens?.length" class="empty-section">
            Assignation en cours…
          </div>
          <div v-else class="tech-list">
            <div v-for="t in interv.techniciens" :key="t.id" class="tech-row">
              <div class="tech-avatar">{{ t.prenom[0] }}{{ t.nom[0] }}</div>
              <div>
                <p class="tech-name">{{ t.prenom }} {{ t.nom }}</p>
                <a v-if="t.telephone" :href="`tel:${t.telephone}`" class="tech-phone">{{ t.telephone }}</a>
                <p v-else class="tech-phone-pending">Disponible après confirmation</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Laisser un avis (service terminé) -->
        <div v-if="interv.statut === 'termine'" class="card">
          <h3>Votre avis</h3>
          <div v-if="alreadyReviewed" class="reviewed-msg">Vous avez déjà laissé un avis. Merci !</div>
          <form v-else @submit.prevent="submitAvis" class="avis-form">
            <StarRating v-model="avisForm.rating" :interactive="true" />
            <textarea v-model="avisForm.commentaire" placeholder="Votre retour sur l'intervention…" rows="4" required></textarea>
            <button type="submit" class="btn-primary" :disabled="avisLoading">
              {{ avisLoading ? 'Envoi…' : 'Envoyer mon avis' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Sidebar actions -->
      <div class="side-col">
        <div v-if="['planifie','en_cours'].includes(interv.statut)" class="card actions-card">
          <h3>Actions</h3>
          <button class="btn-modify" @click="showModify = true">Modifier l'intervention</button>
          <button class="btn-cancel-interv" @click="showCancel = true">Annuler l'intervention</button>
          <p class="cancel-note">
            Annulation remboursée si effectuée plus de 24h avant l'intervention.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal annulation -->
    <ConfirmModal v-model="showCancel" title="Annuler l'intervention" :danger="true" confirmLabel="Confirmer l'annulation" @confirm="cancelInterv">
      <div class="modal-form">
        <label>Raison de l'annulation *</label>
        <textarea v-model="raison" rows="3" placeholder="Expliquez pourquoi vous souhaitez annuler…" required></textarea>
        <p v-if="hoursLeft < 24" class="warning-note">Moins de 24h avant l'intervention : aucun remboursement.</p>
      </div>
    </ConfirmModal>

    <!-- Modal modification -->
    <ConfirmModal v-model="showModify" title="Modifier l'intervention" confirmLabel="Envoyer la demande" @confirm="modifyInterv">
      <div class="modal-form">
        <label>Raison de la modification *</label>
        <textarea v-model="raison" rows="3" placeholder="Expliquez le changement souhaité…" required></textarea>
        <div class="date-fields">
          <div class="field">
            <label>Nouvelle date/heure de début</label>
            <input type="datetime-local" v-model="newDateDebut" />
          </div>
          <div class="field">
            <label>Nouvelle date/heure de fin</label>
            <input type="datetime-local" v-model="newDateFin" />
          </div>
        </div>
      </div>
    </ConfirmModal>

    <p v-if="actionError" class="form-error">{{ actionError }}</p>
    <p v-if="actionSuccess" class="form-success">{{ actionSuccess }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import StarRating from '../../../components/shared/StarRating.vue'
import ConfirmModal from '../../../components/shared/ConfirmModal.vue'
import { useInterventions } from '../../../composables/useInterventions.js'
import { useDemandes } from '../../../composables/useDemandes.js'
import { useFeedback } from '../../../composables/useFeedback.js'

const route = useRoute()
const { getIntervention } = useInterventions()
const { submitDemande } = useDemandes()
const { submitFeedback } = useFeedback()

const interv  = ref(null)
const loading = ref(true)
const showCancel = ref(false)
const showModify = ref(false)
const raison = ref('')
const newDateDebut = ref('')
const newDateFin = ref('')
const actionError = ref('')
const actionSuccess = ref('')

const avisForm = ref({ rating: 0, commentaire: '' })
const avisLoading = ref(false)
const alreadyReviewed = ref(false)

onMounted(async () => {
  try {
    interv.value = await getIntervention(route.params.id)
  } catch (e) {
    actionError.value = e.message
  } finally {
    loading.value = false
  }
})

const hoursLeft = computed(() => {
  if (!interv.value) return 999
  return (new Date(interv.value.date_debut) - new Date()) / 3600000
})

async function cancelInterv() {
  if (!raison.value.trim()) { actionError.value = 'Raison requise'; return }
  try {
    await submitDemande({ intervention_id: interv.value.id, type: 'annulation', raison: raison.value })
    actionSuccess.value = 'Demande d\'annulation envoyée. En attente de validation.'
    raison.value = ''
  } catch (e) { actionError.value = e.message }
}

async function modifyInterv() {
  if (!raison.value.trim()) { actionError.value = 'Raison requise'; return }
  try {
    await submitDemande({
      intervention_id: interv.value.id,
      type: 'modification',
      raison: raison.value,
      nouvelle_date_debut: newDateDebut.value || undefined,
      nouvelle_date_fin: newDateFin.value || undefined,
    })
    actionSuccess.value = 'Demande de modification envoyée. En attente de validation.'
    raison.value = ''
  } catch (e) { actionError.value = e.message }
}

async function submitAvis() {
  if (!avisForm.value.rating) { actionError.value = 'Donnez une note'; return }
  avisLoading.value = true
  try {
    await submitFeedback({
      intervention_id: interv.value.id,
      type: 'client_sur_service',
      rating: avisForm.value.rating,
      commentaire: avisForm.value.commentaire,
    })
    alreadyReviewed.value = true
    actionSuccess.value = 'Votre avis a été envoyé !'
  } catch (e) { actionError.value = e.message }
  finally { avisLoading.value = false }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}
function formatHour(d) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.suivi-layout { display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) { .suivi-layout { grid-template-columns: 1fr; } }
.card { background: #fff; border-radius: 12px; padding: 1.6rem; border: 1.5px solid #e5e4e7; margin-bottom: 1.2rem; }
.main-col .card:last-child { margin-bottom: 0; }
.card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem; }
.card-head h2 { font-size: 1.15rem; font-weight: 700; color: #2d1020; margin: 0 0 .4rem; }
.date-info, .addr { font-size: .88rem; color: #6b6375; margin: .2rem 0; }
.progress-section { margin-top: .8rem; }
.progress-header { display: flex; justify-content: space-between; font-size: .88rem; margin-bottom: .5rem; color: #6b6375; }
.progress-bar { height: 10px; background: #f0eff2; border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: #6D1F3E; border-radius: 999px; transition: width .5s; }
h3 { font-size: 1rem; font-weight: 700; color: #2d1020; margin: 0 0 1rem; }
.tech-list { display: flex; flex-direction: column; gap: .8rem; }
.tech-row { display: flex; align-items: center; gap: 1rem; }
.tech-avatar { width: 38px; height: 38px; border-radius: 50%; background: #6D1F3E; color: #fff; font-weight: 700; font-size: .85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tech-name { font-size: .9rem; font-weight: 600; color: #2d1020; margin: 0; }
.tech-phone { font-size: .85rem; color: #6D1F3E; text-decoration: none; }
.tech-phone:hover { text-decoration: underline; }
.tech-phone-pending { font-size: .82rem; color: #6b6375; margin: 0; font-style: italic; }
.empty-section { color: #6b6375; font-size: .9rem; font-style: italic; }
.avis-form { display: flex; flex-direction: column; gap: 1rem; }
.avis-form textarea { padding: .75rem; border: 1.5px solid #e5e4e7; border-radius: 8px; font-family: inherit; font-size: .9rem; resize: vertical; }
.avis-form textarea:focus { outline: none; border-color: #6D1F3E; }
.reviewed-msg { color: #2e7d32; font-size: .9rem; }
.actions-card { display: flex; flex-direction: column; gap: .8rem; }
.btn-modify, .btn-cancel-interv {
  width: 100%; padding: .75rem; border-radius: 8px; font-weight: 600; font-size: .9rem; cursor: pointer;
}
.btn-modify { background: #fff; border: 1.5px solid #6D1F3E; color: #6D1F3E; }
.btn-modify:hover { background: #fdf8f9; }
.btn-cancel-interv { background: #fff; border: 1.5px solid #c62828; color: #c62828; }
.btn-cancel-interv:hover { background: #ffebee; }
.cancel-note { font-size: .8rem; color: #6b6375; text-align: center; margin: 0; }
.modal-form label { display: block; font-size: .88rem; font-weight: 600; margin-bottom: .5rem; }
.modal-form textarea { width: 100%; border: 1.5px solid #e5e4e7; border-radius: 8px; padding: .7rem; font-family: inherit; font-size: .9rem; box-sizing: border-box; }
.warning-note { color: #e65100; font-size: .85rem; margin-top: .8rem; }
.date-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
.field label { display: block; font-size: .82rem; font-weight: 600; margin-bottom: .4rem; }
.field input { width: 100%; border: 1.5px solid #e5e4e7; border-radius: 8px; padding: .6rem; box-sizing: border-box; }
.btn-primary { padding: .75rem 1.6rem; background: #6D1F3E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:hover:not(:disabled) { background: #5a1830; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
.form-success { color: #2e7d32; background: #e8f5e9; padding: .8rem 1rem; border-radius: 8px; margin-top: 1rem; }
</style>
