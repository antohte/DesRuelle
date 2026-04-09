<template>
  <DashboardLayout title="Assigner des techniciens">
    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="interv" class="assign-layout">
      <!-- Infos intervention -->
      <div class="info-card">
        <h3>Intervention</h3>
        <div class="info-grid">
          <span class="lbl">Service</span><span>{{ interv.type_service }}</span>
          <span class="lbl">Client</span><span>{{ interv.client_prenom }} {{ interv.client_nom }}</span>
          <span class="lbl">Date</span><span>{{ formatDate(interv.date_debut) }} → {{ formatHour(interv.date_fin) }}</span>
          <span class="lbl">Techniciens requis</span><strong>{{ interv.nb_techniciens }}</strong>
        </div>
      </div>

      <!-- Techniciens disponibles -->
      <div class="assign-card">
        <h3>Techniciens disponibles sur ce créneau</h3>
        <div v-if="loadingTechs" class="loading">Chargement des disponibilités…</div>
        <div v-else-if="!availableTechs.length" class="empty">Aucun technicien disponible sur ce créneau.</div>
        <div v-else>
          <p class="hint">Sélectionnez {{ interv.nb_techniciens }} technicien(s) :</p>
          <div class="tech-grid">
            <label v-for="t in availableTechs" :key="t.id" class="tech-option" :class="{ selected: selected.includes(t.id) }">
              <input type="checkbox" :value="t.id" v-model="selected" />
              <div class="tech-avatar">{{ t.prenom[0] }}{{ t.nom[0] }}</div>
              <div>
                <p class="tech-name">{{ t.prenom }} {{ t.nom }}</p>
                <p class="tech-contact">{{ t.email }}</p>
              </div>
            </label>
          </div>

          <div class="assign-footer">
            <p v-if="selected.length !== interv.nb_techniciens" class="warn">
              {{ selected.length }}/{{ interv.nb_techniciens }} sélectionné(s)
            </p>
            <button class="btn-primary" :disabled="selected.length !== interv.nb_techniciens || assigning"
              @click="doAssign">
              {{ assigning ? 'Assignation…' : 'Confirmer l\'assignation' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="successMsg" class="form-success">{{ successMsg }}</p>
    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import { useInterventions } from '../../../composables/useInterventions.js'
import { useTechniciens } from '../../../composables/useTechniciens.js'

const route  = useRoute()
const router = useRouter()
const { getIntervention, assignerTechniciens } = useInterventions()
const { fetchDisponibles } = useTechniciens()

const interv         = ref(null)
const availableTechs = ref([])
const selected       = ref([])
const loading        = ref(true)
const loadingTechs   = ref(false)
const assigning      = ref(false)
const successMsg     = ref('')
const errorMsg       = ref('')

onMounted(async () => {
  try {
    interv.value = await getIntervention(route.params.id)
    loadingTechs.value = true
    availableTechs.value = await fetchDisponibles(interv.value.date_debut, interv.value.date_fin)
    // Pré-sélectionner les techniciens déjà assignés
    if (interv.value.techniciens?.length) {
      selected.value = interv.value.techniciens.map(t => t.id)
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
    loadingTechs.value = false
  }
})

async function doAssign() {
  assigning.value = true
  errorMsg.value = ''
  try {
    await assignerTechniciens(interv.value.id, selected.value)
    successMsg.value = 'Techniciens assignés avec succès !'
    setTimeout(() => router.push('/dashboard/responsable/interventions'), 2000)
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    assigning.value = false
  }
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
function formatHour(d) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
</script>

<style scoped>
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.assign-layout { display: flex; flex-direction: column; gap: 1.5rem; }
.info-card, .assign-card { background: #fff; border-radius: 12px; padding: 1.8rem; border: 1.5px solid #e5e4e7; }
h3 { font-size: 1rem; font-weight: 700; color: #2d1020; margin: 0 0 1.2rem; }
.info-grid { display: grid; grid-template-columns: 160px 1fr; gap: .6rem; font-size: .9rem; }
.lbl { color: #6b6375; font-weight: 600; }
.hint { font-size: .9rem; color: #6b6375; margin-bottom: 1rem; }
.empty { color: #6b6375; text-align: center; padding: 2rem; }
.tech-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: .8rem; }
.tech-option {
  display: flex; align-items: center; gap: .9rem;
  padding: .9rem 1rem; border-radius: 10px;
  border: 1.5px solid #e5e4e7; cursor: pointer;
  transition: all .2s; background: #fff;
}
.tech-option:hover { border-color: #6D1F3E; background: #fdf8f9; }
.tech-option.selected { border-color: #6D1F3E; background: #fdf8f9; }
.tech-option input[type=checkbox] { display: none; }
.tech-avatar { width: 38px; height: 38px; border-radius: 50%; background: #6D1F3E; color: #fff; font-weight: 700; font-size: .82rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tech-option.selected .tech-avatar { background: #3d0f22; }
.tech-name { font-size: .9rem; font-weight: 600; color: #2d1020; margin: 0; }
.tech-contact { font-size: .8rem; color: #6b6375; margin: .2rem 0 0; }
.assign-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px solid #f0eff2; }
.warn { font-size: .88rem; color: #e65100; margin: 0; }
.btn-primary { padding: .75rem 1.8rem; background: #6D1F3E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .9rem; }
.btn-primary:hover:not(:disabled) { background: #5a1830; }
.btn-primary:disabled { opacity: .6; cursor: default; }
.form-success { color: #2e7d32; background: #e8f5e9; padding: .8rem 1rem; border-radius: 8px; margin-top: 1rem; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
</style>
