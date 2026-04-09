<template>
  <DashboardLayout title="Mon planning">
    <div class="planning-wrap">
      <AppCalendar :events="calendarEvents" initialView="timeGridWeek" @eventClick="openInterv" />
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import AppCalendar from '../../../components/shared/AppCalendar.vue'
import { useInterventions } from '../../../composables/useInterventions.js'

const { interventionsList, fetchInterventions } = useInterventions()
const router = useRouter()

onMounted(() => fetchInterventions())

const colorMap = {
  planifie: '#6D1F3E',
  en_cours: '#f59e0b',
  termine:  '#2e7d32',
  annule:   '#e53e3e',
}

const calendarEvents = computed(() =>
  interventionsList.value.map(i => ({
    id: String(i.id),
    title: `${i.type_service} — ${i.client_prenom} ${i.client_nom}`,
    start: i.date_debut,
    end:   i.date_fin,
    backgroundColor: colorMap[i.statut] || '#6D1F3E',
    extendedProps: { intervention: i },
  }))
)

function openInterv(event) {
  router.push(`/dashboard/technicien/interventions/${event.id}`)
}
</script>

<style scoped>
.planning-wrap { background: #fff; border-radius: 12px; padding: 1rem; border: 1.5px solid #e5e4e7; }
</style>
