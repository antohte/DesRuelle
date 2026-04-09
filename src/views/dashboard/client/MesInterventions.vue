<template>
  <DashboardLayout title="Mes interventions">
    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="!interventionsList.length" class="empty-state">
      <p>Aucune intervention pour le moment.</p>
      <RouterLink to="/dashboard/client/devis" class="btn-primary">Voir mes devis</RouterLink>
    </div>

    <div v-else class="interventions-list">
      <div v-for="i in interventionsList" :key="i.id" class="interv-card" @click="router.push(`/dashboard/client/interventions/${i.id}`)">
        <div class="interv-head">
          <div>
            <h3>{{ i.type_service }}</h3>
            <p class="interv-date">
              {{ formatDate(i.date_debut) }} → {{ formatHour(i.date_fin) }}
            </p>
          </div>
          <StatusBadge :statut="i.statut" />
        </div>

        <div class="interv-body">
          <div v-if="i.techniciens_noms" class="tech-info">
            {{ i.techniciens_noms }}
          </div>
          <div v-else class="tech-pending">Techniciens en cours d'assignation</div>

          <!-- Progression -->
          <div v-if="i.statut === 'en_cours'" class="progress-wrap">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: i.progression + '%' }"></div>
            </div>
            <span>{{ i.progression }}%</span>
          </div>

          <!-- Stripe -->
          <div class="stripe-status">
            <span v-if="i.stripe_statut === 'en_attente'">Paiement en attente</span>
            <span v-if="i.stripe_statut === 'capture'" class="captured">Paiement encaissé</span>
            <span v-if="i.stripe_statut === 'rembourse'" class="refunded">Remboursé</span>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import { useInterventions } from '../../../composables/useInterventions.js'

const { interventionsList, loading, fetchInterventions } = useInterventions()
const router = useRouter()

onMounted(() => fetchInterventions())

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function formatHour(d) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.empty-state { text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 12px; border: 1.5px solid #e5e4e7; }
.empty-state p { color: #6b6375; margin-bottom: 1.5rem; }
.interventions-list { display: flex; flex-direction: column; gap: 1.2rem; }
.interv-card {
  background: #fff; border-radius: 12px; padding: 1.5rem;
  border: 1.5px solid #e5e4e7; cursor: pointer;
  transition: box-shadow .2s, border-color .2s;
}
.interv-card:hover { box-shadow: 0 4px 20px rgba(109,31,62,.1); border-color: #6D1F3E; }
.interv-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.interv-head h3 { font-size: 1.05rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.interv-date { font-size: .85rem; color: #6b6375; margin: 0; }
.interv-body { display: flex; flex-direction: column; gap: .7rem; }
.tech-info { font-size: .88rem; color: #555; }
.tech-pending { font-size: .88rem; color: #6b6375; font-style: italic; }
.progress-wrap { display: flex; align-items: center; gap: .8rem; }
.progress-bar { flex: 1; height: 8px; background: #f0eff2; border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: #6D1F3E; border-radius: 999px; transition: width .3s; }
.stripe-status { font-size: .82rem; color: #6b6375; }
.captured { color: #2e7d32; }
.refunded { color: #e53e3e; }
.btn-primary { display: inline-block; padding: .7rem 1.6rem; background: #6D1F3E; color: #fff; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: .9rem; }
</style>
