<template>
  <DashboardLayout title="Demandes d'annulation / modification">
    <div class="filters">
      <button v-for="f in filters" :key="f.value" class="filter-btn" :class="{ active: currentFilter === f.value }" @click="setFilter(f.value)">
        {{ f.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement…</div>
    <div v-else-if="!filtered.length" class="empty">Aucune demande.</div>

    <div v-else class="demandes-list">
      <div v-for="d in filtered" :key="d.id" class="demande-card">
        <div class="demande-head">
          <div>
            <span class="type-badge" :class="d.type">{{ d.type === 'annulation' ? 'Annulation' : 'Modification' }}</span>
            <h3>{{ d.type_service }}</h3>
            <p class="meta">{{ d.demandeur_prenom }} {{ d.demandeur_nom }} ({{ d.demandeur_role }})</p>
            <p class="meta">Intervention : {{ formatDate(d.date_debut) }} → {{ formatHour(d.date_fin) }}</p>
          </div>
          <StatusBadge :statut="d.statut" />
        </div>

        <div class="raison-box">
          <strong>Raison :</strong> {{ d.raison }}
        </div>

        <div v-if="d.nouvelle_date_debut" class="new-date">
          Nouvelles dates demandées : {{ formatDate(d.nouvelle_date_debut) }} → {{ formatHour(d.nouvelle_date_fin) }}
        </div>

        <div v-if="d.remboursement" class="refund-info">
          Remboursement applicable (+ de 24h avant le service)
        </div>

        <div v-if="d.statut === 'en_attente'" class="demande-actions">
          <button class="btn-approve" @click="approve(d)" :disabled="actionLoading === d.id">
            ✓ Approuver
          </button>
          <button class="btn-refuse-dm" @click="refuse(d)" :disabled="actionLoading === d.id">
            ✗ Refuser
          </button>
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
import { useDemandes } from '../../../composables/useDemandes.js'

const { demandesList, loading, fetchDemandes, approuverDemande, refuserDemande } = useDemandes()
const currentFilter = ref('en_attente')
const actionLoading = ref(null)
const errorMsg = ref('')

const filters = [
  { value: '', label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'approuve', label: 'Approuvées' },
  { value: 'refuse', label: 'Refusées' },
]

onMounted(() => fetchDemandes())

const filtered = computed(() =>
  currentFilter.value
    ? demandesList.value.filter(d => d.statut === currentFilter.value)
    : demandesList.value
)

function setFilter(v) { currentFilter.value = v }

async function approve(d) {
  actionLoading.value = d.id
  errorMsg.value = ''
  try {
    await approuverDemande(d.id)
    d.statut = 'approuve'
  } catch (e) { errorMsg.value = e.message }
  finally { actionLoading.value = null }
}

async function refuse(d) {
  actionLoading.value = d.id
  errorMsg.value = ''
  try {
    await refuserDemande(d.id)
    d.statut = 'refuse'
  } catch (e) { errorMsg.value = e.message }
  finally { actionLoading.value = null }
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
.demandes-list { display: flex; flex-direction: column; gap: 1.2rem; }
.demande-card { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.demande-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .8rem; }
.type-badge { display: inline-block; font-size: .8rem; font-weight: 700; padding: .2rem .7rem; border-radius: 999px; margin-bottom: .5rem; }
.type-badge.annulation { background: #ffebee; color: #c62828; }
.type-badge.modification { background: #e3f2fd; color: #1565c0; }
h3 { font-size: 1rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.meta { font-size: .82rem; color: #6b6375; margin: .2rem 0; }
.raison-box { background: #fdf8f9; border-radius: 8px; padding: .8rem 1rem; font-size: .88rem; color: #555; margin: .8rem 0; }
.new-date { font-size: .85rem; color: #1565c0; background: #e3f2fd; padding: .5rem .9rem; border-radius: 8px; margin-bottom: .6rem; }
.refund-info { font-size: .85rem; color: #2e7d32; background: #e8f5e9; padding: .5rem .9rem; border-radius: 8px; margin-bottom: .6rem; }
.demande-actions { display: flex; gap: .8rem; margin-top: .8rem; }
.btn-approve { padding: .6rem 1.4rem; background: #2e7d32; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-approve:hover { background: #1b5e20; }
.btn-refuse-dm { padding: .6rem 1.4rem; background: #fff; color: #c62828; border: 1.5px solid #c62828; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-refuse-dm:hover { background: #ffebee; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
</style>
