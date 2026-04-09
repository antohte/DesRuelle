import { ref, computed } from 'vue'

const API = 'http://localhost:3001/api'

// État partagé (singleton module-level)
const currentUser = ref(null)
const token = ref(localStorage.getItem('auth_token') || null)

function authHeader() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

async function fetchMe() {
  if (!token.value) return
  try {
    const res = await fetch(`${API}/auth/me`, { headers: authHeader() })
    if (!res.ok) { logout(); return }
    const data = await res.json()
    if (data.success) currentUser.value = data.user
  } catch {
    logout()
  }
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  token.value = data.token
  currentUser.value = data.user
  localStorage.setItem('auth_token', data.token)
  return data.user
}

async function register(payload) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  token.value = data.token
  currentUser.value = data.user
  localStorage.setItem('auth_token', data.token)
  return data.user
}

function logout() {
  token.value = null
  currentUser.value = null
  localStorage.removeItem('auth_token')
}

const isAuthenticated = computed(() => !!currentUser.value)
const isClient        = computed(() => currentUser.value?.role === 'client')
const isTechnicien    = computed(() => currentUser.value?.role === 'technicien')
const isResponsable   = computed(() => currentUser.value?.role === 'responsable')

function dashboardRoute() {
  const role = currentUser.value?.role
  if (role === 'responsable') return '/dashboard/responsable'
  if (role === 'technicien')  return '/dashboard/technicien'
  return '/dashboard/client'
}

export function useAuth() {
  return {
    currentUser,
    token,
    isAuthenticated,
    isClient,
    isTechnicien,
    isResponsable,
    authHeader,
    login,
    register,
    logout,
    fetchMe,
    dashboardRoute,
  }
}

// Charger l'utilisateur au démarrage si un token existe
if (token.value) fetchMe()
