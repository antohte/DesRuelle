<template>
  <DashboardLayout title="Gestion des interventions">
    <div class="filters">
      <button v-for="f in filters" :key="f.value" class="filter-btn" :class="{ active: currentFilter === f.value }" @click="currentFilter = f.value">
        {{ f.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement…</div>
    <div v-else-if="!filtered.length" class="empty">Aucune intervention pour ce filtre.</div>

    <div v-else class="interv-list">
      <div v-for="i in filtered" :key="i.id" class="interv-card">
        <div class="interv-head">
          <div>
            <h3>{{ i.type_service }}</h3>
            <p class="meta">{{ i.client_prenom }} {{ i.client_nom }}</p>
            <p class="meta">{{ formatDate(i.date_debut) }} → {{ formatHour(i.date_fin) }}</p>
          </div>
          <StatusBadge :statut="i.statut" />
        </div>

        <!-- Techniciens -->
        <div class="tech-row">
          <span v-if="i.techniciens_noms" class="tech-info">{{ i.techniciens_noms }}</span>
          <span v-else class="tech-missing">Aucun technicien assigné</span>
          <RouterLink :to="`/dashboard/responsable/interventions/${i.id}/assigner`" class="btn-assign">
            {{ i.techniciens_noms ? 'Modifier assignation' : 'Assigner techniciens' }}
          </RouterLink>
        </div>

        <!-- Changer statut -->
        <div class="statut-actions">
          <button v-if="i.statut === 'planifie'" class="btn-sm purple" @click="changeStatut(i, 'en_cours')">▶ Démarrer</button>
          <button v-if="i.statut === 'en_cours'" class="btn-sm green" @click="changeStatut(i, 'termine')">✓ Terminer</button>
          <span class="progress-info">Avancement : {{ i.progression }}%</span>
        </div>
      </div>
    </div>

    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import { useInterventions } from '../../../composables/useInterventions.js'

const { interventionsList, loading, fetchInterventions, updateStatut } = useInterventions()
const currentFilter = ref('')
const errorMsg = ref('')

const filters = [
  { value: '', label: 'Toutes' },
  { value: 'planifie', label: 'Planifiées' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminées' },
  { value: 'annule', label: 'Annulées' },
]

onMounted(() => fetchInterventions())

const filtered = computed(() =>
  currentFilter.value
    ? interventionsList.value.filter(i => i.statut === currentFilter.value)
    : interventionsList.value
)

async function changeStatut(interv, statut) {
  errorMsg.value = ''
  try {
    await updateStatut(interv.id, statut)
    interv.statut = statut
  } catch (e) { errorMsg.value = e.message }
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
function formatHour(d) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
</script>

<style scoped>
.filters { display: flex; gap: .6rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.filter-btn { padding: .45rem 1.1rem; border-radius: 999px; border: 1.5px solid #e5e4e7; background: #fff; cursor: pointer; font-size: .85rem; font-weight: 500; color: #6b6375; }
.filter-btn.active { background: #6D1F3E; border-color: #6D1F3E; color: #fff; }
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.empty { text-align: center; color: #6b6375; padding: 3rem; background: #fff; border-radius: 12px; border: 1.5px solid #e5e4e7; }
.interv-list { display: flex; flex-direction: column; gap: 1.2rem; }
.interv-card { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.interv-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .8rem; }
.interv-head h3 { font-size: 1.05rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.meta { font-size: .82rem; color: #6b6375; margin: .2rem 0; }
.tech-row { display: flex; align-items: center; justify-content: space-between; padding: .7rem 0; border-top: 1px solid #f0eff2; border-bottom: 1px solid #f0eff2; margin: .5rem 0; }
.tech-info { font-size: .88rem; color: #555; }
.tech-missing { font-size: .88rem; color: #e65100; }
.btn-assign { font-size: .82rem; color: #6D1F3E; text-decoration: none; font-weight: 600; white-space: nowrap; }
.statut-actions { display: flex; align-items: center; gap: 1rem; margin-top: .5rem; }
.btn-sm { padding: .45rem 1rem; border: none; border-radius: 8px; font-weight: 600; font-size: .85rem; cursor: pointer; }
.btn-sm.purple { background: #6D1F3E; color: #fff; }
.btn-sm.purple:hover { background: #5a1830; }
.btn-sm.green { background: #2e7d32; color: #fff; }
.btn-sm.green:hover { background: #1b5e20; }
.progress-info { font-size: .82rem; color: #6b6375; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
</style>
