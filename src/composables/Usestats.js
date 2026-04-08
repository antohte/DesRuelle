// src/composables/useStats.js
import { ref, onMounted } from 'vue'

const total = ref(0)
const avg   = ref('—')
const loaded = ref(false)

export function useStats() {
  onMounted(async () => {
    if (loaded.value) return
    try {
      const res  = await fetch('http://localhost:3001/api/stats')
      const data = await res.json()
      if (data.success) {
        total.value  = data.total
        avg.value    = data.avg
        loaded.value = true
      }
    } catch (e) {
      console.error('Impossible de charger les stats', e)
    }
  })

  return { total, avg }
}