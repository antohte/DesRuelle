<template>
  <DashboardLayout title="Mon tableau de bord">
    <div class="welcome">
      <h2>Bonjour, {{ currentUser?.prenom }}</h2>
      <p>Voici vos interventions du jour et de la semaine.</p>
    </div>

    <div class="cards">
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <p class="card-val">{{ today.length }}</p>
          <p class="card-label">Aujourd'hui</p>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        </div>
        <div>
          <p class="card-val">{{ week.length }}</p>
          <p class="card-label">Cette semaine</p>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <div>
          <p class="card-val">{{ done.length }}</p>
          <p class="card-label">Terminées</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>Interventions aujourd'hui</h3>
        <RouterLink to="/dashboard/technicien/planning" class="see-all">Planning complet →</RouterLink>
      </div>
      <div v-if="loading" class="loading">Chargement…</div>
      <div v-else-if="!today.length" class="empty">Aucune intervention aujourd'hui.</div>
      <div v-else class="interv-list">
        <div v-for="i in today" :key="i.id" class="interv-row" @click="router.push(`/dashboard/technicien/interventions/${i.id}`)">
          <div class="interv-time">{{ formatHour(i.date_debut) }} – {{ formatHour(i.date_fin) }}</div>
          <div class="interv-info">
            <p class="interv-service">{{ i.type_service }}</p>
            <p class="interv-client">{{ i.client_prenom }} {{ i.client_nom }} · {{ i.client_adresse }}</p>
          </div>
          <StatusBadge :statut="i.statut" />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import { useAuth } from '../../../composables/useAuth.js'
import { useInterventions } from '../../../composables/useInterventions.js'

const { currentUser } = useAuth()
const { interventionsList, loading, fetchInterventions } = useInterventions()
const router = useRouter()

onMounted(() => fetchInterventions())

const todayStr = new Date().toLocaleDateString('fr-FR')

const today = computed(() => interventionsList.value.filter(i =>
  new Date(i.date_debut).toLocaleDateString('fr-FR') === todayStr &&
  !['annule'].includes(i.statut)
))

const week = computed(() => {
  const now = new Date()
  const end = new Date(now); end.setDate(end.getDate() + 7)
  return interventionsList.value.filter(i => {
    const d = new Date(i.date_debut)
    return d >= now && d <= end && !['annule'].includes(i.statut)
  })
})

const done = computed(() => interventionsList.value.filter(i => i.statut === 'termine'))

function formatHour(d) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.welcome { margin-bottom: 2rem; }
.welcome h2 { font-size: 1.4rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.welcome p { color: #6b6375; margin: 0; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem; }
.card { background: #fff; border-radius: 12px; padding: 1.4rem; display: flex; align-items: center; gap: 1rem; border: 1.5px solid #e5e4e7; }
.card-icon { width: 2.8rem; height: 2.8rem; background: #6D1F3E; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
.card-icon svg { width: 1.4rem; height: 1.4rem; }
.card-val { font-size: 2rem; font-weight: 700; color: #2d1020; margin: 0; }
.card-label { font-size: .85rem; color: #6b6375; margin: 0; }
.section { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.section-header h3 { font-size: 1.05rem; font-weight: 700; margin: 0; }
.see-all { color: #6D1F3E; text-decoration: none; font-size: .9rem; }
.loading, .empty { color: #6b6375; padding: 2rem; text-align: center; }
.interv-list { display: flex; flex-direction: column; gap: .8rem; }
.interv-row { display: flex; align-items: center; gap: 1rem; padding: .9rem 1rem; border-radius: 8px; cursor: pointer; transition: background .15s; border: 1px solid #f0eff2; }
.interv-row:hover { background: #fdf8f9; }
.interv-time { font-size: .85rem; font-weight: 700; color: #6D1F3E; white-space: nowrap; min-width: 100px; }
.interv-info { flex: 1; }
.interv-service { font-size: .9rem; font-weight: 600; color: #2d1020; margin: 0; }
.interv-client { font-size: .82rem; color: #6b6375; margin: .15rem 0 0; }
</style>
