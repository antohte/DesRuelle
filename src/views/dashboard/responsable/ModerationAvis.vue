<template>
  <DashboardLayout title="Modération des avis">
    <div v-if="loading" class="loading">Chargement…</div>
    <div v-else-if="!avis.length" class="empty">Aucun avis en attente de modération.</div>

    <div v-else class="avis-list">
      <div v-for="a in avis" :key="a.id" class="avis-card">
        <div class="avis-head">
          <div>
            <StarRating :modelValue="a.rating" />
            <p class="avis-author">{{ a.prenom }} {{ a.nom_initial }}. — {{ a.location }}</p>
            <p class="avis-service">{{ a.service }}</p>
          </div>
          <p class="avis-date">{{ formatDate(a.created_at) }}</p>
        </div>
        <p class="avis-texte">« {{ a.texte }} »</p>
        <div class="avis-actions">
          <button class="btn-approve" @click="approve(a)">✓ Approuver</button>
          <button class="btn-refuse" @click="refuse(a)">✗ Refuser</button>
        </div>
      </div>
    </div>

    <p v-if="msg" class="form-success">{{ msg }}</p>
    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../../components/layout/DashboardLayout.vue'
import StarRating from '../../../components/shared/StarRating.vue'
import { useAuth } from '../../../composables/useAuth.js'

const API = '/api'
const { authHeader } = useAuth()

const avis = ref([])
const loading = ref(true)
const msg = ref('')
const errorMsg = ref('')

onMounted(async () => {
  try {
    const res = await fetch(`${API}/admin/avis-pending`, { headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    avis.value = data.data
  } catch (e) { errorMsg.value = e.message }
  finally { loading.value = false }
})

async function approve(a) {
  try {
    const res = await fetch(`${API}/admin/avis/${a.id}/approuver`, { method: 'PATCH', headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    avis.value = avis.value.filter(x => x.id !== a.id)
    msg.value = 'Avis approuvé !'
    setTimeout(() => { msg.value = '' }, 3000)
  } catch (e) { errorMsg.value = e.message }
}

async function refuse(a) {
  try {
    const res = await fetch(`${API}/admin/avis/${a.id}/refuser`, { method: 'PATCH', headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    avis.value = avis.value.filter(x => x.id !== a.id)
    msg.value = 'Avis refusé.'
    setTimeout(() => { msg.value = '' }, 3000)
  } catch (e) { errorMsg.value = e.message }
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
</script>

<style scoped>
.loading { text-align: center; color: #6b6375; padding: 3rem; }
.empty { text-align: center; color: #2e7d32; font-size: 1rem; padding: 3rem; background: #e8f5e9; border-radius: 12px; }
.avis-list { display: flex; flex-direction: column; gap: 1.2rem; }
.avis-card { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1.5px solid #e5e4e7; }
.avis-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .8rem; }
.avis-author { font-size: .85rem; font-weight: 600; color: #555; margin: .4rem 0 .2rem; }
.avis-service { font-size: .82rem; color: #6b6375; margin: 0; }
.avis-date { font-size: .8rem; color: #999; }
.avis-texte { font-size: .92rem; color: #555; font-style: italic; margin: .5rem 0 1rem; }
.avis-actions { display: flex; gap: .8rem; }
.btn-approve { padding: .55rem 1.2rem; background: #2e7d32; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .88rem; }
.btn-approve:hover { background: #1b5e20; }
.btn-refuse { padding: .55rem 1.2rem; background: #fff; color: #c62828; border: 1.5px solid #c62828; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .88rem; }
.btn-refuse:hover { background: #ffebee; }
.form-success { color: #2e7d32; background: #e8f5e9; padding: .8rem 1rem; border-radius: 8px; margin-top: 1rem; font-size: .9rem; }
.form-error { color: #e53e3e; font-size: .88rem; margin-top: 1rem; }
</style>
