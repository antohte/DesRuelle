import { ref } from 'vue'
import { useAuth } from './useAuth.js'

const API = '/api'

export function useFeedback() {
  const { authHeader } = useAuth()
  const feedbacks = ref([])

  async function fetchFeedbacks(interventionId) {
    const res = await fetch(`${API}/feedbacks/intervention/${interventionId}`, { headers: authHeader() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    feedbacks.value = data.data
    return data.data
  }

  async function submitFeedback(payload) {
    const res = await fetch(`${API}/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
  }

  return { feedbacks, fetchFeedbacks, submitFeedback }
}
