import { ref } from 'vue'
import { useAuth } from './useAuth.js'

const API = '/api'

const notifications = ref([])
const unread = ref(0)
let pollInterval = null

export function useNotifications() {
  const { authHeader, isAuthenticated } = useAuth()

  async function fetchNotifications() {
    if (!isAuthenticated.value) return
    try {
      const res = await fetch(`${API}/notifications`, { headers: authHeader() })
      const data = await res.json()
      if (data.success) {
        notifications.value = data.data
        unread.value = data.unread
      }
    } catch { /* silencieux */ }
  }

  async function markRead(id) {
    await fetch(`${API}/notifications/${id}/lire`, { method: 'PATCH', headers: authHeader() })
    const n = notifications.value.find(n => n.id === id)
    if (n && !n.lu) { n.lu = 1; unread.value = Math.max(0, unread.value - 1) }
  }

  async function markAllRead() {
    await fetch(`${API}/notifications/lire-tout`, { method: 'PATCH', headers: authHeader() })
    notifications.value.forEach(n => { n.lu = 1 })
    unread.value = 0
  }

  function startPolling() {
    fetchNotifications()
    if (!pollInterval) {
      pollInterval = setInterval(fetchNotifications, 30000)
    }
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
  }

  return { notifications, unread, fetchNotifications, markRead, markAllRead, startPolling, stopPolling }
}
