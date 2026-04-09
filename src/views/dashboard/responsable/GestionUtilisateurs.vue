<template>
  <DashboardLayout title="Gestion des utilisateurs">
    <div class="filters">
      <button v-for="f in filters" :key="f.value" class="filter-btn" :class="{ active: currentFilter === f.value }" @click="setFilter(f.value)">
        {{ f.label }} ({{ countByRole(f.value) }})
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement…</div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th>Nom</th><th>Email</th><th>Téléphone</th>
            <th>Rôle</th><th>Actif</th><th>Créé le</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.id">
            <td class="name-cell">
              <div class="user-avatar">{{ u.prenom[0] }}{{ u.nom[0] }}</div>
              {{ u.prenom }} {{ u.nom }}
            </td>
            <td>{{ u.email }}</td>
            <td>{{ u.telephone || '—' }}</td>
            <td>
              <select :value="u.role" @change="changeRole(u, $event.target.value)" class="role-select">
                <option value="client">Client</option>
                <option value="technicien">Technicien</option>
                <option value="responsable">Responsable</option>
              </select>
            </td>
            <td>
              <button class="toggle-btn" :class="{ active: u.actif }" @click="toggleActif(u)">
                {{ u.actif ? 'Actif' : 'Inactif' }}
              </button>
            </td>
            <td>{{ formatDate(u.created_at) }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="successMsg" class="form-success">{{ successMsg }}</p>
    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import { useAuth } from '../../../composables/useAuth.js'

const API = 'http://localhost:3001/api'
const { authHeader } = useAuth()

const users = ref([])
const loading = ref(true)
const currentFilter = ref('')
const successMsg = ref('')
const errorMsg = ref('')

const filters = [
  { value: '', label: 'Tous' },
  { value: 'client', label: 'Clients' },
  { value: 'technicien', label: 'Techniciens' },
  { value: 'responsable', label: 'Responsables' },
]

onMounted(async () => {
  try {
    const res = await fetch(`${API}/admin/users`, { headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    users.value = data.data
  } catch (e) { errorMsg.value = e.message }
  finally { loading.value = false }
})

const filtered = computed(() =>
  currentFilter.value ? users.value.filter(u => u.role === currentFilter.value) : users.value
)

function countByRole(role) {
  return role ? users.value.filter(u => u.role === role).length : users.value.length
}

function setFilter(v) { currentFilter.value = v }

async function changeRole(u, role) {
  errorMsg.value = ''
  try {
    const res = await fetch(`${API}/admin/users/${u.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    u.role = role
    successMsg.value = `Rôle de ${u.prenom} mis à jour.`
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) { errorMsg.value = e.message }
}

async function toggleActif(u) {
  errorMsg.value = ''
  try {
    const res = await fetch(`${API}/admin/users/${u.id}/actif`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ actif: !u.actif }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    u.actif = !u.actif
    successMsg.value = `Compte ${u.prenom} ${u.actif ? 'activé' : 'désactivé'}.`
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) { errorMsg.value = e.message }
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>

<style scoped>
.filters { display: flex; gap: .6rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.filter-btn { padding: .45rem 1.1rem; border-radius: 999px; border: 1.5px solid #e5e4e7; background: #fff; cursor: pointer; font-size: .85rem; font-weight: 500; color: #6b6375; }
.filter-btn.active { background: #6D1F3E; border-color: #6D1F3E; color: #fff; }
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e4e7; font-size: .88rem; }
.table th { text-align: left; padding: .8rem 1rem; color: #6b6375; font-size: .8rem; background: #fdf8f9; border-bottom: 1.5px solid #e5e4e7; }
.table td { padding: .8rem 1rem; border-bottom: 1px solid #f0eff2; }
.name-cell { display: flex; align-items: center; gap: .7rem; font-weight: 600; color: #2d1020; }
.user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #6D1F3E; color: #fff; font-size: .75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.role-select { padding: .35rem .6rem; border: 1.5px solid #e5e4e7; border-radius: 6px; font-size: .85rem; background: #fff; }
.role-select:focus { outline: none; border-color: #6D1F3E; }
.toggle-btn { padding: .3rem .9rem; border-radius: 999px; border: none; font-size: .8rem; font-weight: 600; cursor: pointer; }
.toggle-btn.active { background: #e8f5e9; color: #2e7d32; }
.toggle-btn:not(.active) { background: #ffebee; color: #c62828; }
.form-success { color: #2e7d32; background: #e8f5e9; padding: .8rem 1rem; border-radius: 8px; margin-top: 1rem; font-size: .9rem; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
</style>
