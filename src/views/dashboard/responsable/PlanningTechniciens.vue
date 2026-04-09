<template>
  <DashboardLayout title="Planning des techniciens">

    <!-- Sélection du technicien -->
    <div class="toolbar">
      <div class="field">
        <label>Technicien</label>
        <select v-model="selectedTechId" @change="load">
          <option value="">-- Tous --</option>
          <option v-for="t in techniciens" :key="t.id" :value="t.id">
            {{ t.prenom }} {{ t.nom }}
          </option>
        </select>
      </div>
      <button class="btn-add" @click="showForm = true">+ Déclarer une absence</button>
    </div>

    <!-- Légende horaires -->
    <div class="horaires-info">
      Horaires de travail : <strong>Lundi – Vendredi, 8h – 17h</strong>
      (pause déjeuner 12h – 13h)
    </div>

    <!-- Calendrier -->
    <div class="calendar-card">
      <AppCalendar
        :events="calendarEvents"
        initialView="timeGridWeek"
        :minTime="'08:00:00'"
        :maxTime="'17:00:00'"
        @eventClick="openEvent"
      />
    </div>

    <!-- Liste des absences déclarées -->
    <div class="absences-section">
      <h3>Absences déclarées{{ selectedTech ? ' — ' + selectedTech.prenom + ' ' + selectedTech.nom : '' }}</h3>
      <div v-if="!absences.length" class="empty">Aucune absence déclarée.</div>
      <div v-else class="absences-list">
        <div v-for="a in absences" :key="a.id" class="absence-row">
          <div class="absence-who">
            <div class="avatar">{{ a.prenom[0] }}{{ a.nom[0] }}</div>
            <span>{{ a.prenom }} {{ a.nom }}</span>
          </div>
          <div class="absence-info">
            <span class="type-badge" :class="a.type">{{ typeLabel(a.type) }}</span>
            <span class="dates">{{ formatDate(a.date_debut) }} → {{ formatDate(a.date_fin) }}</span>
            <span v-if="a.note" class="note">{{ a.note }}</span>
          </div>
          <button class="btn-delete" @click="deleteAbsence(a)" title="Supprimer">✕</button>
        </div>
      </div>
    </div>

    <!-- Modal déclaration absence -->
    <Teleport to="body">
      <div v-if="showForm" class="overlay" @click.self="showForm = false">
        <div class="modal">
          <h3>Déclarer une absence</h3>
          <form @submit.prevent="submitAbsence" class="form">

            <div class="field">
              <label>Technicien *</label>
              <select v-model="form.technicien_id" required>
                <option value="">-- Choisir --</option>
                <option v-for="t in techniciens" :key="t.id" :value="t.id">
                  {{ t.prenom }} {{ t.nom }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Type *</label>
              <select v-model="form.type" required>
                <option value="conge">Congés</option>
                <option value="indisponible">Maladie / Absence</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div class="row-2">
              <div class="field">
                <label>Du *</label>
                <input type="datetime-local" v-model="form.date_debut" required />
              </div>
              <div class="field">
                <label>Au *</label>
                <input type="datetime-local" v-model="form.date_fin" required />
              </div>
            </div>

            <div class="field">
              <label>Note (facultatif)</label>
              <input type="text" v-model="form.note" placeholder="Ex : arrêt maladie, congé annuel…" />
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="showForm = false">Annuler</button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                {{ submitting ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <p v-if="successMsg" class="form-success">{{ successMsg }}</p>
    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import AppCalendar from '../../../components/shared/AppCalendar.vue'
import { useAuth } from '../../../composables/useAuth.js'
import { useInterventions } from '../../../composables/useInterventions.js'

const API = 'http://localhost:3001/api'
const { authHeader } = useAuth()
const { interventionsList, fetchInterventions } = useInterventions()

const techniciens    = ref([])
const absences       = ref([])
const selectedTechId = ref('')
const showForm       = ref(false)
const submitting     = ref(false)
const successMsg     = ref('')
const errorMsg       = ref('')
const formError      = ref('')

const form = ref({ technicien_id: '', type: 'indisponible', date_debut: '', date_fin: '', note: '' })

const selectedTech = computed(() => techniciens.value.find(t => t.id === selectedTechId.value) || null)

onMounted(async () => {
  await Promise.all([loadTechniciens(), loadAbsences(), fetchInterventions()])
})

async function loadTechniciens() {
  const res = await fetch(`${API}/techniciens/liste`, { headers: authHeader() })
  const data = await res.json()
  if (data.success) techniciens.value = data.data
}

async function loadAbsences() {
  const qs = selectedTechId.value ? `?technicien_id=${selectedTechId.value}` : ''
  const res = await fetch(`${API}/techniciens/indisponibilites${qs}`, { headers: authHeader() })
  const data = await res.json()
  if (data.success) absences.value = data.data
}

async function load() {
  await loadAbsences()
}

async function submitAbsence() {
  formError.value = ''
  if (!form.value.technicien_id) { formError.value = 'Choisissez un technicien'; return }
  if (!form.value.date_debut || !form.value.date_fin) { formError.value = 'Dates requises'; return }
  if (new Date(form.value.date_fin) <= new Date(form.value.date_debut)) {
    formError.value = 'La date de fin doit être après la date de début'; return
  }
  submitting.value = true
  try {
    const res = await fetch(`${API}/techniciens/indisponibilite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(form.value),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    showForm.value = false
    successMsg.value = 'Absence enregistrée.'
    form.value = { technicien_id: '', type: 'indisponible', date_debut: '', date_fin: '', note: '' }
    await loadAbsences()
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    formError.value = e.message
  } finally {
    submitting.value = false
  }
}

async function deleteAbsence(a) {
  errorMsg.value = ''
  try {
    const res = await fetch(`${API}/techniciens/indisponibilite/${a.id}`, {
      method: 'DELETE', headers: authHeader(),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    absences.value = absences.value.filter(x => x.id !== a.id)
    successMsg.value = 'Absence supprimée.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    errorMsg.value = e.message
  }
}

function openEvent(event) {
  if (event.extendedProps?.type === 'absence') {
    // On pourrait ouvrir un détail, mais pour l'instant on ne fait rien
  }
}

// Événements calendrier : interventions + absences
const colorAbsence = { conge: '#f59e0b', indisponible: '#e53e3e', autre: '#6b6375' }
const colorInterv  = { planifie: '#6D1F3E', en_cours: '#1565c0', termine: '#2e7d32', annule: '#bdbdbd' }

const calendarEvents = computed(() => {
  const events = []

  // Absences (filtrées par technicien si sélectionné)
  const filteredAbsences = selectedTechId.value
    ? absences.value.filter(a => a.technicien_id === selectedTechId.value)
    : absences.value

  for (const a of filteredAbsences) {
    events.push({
      id: `abs-${a.id}`,
      title: `[Absence] ${a.prenom} ${a.nom} — ${typeLabel(a.type)}`,
      start: a.date_debut,
      end:   a.date_fin,
      backgroundColor: colorAbsence[a.type] || '#6b6375',
      extendedProps: { type: 'absence' },
    })
  }

  // Interventions
  for (const i of interventionsList.value) {
    if (selectedTechId.value && !i.techniciens_noms) continue
    events.push({
      id: `interv-${i.id}`,
      title: `${i.type_service} — ${i.client_prenom} ${i.client_nom}`,
      start: i.date_debut,
      end:   i.date_fin,
      backgroundColor: colorInterv[i.statut] || '#6D1F3E',
      extendedProps: { type: 'intervention' },
    })
  }

  return events
})

function typeLabel(type) {
  return { conge: 'Congés', indisponible: 'Maladie / Absence', autre: 'Autre' }[type] || type
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.toolbar { display: flex; align-items: flex-end; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.field label { display: block; font-size: .85rem; font-weight: 600; color: #6b6375; margin-bottom: .4rem; }
.field select, .field input {
  padding: .65rem 1rem; border: 1.5px solid #e5e4e7; border-radius: 8px;
  font-size: .9rem; background: #fff; outline: none;
}
.field select:focus, .field input:focus { border-color: #6D1F3E; }
.btn-add {
  padding: .65rem 1.4rem; background: #6D1F3E; color: #fff;
  border: none; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.btn-add:hover { background: #5a1830; }
.horaires-info {
  background: #e3f2fd; border-radius: 8px; padding: .7rem 1.1rem;
  font-size: .88rem; color: #1565c0; margin-bottom: 1.2rem;
}
.calendar-card { background: #fff; border-radius: 12px; padding: 1rem; border: 1.5px solid #e5e4e7; margin-bottom: 1.5rem; }
.absences-section { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.absences-section h3 { font-size: 1rem; font-weight: 700; color: #2d1020; margin: 0 0 1.2rem; }
.empty { color: #6b6375; font-size: .9rem; }
.absences-list { display: flex; flex-direction: column; gap: .7rem; }
.absence-row {
  display: flex; align-items: center; gap: 1rem;
  padding: .8rem 1rem; border-radius: 8px;
  background: #fdf8f9; border: 1px solid #f0eff2;
}
.absence-who { display: flex; align-items: center; gap: .6rem; min-width: 160px; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #6D1F3E; color: #fff; font-size: .75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.absence-who span { font-size: .88rem; font-weight: 600; color: #2d1020; }
.absence-info { flex: 1; display: flex; align-items: center; gap: .8rem; flex-wrap: wrap; }
.type-badge { font-size: .78rem; font-weight: 700; padding: .2rem .7rem; border-radius: 999px; }
.type-badge.conge { background: #fff3e0; color: #e65100; }
.type-badge.indisponible { background: #ffebee; color: #c62828; }
.type-badge.autre { background: #f5f5f5; color: #424242; }
.dates { font-size: .84rem; color: #555; }
.note { font-size: .82rem; color: #6b6375; font-style: italic; }
.btn-delete {
  background: none; border: none; color: #bdbdbd; cursor: pointer;
  font-size: 1rem; padding: .2rem .5rem; border-radius: 4px;
}
.btn-delete:hover { color: #c62828; background: #ffebee; }
/* Modal */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal { background: #fff; border-radius: 14px; padding: 2rem; width: 100%; max-width: 480px; }
.modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 1.5rem; }
.form { display: flex; flex-direction: column; gap: 1rem; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: .8rem; margin-top: .5rem; }
.btn-cancel {
  padding: .6rem 1.2rem; border: 1.5px solid #e5e4e7;
  background: #fff; border-radius: 8px; cursor: pointer;
}
.btn-submit {
  padding: .6rem 1.4rem; background: #6D1F3E; color: #fff;
  border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
}
.btn-submit:hover:not(:disabled) { background: #5a1830; }
.btn-submit:disabled { opacity: .6; }
.form-error { color: #e53e3e; font-size: .88rem; }
.form-success { color: #2e7d32; background: #e8f5e9; padding: .7rem 1rem; border-radius: 8px; font-size: .9rem; margin-top: 1rem; }
</style>
