import { ref } from 'vue'
import { useAuth } from './useAuth.js'

const API = '/api'

export function useTechniciens() {
  const { authHeader } = useAuth()
  const techniciensList = ref([])
  const loading = ref(false)

  async function fetchDisponibles(date_debut, date_fin) {
    loading.value = true
    try {
      const qs = new URLSearchParams({ date_debut, date_fin }).toString()
      const res = await fetch(`${API}/techniciens/disponibles?${qs}`, { headers: authHeader() })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      techniciensList.value = data.data
      return data.data
    } finally { loading.value = false }
  }

  async function checkCreneauDisponible(date_debut, date_fin, nb) {
    const qs = new URLSearchParams({ date_debut, date_fin, nb }).toString()
    const res = await fetch(`${API}/techniciens/creneaux-disponibles?${qs}`, { headers: authHeader() })
    const data = await res.json()
    return data
  }

  return { techniciensList, loading, fetchDisponibles, checkCreneauDisponible }
}
