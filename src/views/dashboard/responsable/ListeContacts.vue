<template>
  <DashboardLayout title="Contacts">
    <div class="search-bar">
      <input v-model="search" type="text" placeholder="Rechercher par nom, email, téléphone…" />
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'client' }" @click="tab = 'client'">
        Clients ({{ clients.length }})
      </button>
      <button class="tab" :class="{ active: tab === 'technicien' }" @click="tab = 'technicien'">
        Techniciens ({{ techniciens.length }})
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else class="contacts-grid">
      <div v-for="c in filtered" :key="c.id" class="contact-card">
        <div class="contact-avatar">{{ c.prenom[0] }}{{ c.nom[0] }}</div>
        <div class="contact-info">
          <h3>{{ c.prenom }} {{ c.nom }}</h3>
          <a :href="`mailto:${c.email}`" class="contact-link">{{ c.email }}</a>
          <a v-if="c.telephone" :href="`tel:${c.telephone}`" class="contact-link phone">{{ c.telephone }}</a>
          <p v-if="c.adresse" class="contact-addr">{{ c.adresse }}</p>
          <p class="contact-date">Inscrit le {{ formatDate(c.created_at) }}</p>
        </div>
      </div>
      <div v-if="!filtered.length" class="empty">Aucun contact trouvé.</div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import { useAuth } from '../../../composables/useAuth.js'

const API = '/api'
const { authHeader } = useAuth()

const contacts = ref([])
const loading  = ref(true)
const search   = ref('')
const tab      = ref('client')

onMounted(async () => {
  try {
    const res = await fetch(`${API}/admin/contacts`, { headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    contacts.value = data.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

const clients     = computed(() => contacts.value.filter(c => c.role === 'client'))
const techniciens = computed(() => contacts.value.filter(c => c.role === 'technicien'))

const filtered = computed(() => {
  const list = tab.value === 'client' ? clients.value : techniciens.value
  const q = search.value.toLowerCase()
  if (!q) return list
  return list.filter(c =>
    `${c.prenom} ${c.nom} ${c.email} ${c.telephone}`.toLowerCase().includes(q)
  )
})

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>

<style scoped>
.search-bar { margin-bottom: 1.2rem; }
.search-bar input {
  width: 100%; max-width: 400px; padding: .7rem 1rem;
  border: 1.5px solid #e5e4e7; border-radius: 8px;
  font-size: .9rem; outline: none; box-sizing: border-box;
}
.search-bar input:focus { border-color: #6D1F3E; }
.tabs { display: flex; gap: .5rem; margin-bottom: 1.5rem; }
.tab { padding: .5rem 1.4rem; border-radius: 999px; border: 1.5px solid #e5e4e7; background: #fff; cursor: pointer; font-size: .88rem; font-weight: 500; color: #6b6375; }
.tab.active { background: #6D1F3E; border-color: #6D1F3E; color: #fff; }
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.contacts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem; }
.contact-card { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; display: flex; gap: 1rem; }
.contact-avatar { width: 46px; height: 46px; border-radius: 50%; background: #6D1F3E; color: #fff; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.contact-info { flex: 1; min-width: 0; }
.contact-info h3 { font-size: .95rem; font-weight: 700; color: #2d1020; margin: 0 0 .5rem; }
.contact-link { display: block; font-size: .83rem; color: #6D1F3E; text-decoration: none; margin-bottom: .25rem; overflow: hidden; text-overflow: ellipsis; }
.contact-link.phone { color: #1565c0; }
.contact-link:hover { text-decoration: underline; }
.contact-addr { font-size: .82rem; color: #6b6375; margin: .3rem 0; }
.contact-date { font-size: .78rem; color: #999; margin: .3rem 0 0; }
.empty { color: #6b6375; text-align: center; padding: 3rem; grid-column: 1/-1; }
</style>
