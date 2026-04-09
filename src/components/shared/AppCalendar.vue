<template>
  <div class="calendar-wrap">
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import frLocale from '@fullcalendar/core/locales/fr'

const props = defineProps({
  events:       { type: Array, default: () => [] },
  selectable:   { type: Boolean, default: false },
  initialView:  { type: String, default: 'timeGridWeek' },
  // minTime/maxTime peuvent être surchargés, mais par défaut on cale sur les horaires métier
  minTime:      { type: String, default: '08:00:00' },
  maxTime:      { type: String, default: '17:00:00' },
  // Désactiver les horaires métier (utile pour PlanningGlobal sans restriction)
  businessHours: { type: Boolean, default: true },
  selectConstraint: { type: Object, default: null },
})
const emit = defineEmits(['select', 'eventClick'])

// Plage horaire métier : lun-ven 8h-12h et 13h-17h (pause exclue)
const businessHoursConfig = [
  { daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '12:00' },
  { daysOfWeek: [1, 2, 3, 4, 5], startTime: '13:00', endTime: '17:00' },
]

// Contrainte de sélection : uniquement dans les heures de travail
const defaultSelectConstraint = { businessHours: true }

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  locale: frLocale,
  initialView: props.initialView,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek',
  },
  events: props.events,

  // Horaires d'affichage calés sur 8h-17h
  slotMinTime: props.minTime,
  slotMaxTime: props.maxTime,
  allDaySlot: false,

  // Masquer les week-ends
  weekends: false,

  // Mettre en évidence les heures de travail (fond légèrement coloré)
  businessHours: props.businessHours ? businessHoursConfig : false,

  // Sélection
  selectable: props.selectable,
  selectMirror: true,
  // Si selectable, forcer la sélection dans les heures de travail uniquement
  selectConstraint: props.selectable
    ? (props.selectConstraint ?? defaultSelectConstraint)
    : undefined,

  // Bloquer la sélection sur la pause déjeuner via selectAllow
  selectAllow: props.selectable ? (selectInfo) => {
    const start = selectInfo.start
    const end   = selectInfo.end
    const hStart = start.getHours() + start.getMinutes() / 60
    const hEnd   = end.getHours()   + end.getMinutes()   / 60
    const day    = start.getDay() // 0=dim, 6=sam

    // Refuser les week-ends
    if (day === 0 || day === 6) return false
    // Refuser si ça débute dans la pause ou avant 8h ou après 17h
    if (hStart < 8 || hStart >= 17) return false
    if (hEnd > 17) return false
    // Refuser si ça chevauche la pause 12h-13h
    if (hStart < 13 && hEnd > 12) return false

    return true
  } : undefined,

  height: 'auto',

  // Personnaliser l'apparence des slots de pause (grisés)
  slotLaneClassNames: (arg) => {
    const h = arg.date.getHours()
    if (h === 12) return ['pause-slot']
    return []
  },

  select(info) {
    emit('select', { start: info.startStr, end: info.endStr, startDate: info.start, endDate: info.end })
  },
  eventClick(info) {
    emit('eventClick', info.event)
  },
}))
</script>

<style>
.calendar-wrap { background: #fff; border-radius: 12px; padding: 1rem; }

/* Boutons navigation */
.fc-button-primary { background: #6D1F3E !important; border-color: #6D1F3E !important; }
.fc-button-primary:hover { background: #5a1830 !important; border-color: #5a1830 !important; }
.fc-button-active,
.fc-button-primary:not(:disabled).fc-button-active { background: #3d0f22 !important; border-color: #3d0f22 !important; }

/* Événements */
.fc-event { border-radius: 6px !important; border: none !important; }

/* Plages horaires de travail — fond légèrement violet */
.fc-timegrid-bg-harness .fc-business-hour {
  background: rgba(109, 31, 62, 0.04) !important;
}

/* Slot de pause déjeuner — fond grisé */
.pause-slot {
  background: repeating-linear-gradient(
    45deg,
    rgba(0,0,0,0.03),
    rgba(0,0,0,0.03) 4px,
    transparent 4px,
    transparent 8px
  ) !important;
}

/* Heure courante */
.fc-timegrid-now-indicator-line {
  border-color: #6D1F3E !important;
}
.fc-timegrid-now-indicator-arrow {
  border-top-color: #6D1F3E !important;
  border-bottom-color: #6D1F3E !important;
}
</style>
