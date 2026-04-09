<template>
  <div class="dash-root">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-logo">
        <img src="/images/logo.png" alt="Desruelle" />
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline :points="sidebarCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- CLIENT -->
        <template v-if="isClient">
          <RouterLink to="/dashboard/client" class="nav-item" :class="{ exact: $route.path === '/dashboard/client' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Accueil</span>
          </RouterLink>
          <RouterLink to="/dashboard/client/devis" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Mes devis</span>
          </RouterLink>
          <RouterLink to="/dashboard/client/devis/nouveau" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>Nouveau devis</span>
          </RouterLink>
          <RouterLink to="/dashboard/client/interventions" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Mes interventions</span>
          </RouterLink>
        </template>

        <!-- TECHNICIEN -->
        <template v-if="isTechnicien">
          <RouterLink to="/dashboard/technicien" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Accueil</span>
          </RouterLink>
          <RouterLink to="/dashboard/technicien/planning" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Mon planning</span>
          </RouterLink>
        </template>

        <!-- RESPONSABLE -->
        <template v-if="isResponsable">
          <RouterLink to="/dashboard/responsable" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Tableau de bord</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/devis" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Devis</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/interventions" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Interventions</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/demandes" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Demandes</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/planning" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Planning global</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/planning-techniciens" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/></svg>
            <span>Planning techniciens</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/utilisateurs" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Utilisateurs</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/contacts" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.84-.84a2 2 0 0 1 2.11-.45 12.1 12.1 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Contacts</span>
          </RouterLink>
          <RouterLink to="/dashboard/responsable/avis" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>Modération avis</span>
          </RouterLink>
        </template>
      </nav>

      <div class="sidebar-footer">
        <RouterLink to="/" class="nav-item small">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Retour à l'accueil</span>
        </RouterLink>
        <button class="nav-item small logout" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="dash-main">
      <header class="dash-topbar">
        <div class="topbar-left">
          <h2 class="page-title">{{ title }}</h2>
        </div>
        <div class="topbar-right">
          <NotificationBell />
          <div class="user-chip">
            <span class="user-avatar">{{ initials }}</span>
            <span class="user-name">{{ currentUser?.prenom }} {{ currentUser?.nom }}</span>
          </div>
        </div>
      </header>
      <main class="dash-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import NotificationBell from '../shared/NotificationBell.vue'

defineProps({ title: { type: String, default: 'Dashboard' } })

const { currentUser, logout, isClient, isTechnicien, isResponsable } = useAuth()
const router = useRouter()
const sidebarCollapsed = ref(false)

const initials = computed(() => {
  const u = currentUser.value
  return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : '?'
})

function handleLogout() {
  logout()
  router.push('/connexion')
}
</script>

<style scoped>
.dash-root {
  display: flex; min-height: 100vh;
  background: #fdf8f9;
  font-family: 'Segoe UI', Roboto, sans-serif;
}
/* Sidebar */
.sidebar {
  width: 240px; min-height: 100vh;
  background: #fff;
  border-right: 1.5px solid #e5e4e7;
  display: flex; flex-direction: column;
  transition: width .25s ease;
  flex-shrink: 0;
}
.sidebar.collapsed { width: 64px; }
.sidebar.collapsed .nav-item span,
.sidebar.collapsed .sidebar-logo img { display: none; }
.sidebar-logo {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.2rem 1rem; border-bottom: 1.5px solid #f0eff2;
}
.sidebar-logo img { height: 36px; }
.collapse-btn {
  background: none; border: none; cursor: pointer; color: #6b6375;
  padding: .25rem; border-radius: 6px;
}
.collapse-btn:hover { background: #fdf8f9; }
.sidebar-nav { flex: 1; padding: .75rem .5rem; display: flex; flex-direction: column; gap: .25rem; }
.nav-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .65rem .9rem; border-radius: 8px;
  font-size: .9rem; font-weight: 500;
  color: #6b6375; text-decoration: none;
  transition: background .15s, color .15s;
  border: none; background: none; cursor: pointer; width: 100%; text-align: left;
}
.nav-item:hover, .nav-item.router-link-active { background: #fdf8f9; color: #6D1F3E; }
.nav-item.router-link-exact-active { background: #fdf0f4; color: #6D1F3E; font-weight: 600; }
.nav-item.small { font-size: .85rem; }
.nav-item.logout { color: #e53e3e; }
.nav-item.logout:hover { background: #fff5f5; }
.sidebar-footer { padding: .75rem .5rem; border-top: 1.5px solid #f0eff2; }

/* Main */
.dash-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.dash-topbar {
  background: #fff; border-bottom: 1.5px solid #e5e4e7;
  padding: 0 2rem; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
}
.page-title { font-size: 1.15rem; font-weight: 700; color: #2d1020; margin: 0; }
.topbar-right { display: flex; align-items: center; gap: 1.2rem; }
.user-chip { display: flex; align-items: center; gap: .6rem; }
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: #6D1F3E; color: #fff;
  font-size: .8rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.user-name { font-size: .88rem; font-weight: 600; color: #2d1020; }
.dash-content { padding: 2rem; flex: 1; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .dash-content { padding: 1rem; }
  .user-name { display: none; }
}
</style>
