<template>
  <DashboardLayout title="Mon espace">
    <div class="welcome">
      <h2>Bonjour, {{ currentUser?.prenom }}</h2>
      <p>Bienvenue dans votre espace client Desruelle.</p>
    </div>

    <div class="cards">
      <div class="card">
        <div class="card-icon purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        </div>
        <div>
          <p class="card-val">{{ stats.devis_en_attente }}</p>
          <p class="card-label">Devis en attente</p>
        </div>
      </div>
      <div class="card">
        <div class="card-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <div>
          <p class="card-val">{{ stats.devis_valides }}</p>
          <p class="card-label">Devis à accepter</p>
        </div>
      </div>
      <div class="card">
        <div class="card-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <div>
          <p class="card-val">{{ stats.interventions_actives }}</p>
          <p class="card-label">Interventions actives</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>Mes derniers devis</h3>
        <RouterLink to="/dashboard/client/devis" class="see-all">Voir tout →</RouterLink>
      </div>
      <div v-if="loading" class="loading">Chargement…</div>
      <div v-else-if="!devisList.length" class="empty">
        Vous n'avez pas encore de devis.
        <RouterLink to="/dashboard/client/devis/nouveau">Faire une demande</RouterLink>
      </div>
      <table v-else class="table">
        <thead><tr><th>Service</th><th>Statut</th><th>Date</th><th></th></tr></thead>
        <tbody>
          <tr v-for="d in devisList.slice(0,5)" :key="d.id">
            <td>{{ d.type_service }}</td>
            <td><StatusBadge :statut="d.statut" /></td>
            <td>{{ formatDate(d.created_at) }}</td>
            <td>
              <RouterLink :to="`/dashboard/client/devis`" class="btn-sm">Voir</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import { useAuth } from '../../../composables/useAuth.js'
import { useDevis } from '../../../composables/useDevis.js'

const { currentUser } = useAuth()
const { devisList, loading, fetchDevis } = useDevis()

onMounted(() => fetchDevis())

const stats = computed(() => ({
  devis_en_attente:     devisList.value.filter(d => d.statut === 'en_attente').length,
  devis_valides:        devisList.value.filter(d => d.statut === 'valide').length,
  interventions_actives: devisList.value.filter(d => ['accepte_client'].includes(d.statut)).length,
}))

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.welcome { margin-bottom: 2rem; }
.welcome h2 { font-size: 1.4rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.welcome p { color: #6b6375; margin: 0; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem; }
.card {
  background: #fff; border-radius: 12px; padding: 1.4rem;
  display: flex; align-items: center; gap: 1rem;
  border: 1.5px solid #e5e4e7; box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.card-icon { width: 2.8rem; height: 2.8rem; background: #6D1F3E; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
.card-icon svg { width: 1.4rem; height: 1.4rem; }
.card-val { font-size: 2rem; font-weight: 700; color: #2d1020; margin: 0; }
.card-label { font-size: .85rem; color: #6b6375; margin: 0; }
.section { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.section-header h3 { font-size: 1.05rem; font-weight: 700; color: #2d1020; margin: 0; }
.see-all { color: #6D1F3E; text-decoration: none; font-size: .9rem; }
.loading, .empty { color: #6b6375; text-align: center; padding: 2rem; }
.empty a { color: #6D1F3E; }
.table { width: 100%; border-collapse: collapse; font-size: .9rem; }
.table th { text-align: left; padding: .6rem .8rem; color: #6b6375; font-size: .8rem; border-bottom: 1.5px solid #e5e4e7; }
.table td { padding: .75rem .8rem; border-bottom: 1px solid #f0eff2; }
.btn-sm { color: #6D1F3E; text-decoration: none; font-size: .85rem; font-weight: 600; }
</style>
