<template>
  <DashboardLayout title="Nouveau devis">
    <div class="form-card">
      <h2>Demande de devis</h2>
      <p class="subtitle">Décrivez votre besoin, nous vous répondons dans les 48h.</p>

      <form @submit.prevent="submit" class="form">
        <!-- Étape 1 : Service -->
        <div class="field">
          <label>Type de service *</label>
          <select v-model="form.type_service" required>
            <option value="">-- Choisissez un service --</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Rénovation">Rénovation</option>
            <option value="Entretien">Entretien</option>
            <option value="Espaces verts">Espaces verts</option>
            <option value="Nettoyage">Nettoyage</option>
            <option value="Conciergerie">Conciergerie</option>
          </select>
        </div>

        <div class="field">
          <label>Description détaillée *</label>
          <textarea v-model="form.description" required rows="5"
            placeholder="Décrivez précisément ce dont vous avez besoin, l'état actuel, les matériaux, etc."></textarea>
        </div>

        <div class="field">
          <label>Adresse du service *</label>
          <input v-model="form.adresse_service" type="text" required
            placeholder="12 rue de la Paix, 59000 Lille" />
        </div>

        <!-- Récurrence -->
        <div class="field">
          <label>Récurrence</label>
          <div class="radio-group">
            <label v-for="opt in recurrenceOptions" :key="opt.value" class="radio-label">
              <input type="radio" v-model="form.recurrence" :value="opt.value" />
              {{ opt.label }}
            </label>
          </div>
        </div>

        <div v-if="form.recurrence === 'personnalise'" class="field">
          <label>Précisez la récurrence</label>
          <input v-model="form.recurrence_detail" type="text"
            placeholder="Ex : tous les 15 jours, le lundi matin…" />
        </div>

        <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="form-success">{{ successMsg }}</p>

        <div class="actions">
          <RouterLink to="/dashboard/client" class="btn-secondary">Annuler</RouterLink>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Envoi…' : 'Envoyer ma demande' }}
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import { useDevis } from '../../../composables/useDevis.js'

const { submitDevis } = useDevis()
const router = useRouter()

const form = ref({
  type_service: '',
  description: '',
  adresse_service: '',
  recurrence: 'unique',
  recurrence_detail: '',
})

const recurrenceOptions = [
  { value: 'unique', label: 'Intervention unique' },
  { value: 'hebdomadaire', label: 'Chaque semaine' },
  { value: 'mensuel', label: 'Chaque mois' },
  { value: 'personnalise', label: 'Personnalisé' },
]

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function submit() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await submitDevis(form.value)
    successMsg.value = 'Votre demande a bien été envoyée ! Nous vous répondrons dans les 48h.'
    setTimeout(() => router.push('/dashboard/client/devis'), 2000)
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-card { background: #fff; border-radius: 16px; padding: 2.5rem; max-width: 680px; border: 1.5px solid #e5e4e7; }
h2 { font-size: 1.3rem; font-weight: 700; color: #2d1020; margin: 0 0 .4rem; }
.subtitle { color: #6b6375; margin: 0 0 2rem; }
.field { margin-bottom: 1.4rem; }
.field label { display: block; font-size: .88rem; font-weight: 600; color: #2d1020; margin-bottom: .5rem; }
.field input, .field select, .field textarea {
  width: 100%; padding: .75rem 1rem;
  border: 1.5px solid #e5e4e7; border-radius: 8px;
  font-size: .95rem; outline: none; box-sizing: border-box;
  font-family: inherit; transition: border-color .2s;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: #6D1F3E; }
.radio-group { display: flex; flex-wrap: wrap; gap: 1rem; }
.radio-label { display: flex; align-items: center; gap: .5rem; font-size: .9rem; cursor: pointer; }
.form-error { color: #e53e3e; font-size: .88rem; margin-bottom: 1rem; }
.form-success { color: #2e7d32; font-size: .9rem; margin-bottom: 1rem; background: #e8f5e9; padding: .8rem 1rem; border-radius: 8px; }
.actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
.btn-primary { padding: .8rem 1.8rem; background: #6D1F3E; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .95rem; }
.btn-primary:hover:not(:disabled) { background: #5a1830; }
.btn-primary:disabled { opacity: .6; cursor: default; }
.btn-secondary { padding: .8rem 1.8rem; background: #fff; color: #6b6375; border: 1.5px solid #e5e4e7; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .95rem; text-decoration: none; display: inline-block; }
.btn-secondary:hover { background: #fdf8f9; }
</style>
