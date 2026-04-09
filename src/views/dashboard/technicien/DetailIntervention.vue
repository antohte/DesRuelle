<template>
  <DashboardLayout title="Détail intervention">
    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="interv" class="detail-layout">
      <div class="main-col">
        <!-- Infos -->
        <div class="card">
          <div class="card-head">
            <div>
              <h2>{{ interv.type_service }}</h2>
              <p class="meta">{{ formatDate(interv.date_debut) }} → {{ formatHour(interv.date_fin) }}</p>
              <p class="meta">{{ interv.heures_estimees }}h estimées · {{ interv.nb_techniciens }} technicien(s)</p>
            </div>
            <StatusBadge :statut="interv.statut" />
          </div>
          <div class="desc-box">
            <h4>Description</h4>
            <p>{{ interv.description }}</p>
          </div>
        </div>

        <!-- Client -->
        <div class="card">
          <h3>Client</h3>
          <div class="info-grid">
            <span class="info-label">Nom</span>
            <span>{{ interv.client_prenom }} {{ interv.client_nom }}</span>
            <span class="info-label">Téléphone</span>
            <a :href="`tel:${interv.client_telephone}`">{{ interv.client_telephone }}</a>
            <span class="info-label">Email</span>
            <a :href="`mailto:${interv.client_email}`">{{ interv.client_email }}</a>
            <span class="info-label">Adresse</span>
            <span>{{ interv.client_adresse }}</span>
          </div>
        </div>

        <!-- Avancement -->
        <div v-if="interv.statut === 'en_cours'" class="card">
          <h3>Mettre à jour l'avancement</h3>
          <div class="progress-wrap">
            <input type="range" v-model="progression" min="0" max="100" step="5" />
            <span class="prog-value">{{ progression }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progression + '%' }"></div>
          </div>
          <button class="btn-primary mt" @click="saveProgression" :disabled="progLoading">
            {{ progLoading ? 'Sauvegarde…' : 'Enregistrer' }}
          </button>
        </div>

        <!-- Avis technicien -->
        <div v-if="interv.statut === 'termine'" class="card">
          <h3>Laisser un avis</h3>
          <div v-if="feedbackSent" class="reviewed-msg">Avis envoyé !</div>
          <form v-else @submit.prevent="sendFeedback" class="avis-form">
            <p class="avis-label">Avis sur le client</p>
            <StarRating v-model="fbClient.rating" :interactive="true" />
            <textarea v-model="fbClient.commentaire" placeholder="Votre retour sur le client…" rows="3" required></textarea>

            <p class="avis-label">Avis sur le service</p>
            <StarRating v-model="fbService.rating" :interactive="true" />
            <textarea v-model="fbService.commentaire" placeholder="Votre retour sur le service effectué…" rows="3" required></textarea>

            <button type="submit" class="btn-primary" :disabled="fbLoading">
              {{ fbLoading ? 'Envoi…' : 'Envoyer mes avis' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Actions -->
      <div class="side-col">
        <div class="card actions-card">
          <h3>Actions</h3>
          <button v-if="interv.statut === 'planifie'" class="btn-action" @click="showCancel = true">
            Demander l'annulation
          </button>
          <button v-if="interv.statut === 'planifie'" class="btn-action modify" @click="showModify = true">
            Demander une modification
          </button>
          <RouterLink to="/dashboard/technicien/planning" class="btn-back">← Retour au planning</RouterLink>
        </div>
      </div>
    </div>

    <ConfirmModal v-model="showCancel" title="Demande d'annulation" :danger="true" confirmLabel="Envoyer la demande" @confirm="submitCancel">
      <div class="modal-form">
        <label>Raison *</label>
        <textarea v-model="raison" rows="3" placeholder="Raison de l'annulation…"></textarea>
      </div>
    </ConfirmModal>

    <ConfirmModal v-model="showModify" title="Demande de modification" confirmLabel="Envoyer la demande" @confirm="submitModify">
      <div class="modal-form">
        <label>Raison *</label>
        <textarea v-model="raison" rows="3" placeholder="Raison de la modification…"></textarea>
      </div>
    </ConfirmModal>

    <p v-if="actionMsg" class="action-msg" :class="{ error: actionError }">{{ actionMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import StarRating from '../../../components/shared/StarRating.vue'
import ConfirmModal from '../../../components/shared/ConfirmModal.vue'
import { useInterventions } from '../../../composables/useInterventions.js'
import { useDemandes } from '../../../composables/useDemandes.js'
import { useFeedback } from '../../../composables/useFeedback.js'

const route = useRoute()
const { getIntervention, updateProgression } = useInterventions()
const { submitDemande } = useDemandes()
const { submitFeedback } = useFeedback()

const interv = ref(null)
const loading = ref(true)
const progression = ref(0)
const progLoading = ref(false)
const showCancel = ref(false)
const showModify = ref(false)
const raison = ref('')
const actionMsg = ref('')
const actionError = ref(false)

const fbClient  = ref({ rating: 0, commentaire: '' })
const fbService = ref({ rating: 0, commentaire: '' })
const fbLoading = ref(false)
const feedbackSent = ref(false)

onMounted(async () => {
  try {
    interv.value = await getIntervention(route.params.id)
    progression.value = interv.value.progression || 0
  } catch (e) {
    actionMsg.value = e.message; actionError.value = true
  } finally { loading.value = false }
})

async function saveProgression() {
  progLoading.value = true
  try {
    await updateProgression(interv.value.id, progression.value)
    actionMsg.value = 'Avancement mis à jour.'
    actionError.value = false
  } catch (e) { actionMsg.value = e.message; actionError.value = true }
  finally { progLoading.value = false }
}

async function submitCancel() {
  if (!raison.value.trim()) { actionMsg.value = 'Raison requise'; actionError.value = true; return }
  try {
    await submitDemande({ intervention_id: interv.value.id, type: 'annulation', raison: raison.value })
    actionMsg.value = 'Demande d\'annulation envoyée.'
    actionError.value = false; raison.value = ''
  } catch (e) { actionMsg.value = e.message; actionError.value = true }
}

async function submitModify() {
  if (!raison.value.trim()) { actionMsg.value = 'Raison requise'; actionError.value = true; return }
  try {
    await submitDemande({ intervention_id: interv.value.id, type: 'modification', raison: raison.value })
    actionMsg.value = 'Demande de modification envoyée.'
    actionError.value = false; raison.value = ''
  } catch (e) { actionMsg.value = e.message; actionError.value = true }
}

async function sendFeedback() {
  fbLoading.value = true
  try {
    await submitFeedback({ intervention_id: interv.value.id, type: 'technicien_sur_client', rating: fbClient.value.rating, commentaire: fbClient.value.commentaire, cible_id: interv.value.client_id })
    await submitFeedback({ intervention_id: interv.value.id, type: 'technicien_sur_service', rating: fbService.value.rating, commentaire: fbService.value.commentaire })
    feedbackSent.value = true
  } catch (e) { actionMsg.value = e.message; actionError.value = true }
  finally { fbLoading.value = false }
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
function formatHour(d) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
</script>

<style scoped>
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.detail-layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) { .detail-layout { grid-template-columns: 1fr; } }
.card { background: #fff; border-radius: 12px; padding: 1.6rem; border: 1.5px solid #e5e4e7; margin-bottom: 1.2rem; }
.card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.card-head h2 { font-size: 1.15rem; font-weight: 700; color: #2d1020; margin: 0 0 .4rem; }
.meta { font-size: .85rem; color: #6b6375; margin: .2rem 0; }
.desc-box h4 { font-size: .88rem; font-weight: 700; color: #6b6375; margin: 0 0 .4rem; }
.desc-box p { font-size: .9rem; color: #555; margin: 0; }
h3 { font-size: 1rem; font-weight: 700; color: #2d1020; margin: 0 0 1rem; }
.info-grid { display: grid; grid-template-columns: 120px 1fr; gap: .5rem; font-size: .9rem; }
.info-label { color: #6b6375; font-weight: 600; }
.progress-wrap { display: flex; align-items: center; gap: 1rem; margin-bottom: .8rem; }
.progress-wrap input[type=range] { flex: 1; accent-color: #6D1F3E; }
.prog-value { font-weight: 700; color: #6D1F3E; min-width: 40px; }
.progress-bar { height: 8px; background: #f0eff2; border-radius: 999px; overflow: hidden; margin-bottom: 1rem; }
.progress-fill { height: 100%; background: #6D1F3E; border-radius: 999px; transition: width .3s; }
.avis-form { display: flex; flex-direction: column; gap: .8rem; }
.avis-label { font-size: .88rem; font-weight: 700; color: #2d1020; margin: .5rem 0 .3rem; }
.avis-form textarea { padding: .7rem; border: 1.5px solid #e5e4e7; border-radius: 8px; font-family: inherit; font-size: .9rem; resize: vertical; }
.reviewed-msg { color: #2e7d32; font-size: .9rem; }
.actions-card { display: flex; flex-direction: column; gap: .8rem; }
.btn-action, .btn-back { width: 100%; padding: .7rem; border-radius: 8px; font-weight: 600; font-size: .88rem; cursor: pointer; text-align: center; text-decoration: none; display: block; box-sizing: border-box; }
.btn-action { background: #fff; border: 1.5px solid #c62828; color: #c62828; }
.btn-action.modify { border-color: #6D1F3E; color: #6D1F3E; }
.btn-action:hover { background: #ffebee; }
.btn-action.modify:hover { background: #fdf8f9; }
.btn-back { background: #fdf8f9; border: 1.5px solid #e5e4e7; color: #6b6375; }
.btn-back:hover { background: #e5e4e7; }
.btn-primary { padding: .75rem 1.6rem; background: #6D1F3E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .9rem; }
.btn-primary:hover:not(:disabled) { background: #5a1830; }
.btn-primary.mt { margin-top: .5rem; }
.action-msg { margin-top: 1rem; font-size: .88rem; color: #2e7d32; }
.action-msg.error { color: #e53e3e; }
.modal-form label { display: block; font-size: .88rem; font-weight: 600; margin-bottom: .5rem; }
.modal-form textarea { width: 100%; border: 1.5px solid #e5e4e7; border-radius: 8px; padding: .7rem; font-family: inherit; box-sizing: border-box; }
</style>
