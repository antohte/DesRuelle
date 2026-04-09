<template>
  <DashboardLayout title="Gestion des devis">
    <!-- Filtres -->
    <div class="filters">
      <button v-for="f in filters" :key="f.value" class="filter-btn" :class="{ active: currentFilter === f.value }" @click="setFilter(f.value)">
        {{ f.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement…</div>
    <div v-else-if="!filtered.length" class="empty">Aucun devis pour ce filtre.</div>

    <div v-else class="devis-list">
      <div v-for="d in filtered" :key="d.id" class="devis-card">
        <div class="devis-head">
          <div>
            <h3>{{ d.type_service }}</h3>
            <p class="meta">{{ d.client_prenom }} {{ d.client_nom }} · {{ d.client_email }} · {{ d.client_telephone }}</p>
            <p class="meta">{{ formatDate(d.created_at) }}</p>
            <p v-if="d.recurrence !== 'unique'" class="recurrence-tag">{{ d.recurrence }}</p>
          </div>
          <StatusBadge :statut="d.statut" />
        </div>

        <p class="devis-desc">{{ d.description }}</p>
        <p class="devis-addr">{{ d.adresse_service }}</p>

        <!-- Formulaire validation (devis en_attente) -->
        <div v-if="d.statut === 'en_attente'" class="validation-form">
          <div class="form-row">
            <div class="field">
              <label>Prix (€) *</label>
              <input type="number" v-model="forms[d.id].prix" step="0.01" min="0" placeholder="Ex : 150.00" />
            </div>
            <div class="field">
              <label>Durée (h)</label>
              <input type="number" v-model="forms[d.id].heures_estimees" step="0.5" min="0" placeholder="Ex : 3" />
            </div>
            <div class="field">
              <label>Nb techniciens *</label>
              <input type="number" v-model="forms[d.id].nb_techniciens" min="1" placeholder="1" />
            </div>
          </div>
          <div class="field">
            <label>Note (visible par le client)</label>
            <textarea v-model="forms[d.id].note_responsable" rows="2" placeholder="Informations complémentaires…"></textarea>
          </div>
          <div class="devis-actions">
            <button class="btn-validate" @click="validate(d)" :disabled="actionLoading === d.id">
              ✓ Valider et envoyer
            </button>
            <button class="btn-refuse" @click="openRefuse(d)">
              ✗ Refuser
            </button>
          </div>
        </div>

        <div v-if="d.statut === 'valide'" class="validated-info">
          <span>Validé — {{ d.prix }}€ · {{ d.nb_techniciens }} tech. · {{ d.heures_estimees }}h</span>
        </div>
      </div>
    </div>

    <!-- Modal refus -->
    <ConfirmModal v-model="showRefuse" title="Refuser le devis" :danger="true" confirmLabel="Confirmer le refus" @confirm="doRefuse">
      <div class="modal-form">
        <label>Motif du refus (facultatif)</label>
        <textarea v-model="refuseNote" rows="3" placeholder="Expliquez pourquoi…"></textarea>
      </div>
    </ConfirmModal>

    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import ConfirmModal from '../../../components/shared/ConfirmModal.vue'
import { useDevis } from '../../../composables/useDevis.js'

const { devisList, loading, fetchDevis, validerDevis, refuserDevis } = useDevis()

const filters = [
  { value: '', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide', label: 'Validés' },
  { value: 'refuse', label: 'Refusés' },
  { value: 'accepte_client', label: 'Acceptés' },
]
const currentFilter = ref('en_attente')
const forms = ref({})
const actionLoading = ref(null)
const errorMsg = ref('')
const showRefuse = ref(false)
const refuseNote = ref('')
const currentDevis = ref(null)

onMounted(async () => {
  await fetchDevis()
  devisList.value.forEach(d => {
    forms.value[d.id] = { prix: '', heures_estimees: '', nb_techniciens: 1, note_responsable: '' }
  })
})

const filtered = computed(() =>
  currentFilter.value
    ? devisList.value.filter(d => d.statut === currentFilter.value)
    : devisList.value
)

function setFilter(v) {
  currentFilter.value = v
}

async function validate(d) {
  const f = forms.value[d.id]
  if (!f.prix || !f.nb_techniciens) { errorMsg.value = 'Prix et nombre de techniciens requis'; return }
  actionLoading.value = d.id
  errorMsg.value = ''
  try {
    await validerDevis(d.id, f)
    d.statut = 'valide'
    d.prix = f.prix; d.heures_estimees = f.heures_estimees; d.nb_techniciens = f.nb_techniciens
  } catch (e) { errorMsg.value = e.message }
  finally { actionLoading.value = null }
}

function openRefuse(d) {
  currentDevis.value = d
  refuseNote.value = ''
  showRefuse.value = true
}

async function doRefuse() {
  if (!currentDevis.value) return
  try {
    await refuserDevis(currentDevis.value.id, refuseNote.value)
    currentDevis.value.statut = 'refuse'
  } catch (e) { errorMsg.value = e.message }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.filters { display: flex; gap: .6rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.filter-btn { padding: .45rem 1.1rem; border-radius: 999px; border: 1.5px solid #e5e4e7; background: #fff; cursor: pointer; font-size: .85rem; font-weight: 500; color: #6b6375; transition: all .2s; }
.filter-btn.active { background: #6D1F3E; border-color: #6D1F3E; color: #fff; }
.filter-btn:hover:not(.active) { background: #fdf8f9; }
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.empty { text-align: center; color: #6b6375; padding: 3rem; background: #fff; border-radius: 12px; border: 1.5px solid #e5e4e7; }
.devis-list { display: flex; flex-direction: column; gap: 1.2rem; }
.devis-card { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.devis-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .8rem; }
.devis-head h3 { font-size: 1.05rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.meta { font-size: .82rem; color: #6b6375; margin: .2rem 0; }
.recurrence-tag { display: inline-block; background: #fdf0f4; color: #6D1F3E; font-size: .78rem; padding: .2rem .7rem; border-radius: 999px; margin-top: .3rem; }
.devis-desc { font-size: .9rem; color: #555; margin: .6rem 0; }
.devis-addr { font-size: .85rem; color: #6b6375; margin-bottom: 1rem; }
.validation-form { background: #fdf8f9; border: 1.5px solid #eddde4; border-radius: 10px; padding: 1.2rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.field { margin-bottom: .8rem; }
.field label { display: block; font-size: .82rem; font-weight: 600; color: #6b6375; margin-bottom: .4rem; }
.field input, .field textarea {
  width: 100%; padding: .6rem .9rem;
  border: 1.5px solid #e5e4e7; border-radius: 8px;
  font-size: .9rem; font-family: inherit; box-sizing: border-box;
}
.field input:focus, .field textarea:focus { outline: none; border-color: #6D1F3E; }
.devis-actions { display: flex; gap: .8rem; margin-top: .8rem; }
.btn-validate { padding: .6rem 1.4rem; background: #2e7d32; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-validate:hover { background: #1b5e20; }
.btn-refuse { padding: .6rem 1.4rem; background: #fff; color: #c62828; border: 1.5px solid #c62828; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-refuse:hover { background: #ffebee; }
.validated-info { background: #e8f5e9; border-radius: 8px; padding: .8rem 1rem; font-size: .88rem; color: #2e7d32; margin-top: .8rem; }
.modal-form label { display: block; font-size: .88rem; font-weight: 600; margin-bottom: .5rem; }
.modal-form textarea { width: 100%; border: 1.5px solid #e5e4e7; border-radius: 8px; padding: .7rem; font-family: inherit; box-sizing: border-box; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
</style>
