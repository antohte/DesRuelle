import { createRouter, createWebHistory } from 'vue-router'
import Home        from '../views/Home.vue'
import Contact     from '../views/Contact.vue'
import Avis        from '../views/Avis.vue'
import APropos     from '../views/APropos.vue'
import Prestations from '../views/Prestations.vue'

const routes = [
  { path: '/',            name: 'Home',        component: Home        },
  { path: '/contact',     name: 'Contact',     component: Contact     },
  { path: '/avis',        name: 'Avis',        component: Avis        },
  { path: '/apropos',     name: 'APropos',     component: APropos     },
  { path: '/prestations', name: 'Prestations', component: Prestations },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      const el = document.querySelector(to.hash)
      if (el) return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
