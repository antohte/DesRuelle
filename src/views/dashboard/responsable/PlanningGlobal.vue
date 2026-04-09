<template>
  <DashboardLayout title="Planning global">
    <div v-if="loading" class="loading">Chargement…</div>
    <div v-else class="calendar-card">
      <AppCalendar
        :events="calendarEvents"
        initialView="timeGridWeek"
        @eventClick="openInterv"
      />
    </div>

    <!-- Légende -->
    <div class="legend">
      <span class="leg-item"><span class="dot" style="background:#6D1F3E"></span>Planifié</span>
      <span class="leg-item"><span class="dot" style="background:#f59e0b"></span>En cours</span>
      <span class="leg-item"><span class="dot" style="background:#2e7d32"></span>Terminé</span>
      <span class="leg-item"><span class="dot" style="background:#e53e3e"></span>Annulé</span>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import AppCalendar from '../../../components/shared/AppCalendar.vue'
import { useInterventions } from '../../../composables/useInterventions.js'

const { interventionsList, loading, fetchInterventions } = useInterventions()
const router = useRouter()

onMounted(() => fetchInterventions())

const colorMap = { planifie: '#6D1F3E', en_cours: '#f59e0b', termine: '#2e7d32', annule: '#e53e3e' }

const calendarEvents = computed(() =>
  interventionsList.value.map(i => ({
    id: String(i.id),
    title: `${i.type_service} — ${i.client_prenom} ${i.client_nom}${i.techniciens_noms ? ' | ' + i.techniciens_noms : ''}`,
    start: i.date_debut,
    end:   i.date_fin,
    backgroundColor: colorMap[i.statut] || '#6D1F3E',
  }))
)

function openInterv(event) {
  router.push(`/dashboard/responsable/interventions/${event.id}/assigner`)
}
</script>

<style scoped>
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.calendar-card { background: #fff; border-radius: 12px; padding: 1rem; border: 1.5px solid #e5e4e7; }
.legend { display: flex; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap; }
.leg-item { display: flex; align-items: center; gap: .5rem; font-size: .85rem; color: #6b6375; }
.dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
</style>
