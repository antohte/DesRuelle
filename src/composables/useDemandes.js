import { ref } from 'vue'
import { useAuth } from './useAuth.js'

const API = '/api'

export function useDemandes() {
  const { authHeader } = useAuth()
  const demandesList = ref([])
  const loading = ref(false)

  async function fetchDemandes(params = {}) {
    loading.value = true
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${API}/demandes${qs ? '?' + qs : ''}`, { headers: authHeader() })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      demandesList.value = data.data
    } finally { loading.value = false }
  }

  async function submitDemande(payload) {
    const res = await fetch(`${API}/demandes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data
  }

  async function approuverDemande(id) {
    const res = await fetch(`${API}/demandes/${id}/approuver`, { method: 'PATCH', headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  async function refuserDemande(id) {
    const res = await fetch(`${API}/demandes/${id}/refuser`, { method: 'PATCH', headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  return { demandesList, loading, fetchDemandes, submitDemande, approuverDemande, refuserDemande }
}
