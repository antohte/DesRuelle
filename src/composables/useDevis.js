import { ref } from 'vue'
import { useAuth } from './useAuth.js'

const API = 'http://localhost:3001/api'

export function useDevis() {
  const { authHeader } = useAuth()
  const devisList = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchDevis(params = {}) {
    loading.value = true; error.value = null
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${API}/devis${qs ? '?' + qs : ''}`, { headers: authHeader() })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      devisList.value = data.data
    } catch (e) { error.value = e.message } finally { loading.value = false }
  }

  async function getDevis(id) {
    const res = await fetch(`${API}/devis/${id}`, { headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data.data
  }

  async function submitDevis(payload) {
    const res = await fetch(`${API}/devis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data
  }

  async function validerDevis(id, payload) {
    const res = await fetch(`${API}/devis/${id}/valider`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  async function refuserDevis(id, note) {
    const res = await fetch(`${API}/devis/${id}/refuser`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ note_responsable: note }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  async function accepterDevis(id) {
    const res = await fetch(`${API}/devis/${id}/accepter`, {
      method: 'PATCH', headers: authHeader(),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  async function refuserDevisClient(id) {
    const res = await fetch(`${API}/devis/${id}/refuser-client`, {
      method: 'PATCH', headers: authHeader(),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  return { devisList, loading, error, fetchDevis, getDevis, submitDevis, validerDevis, refuserDevis, accepterDevis, refuserDevisClient }
}
