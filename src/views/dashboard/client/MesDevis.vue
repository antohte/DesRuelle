<template>
  <DashboardLayout title="Mes devis">
    <div class="page-actions">
      <RouterLink to="/dashboard/client/devis/nouveau" class="btn-primary">+ Nouveau devis</RouterLink>
    </div>

    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="!devisList.length" class="empty-state">
      <p>Vous n'avez pas encore de devis.</p>
      <RouterLink to="/dashboard/client/devis/nouveau" class="btn-primary">Faire ma première demande</RouterLink>
    </div>

    <div v-else class="devis-list">
      <div v-for="d in devisList" :key="d.id" class="devis-card">
        <div class="devis-head">
          <div>
            <h3>{{ d.type_service }}</h3>
            <p class="devis-date">Soumis le {{ formatDate(d.created_at) }}</p>
          </div>
          <StatusBadge :statut="d.statut" />
        </div>

        <p class="devis-desc">{{ d.description }}</p>

        <!-- Récurrence -->
        <div v-if="d.recurrence !== 'unique'" class="devis-tag">
          {{ recurrenceLabel(d.recurrence) }}{{ d.recurrence_detail ? ' — ' + d.recurrence_detail : '' }}
        </div>

        <!-- Résultat validation responsable -->
        <div v-if="d.statut === 'valide'" class="validation-box">
          <div class="validation-row">
            <span>Prix estimé</span><strong>{{ d.prix }} €</strong>
          </div>
          <div v-if="d.heures_estimees" class="validation-row">
            <span>Durée estimée</span><strong>{{ d.heures_estimees }}h</strong>
          </div>
          <div class="validation-row">
            <span>Techniciens</span><strong>{{ d.nb_techniciens }}</strong>
          </div>
          <div v-if="d.note_responsable" class="note-resp">
            <strong>Note du responsable :</strong> {{ d.note_responsable }}
          </div>

          <div class="devis-actions">
            <button class="btn-accept" @click="accept(d)" :disabled="actionLoading === d.id">
              ✓ Accepter
            </button>
            <button class="btn-refuse" @click="refuse(d)" :disabled="actionLoading === d.id">
              ✗ Refuser
            </button>
          </div>
        </div>

        <div v-if="d.statut === 'refuse' && d.note_responsable" class="refus-note">
          <strong>Motif de refus :</strong> {{ d.note_responsable }}
        </div>

        <!-- Aller au paiement si accepté -->
        <div v-if="d.statut === 'accepte_client'" class="next-step">
          <RouterLink :to="`/dashboard/client/paiement/${d.id}`" class="btn-primary">
            → Choisir mon créneau et payer
          </RouterLink>
        </div>
      </div>
    </div>

    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import { useDevis } from '../../../composables/useDevis.js'

const { devisList, loading, fetchDevis, accepterDevis, refuserDevisClient } = useDevis()
const actionLoading = ref(null)
const errorMsg = ref('')

onMounted(() => fetchDevis())

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function recurrenceLabel(r) {
  return { hebdomadaire: 'Hebdomadaire', mensuel: 'Mensuel', personnalise: 'Personnalisé' }[r] || r
}

async function accept(d) {
  actionLoading.value = d.id
  errorMsg.value = ''
  try {
    await accepterDevis(d.id)
    d.statut = 'accepte_client'
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}

async function refuse(d) {
  actionLoading.value = d.id
  errorMsg.value = ''
  try {
    await refuserDevisClient(d.id)
    d.statut = 'refuse_client'
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}
</script>

<style scoped>
.page-actions { display: flex; justify-content: flex-end; margin-bottom: 1.5rem; }
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.empty-state { text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 12px; border: 1.5px solid #e5e4e7; }
.empty-state p { color: #6b6375; margin-bottom: 1.5rem; }
.devis-list { display: flex; flex-direction: column; gap: 1.2rem; }
.devis-card { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.devis-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .8rem; }
.devis-head h3 { font-size: 1.05rem; font-weight: 700; color: #2d1020; margin: 0 0 .25rem; }
.devis-date { font-size: .82rem; color: #6b6375; margin: 0; }
.devis-desc { color: #6b6375; font-size: .9rem; margin: 0 0 .8rem; }
.devis-tag { display: inline-block; background: #fdf0f4; color: #6D1F3E; font-size: .8rem; padding: .3rem .8rem; border-radius: 999px; margin-bottom: .8rem; }
.validation-box { background: #fdf8f9; border: 1.5px solid #eddde4; border-radius: 10px; padding: 1.2rem; margin-top: .8rem; }
.validation-row { display: flex; justify-content: space-between; font-size: .9rem; margin-bottom: .5rem; }
.note-resp { font-size: .88rem; color: #6b6375; margin-top: .8rem; padding-top: .8rem; border-top: 1px solid #eddde4; }
.devis-actions { display: flex; gap: .8rem; margin-top: 1.2rem; }
.btn-accept { padding: .6rem 1.4rem; background: #2e7d32; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-accept:hover { background: #1b5e20; }
.btn-refuse { padding: .6rem 1.4rem; background: #fff; color: #c62828; border: 1.5px solid #c62828; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-refuse:hover { background: #ffebee; }
.refus-note { background: #ffebee; border-radius: 8px; padding: .8rem 1rem; margin-top: .8rem; font-size: .88rem; color: #c62828; }
.next-step { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f0eff2; }
.btn-primary { display: inline-block; padding: .7rem 1.6rem; background: #6D1F3E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .9rem; text-decoration: none; }
.btn-primary:hover { background: #5a1830; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
</style>
