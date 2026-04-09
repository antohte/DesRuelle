import { ref } from 'vue'
import { useAuth } from './useAuth.js'

const API = '/api'

export function useInterventions() {
  const { authHeader } = useAuth()
  const interventionsList = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchInterventions(params = {}) {
    loading.value = true; error.value = null
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${API}/interventions${qs ? '?' + qs : ''}`, { headers: authHeader() })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      interventionsList.value = data.data
    } catch (e) { error.value = e.message } finally { loading.value = false }
  }

  async function getIntervention(id) {
    const res = await fetch(`${API}/interventions/${id}`, { headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data.data
  }

  async function createIntervention(payload) {
    const res = await fetch(`${API}/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data
  }

  async function updateProgression(id, progression) {
    const res = await fetch(`${API}/interventions/${id}/progression`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ progression }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  async function updateStatut(id, statut) {
    const res = await fetch(`${API}/interventions/${id}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ statut }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  async function assignerTechniciens(id, technicien_ids) {
    const res = await fetch(`${API}/interventions/${id}/assigner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ technicien_ids }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  return { interventionsList, loading, error, fetchInterventions, getIntervention, createIntervention, updateProgression, updateStatut, assignerTechniciens }
}
