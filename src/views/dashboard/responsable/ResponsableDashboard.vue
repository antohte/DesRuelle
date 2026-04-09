<template>
  <DashboardLayout title="Tableau de bord">
    <div class="cards">
      <div class="card" @click="router.push('/dashboard/responsable/devis')">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        </div>
        <div>
          <p class="card-val">{{ stats.devis_en_attente }}</p>
          <p class="card-label">Devis en attente</p>
        </div>
      </div>
      <div class="card" @click="router.push('/dashboard/responsable/interventions')">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <div>
          <p class="card-val">{{ stats.interventions_today }}</p>
          <p class="card-label">Interventions aujourd'hui</p>
        </div>
      </div>
      <div class="card" @click="router.push('/dashboard/responsable/interventions?statut=planifie')">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <p class="card-val">{{ stats.interventions_sans_tech }}</p>
          <p class="card-label">Sans technicien assigné</p>
        </div>
      </div>
      <div class="card" @click="router.push('/dashboard/responsable/demandes')">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div>
          <p class="card-val">{{ stats.demandes_en_attente }}</p>
          <p class="card-label">Demandes en attente</p>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Derniers devis -->
      <div class="section">
        <div class="section-header">
          <h3>Devis récents</h3>
          <RouterLink to="/dashboard/responsable/devis" class="see-all">Voir tout →</RouterLink>
        </div>
        <div v-if="!recentDevis.length" class="empty">Aucun devis récent.</div>
        <div v-else class="mini-list">
          <div v-for="d in recentDevis" :key="d.id" class="mini-row">
            <div>
              <p class="mini-title">{{ d.type_service }}</p>
              <p class="mini-sub">{{ d.client_prenom }} {{ d.client_nom }}</p>
            </div>
            <StatusBadge :statut="d.statut" />
          </div>
        </div>
      </div>

      <!-- Interventions aujourd'hui -->
      <div class="section">
        <div class="section-header">
          <h3>Interventions du jour</h3>
          <RouterLink to="/dashboard/responsable/planning" class="see-all">Planning →</RouterLink>
        </div>
        <div v-if="!todayInterv.length" class="empty">Aucune intervention aujourd'hui.</div>
        <div v-else class="mini-list">
          <div v-for="i in todayInterv" :key="i.id" class="mini-row">
            <div>
              <p class="mini-title">{{ i.type_service }} · {{ i.client_prenom }} {{ i.client_nom }}</p>
              <p class="mini-sub">{{ formatHour(i.date_debut) }} – {{ formatHour(i.date_fin) }}</p>
            </div>
            <StatusBadge :statut="i.statut" />
          </div>
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
import { useDevis } from '../../../composables/useDevis.js'
import { useInterventions } from '../../../composables/useInterventions.js'
import { useDemandes } from '../../../composables/useDemandes.js'

const { devisList, fetchDevis }               = useDevis()
const { interventionsList, fetchInterventions } = useInterventions()
const { demandesList, fetchDemandes }          = useDemandes()
const router = useRouter()

onMounted(() => {
  fetchDevis()
  fetchInterventions()
  fetchDemandes({ statut: 'en_attente' })
})

const todayStr = new Date().toLocaleDateString('fr-FR')

const stats = computed(() => ({
  devis_en_attente:      devisList.value.filter(d => d.statut === 'en_attente').length,
  interventions_today:   interventionsList.value.filter(i => new Date(i.date_debut).toLocaleDateString('fr-FR') === todayStr).length,
  interventions_sans_tech: interventionsList.value.filter(i => i.statut === 'planifie' && !i.techniciens_noms).length,
  demandes_en_attente:   demandesList.value.length,
}))

const recentDevis = computed(() => devisList.value.slice(0, 5))

const todayInterv = computed(() =>
  interventionsList.value.filter(i => new Date(i.date_debut).toLocaleDateString('fr-FR') === todayStr)
)

function formatHour(d) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
</script>

<style scoped>
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin-bottom: 2rem; }
.card { background: #fff; border-radius: 12px; padding: 1.4rem; display: flex; align-items: center; gap: 1rem; border: 1.5px solid #e5e4e7; cursor: pointer; transition: box-shadow .2s; }
.card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); }
.card-icon { width: 2.8rem; height: 2.8rem; background: #6D1F3E; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
.card-icon svg { width: 1.4rem; height: 1.4rem; }
.card-val { font-size: 2rem; font-weight: 700; color: #2d1020; margin: 0; }
.card-label { font-size: .85rem; color: #6b6375; margin: 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
.section { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.section-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.see-all { color: #6D1F3E; text-decoration: none; font-size: .88rem; }
.empty { color: #6b6375; font-size: .9rem; }
.mini-list { display: flex; flex-direction: column; gap: .7rem; }
.mini-row { display: flex; justify-content: space-between; align-items: center; padding: .6rem .8rem; border-radius: 8px; background: #fdf8f9; }
.mini-title { font-size: .88rem; font-weight: 600; color: #2d1020; margin: 0; }
.mini-sub { font-size: .8rem; color: #6b6375; margin: .15rem 0 0; }
</style>
