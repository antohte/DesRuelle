import { createRouter, createWebHistory } from 'vue-router'
import Home        from '../views/Home.vue'
import Contact     from '../views/Contact.vue'
import Avis        from '../views/Avis.vue'
import APropos     from '../views/APropos.vue'
import Prestations from '../views/Prestations.vue'

// Auth
import Connexion   from '../views/auth/Connexion.vue'
import Inscription from '../views/auth/Inscription.vue'

// Client
import ClientDashboard  from '../views/dashboard/client/ClientDashboard.vue'
import MesDevis         from '../views/dashboard/client/MesDevis.vue'
import DemandeDevis     from '../views/dashboard/client/DemandeDevis.vue'
import Paiement         from '../views/dashboard/client/Paiement.vue'
import MesInterventions from '../views/dashboard/client/MesInterventions.vue'
import SuiviIntervention from '../views/dashboard/client/SuiviIntervention.vue'

// Technicien
import TechnicienDashboard from '../views/dashboard/technicien/TechnicienDashboard.vue'
import MonPlanning         from '../views/dashboard/technicien/MonPlanning.vue'
import DetailIntervention  from '../views/dashboard/technicien/DetailIntervention.vue'

// Responsable
import ResponsableDashboard  from '../views/dashboard/responsable/ResponsableDashboard.vue'
import GestionDevis          from '../views/dashboard/responsable/GestionDevis.vue'
import GestionInterventions  from '../views/dashboard/responsable/GestionInterventions.vue'
import AssignerTechniciens   from '../views/dashboard/responsable/AssignerTechniciens.vue'
import GestionDemandes       from '../views/dashboard/responsable/GestionDemandes.vue'
import PlanningGlobal        from '../views/dashboard/responsable/PlanningGlobal.vue'
import GestionUtilisateurs   from '../views/dashboard/responsable/GestionUtilisateurs.vue'
import ListeContacts         from '../views/dashboard/responsable/ListeContacts.vue'
import ModerationAvis        from '../views/dashboard/responsable/ModerationAvis.vue'
import PlanningTechniciens   from '../views/dashboard/responsable/PlanningTechniciens.vue'

const routes = [
  // Public
  { path: '/',            name: 'Home',        component: Home        },
  { path: '/contact',     name: 'Contact',     component: Contact     },
  { path: '/avis',        name: 'Avis',        component: Avis        },
  { path: '/apropos',     name: 'APropos',     component: APropos     },
  { path: '/prestations', name: 'Prestations', component: Prestations },

  // Auth
  { path: '/connexion',   name: 'Connexion',   component: Connexion,  meta: { guest: true }  },
  { path: '/inscription', name: 'Inscription', component: Inscription, meta: { guest: true } },

  // Client Dashboard
  { path: '/dashboard/client',                       name: 'ClientDashboard',   component: ClientDashboard,   meta: { requiresAuth: true, role: 'client' } },
  { path: '/dashboard/client/devis',                 name: 'MesDevis',          component: MesDevis,          meta: { requiresAuth: true, role: 'client' } },
  { path: '/dashboard/client/devis/nouveau',         name: 'DemandeDevis',      component: DemandeDevis,      meta: { requiresAuth: true, role: 'client' } },
  { path: '/dashboard/client/paiement/:id',          name: 'Paiement',          component: Paiement,          meta: { requiresAuth: true, role: 'client' } },
  { path: '/dashboard/client/interventions',         name: 'MesInterventions',  component: MesInterventions,  meta: { requiresAuth: true, role: 'client' } },
  { path: '/dashboard/client/interventions/:id',     name: 'SuiviIntervention', component: SuiviIntervention, meta: { requiresAuth: true, role: 'client' } },

  // Technicien Dashboard
  { path: '/dashboard/technicien',                          name: 'TechnicienDashboard', component: TechnicienDashboard, meta: { requiresAuth: true, role: 'technicien' } },
  { path: '/dashboard/technicien/planning',                 name: 'MonPlanning',         component: MonPlanning,         meta: { requiresAuth: true, role: 'technicien' } },
  { path: '/dashboard/technicien/interventions/:id',        name: 'DetailInterventionTech', component: DetailIntervention, meta: { requiresAuth: true, role: 'technicien' } },

  // Responsable Dashboard
  { path: '/dashboard/responsable',                                name: 'ResponsableDashboard', component: ResponsableDashboard,  meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/devis',                          name: 'GestionDevis',         component: GestionDevis,          meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/interventions',                  name: 'GestionInterventions', component: GestionInterventions,  meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/interventions/:id/assigner',     name: 'AssignerTechniciens',  component: AssignerTechniciens,   meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/demandes',                       name: 'GestionDemandes',      component: GestionDemandes,       meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/planning',                       name: 'PlanningGlobal',       component: PlanningGlobal,        meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/utilisateurs',                   name: 'GestionUtilisateurs',  component: GestionUtilisateurs,   meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/contacts',                       name: 'ListeContacts',        component: ListeContacts,         meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/avis',                           name: 'ModerationAvis',       component: ModerationAvis,        meta: { requiresAuth: true, role: 'responsable' } },
  { path: '/dashboard/responsable/planning-techniciens',           name: 'PlanningTechniciens',  component: PlanningTechniciens,   meta: { requiresAuth: true, role: 'responsable' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      const el = document.querySelector(to.hash)
      if (el) return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// Navigation guard
router.beforeEach((to) => {
  const token = localStorage.getItem('auth_token')
  let userRole = null

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userRole = payload.role
    } catch { /* token invalide */ }
  }

  // Route protégée
  if (to.meta.requiresAuth) {
    if (!token) return '/connexion'
    if (to.meta.role && userRole !== to.meta.role) {
      // Rediriger vers le bon dashboard
      if (userRole === 'responsable') return '/dashboard/responsable'
      if (userRole === 'technicien')  return '/dashboard/technicien'
      return '/dashboard/client'
    }
  }

  // Route guest (login/register) : rediriger si déjà connecté
  if (to.meta.guest && token) {
    if (userRole === 'responsable') return '/dashboard/responsable'
    if (userRole === 'technicien')  return '/dashboard/technicien'
    return '/dashboard/client'
  }
})

export default router
