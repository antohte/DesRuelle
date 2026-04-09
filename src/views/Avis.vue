<script setup>
import { useAuth } from '../composables/useAuth.js'
const { isAuthenticated, dashboardRoute } = useAuth()
import { ref, computed, reactive, onMounted } from 'vue'
import { useStats } from '../composables/Usestats.js'

const API_URL = '/api/avis'
const { total, avg } = useStats()

const showDropdown = ref(false)
const menuOpen     = ref(false)
const filterNote   = ref(0)

const reviews     = ref([])
const loadingAvis = ref(true)

onMounted(async () => {
  try {
    const res  = await fetch(API_URL)
    const data = await res.json()
    if (data.success) reviews.value = data.data
  } catch (e) {
    console.error('Impossible de charger les avis', e)
  } finally {
    loadingAvis.value = false
  }
})

const avgRating = computed(() => {
  if (!reviews.value.length) return '—'
  const sum = reviews.value.reduce((a, r) => a + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const filteredReviews = computed(() =>
  filterNote.value === 0
    ? reviews.value
    : reviews.value.filter(r => r.rating === filterNote.value)
)

const ratingCounts = computed(() => {
  const c = { 5:0, 4:0, 3:0, 2:0, 1:0 }
  reviews.value.forEach(r => { c[r.rating] = (c[r.rating] || 0) + 1 })
  return c
})

function starsArray(rating) {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
}

// ── Modale ─────────────────────────────────────────────────
const showModal    = ref(false)
const modalSent    = ref(false)
const modalSending = ref(false)
const modalError   = ref('')
const hoverRating  = ref(0)

const services = [
  'Gestion locative',
  'Entretien & nettoyage',
  'Rénovation intérieure / extérieure',
  'Maintenance (électricité, plomberie…)',
  'Entretien d\'espaces verts',
  'Événementiel & autres services',
]

const form = reactive({
  prenom:   '',
  nom:      '',
  email:    '',
  location: '',
  service:  '',
  rating:   0,
  texte:    '',
})

const formErrors = reactive({
  prenom:   false,
  nom:      false,
  email:    false,
  location: false,
  service:  false,
  rating:   false,
  texte:    false,
})

function openModal() {
  showModal.value  = true
  modalSent.value  = false
  modalError.value = ''
  Object.keys(form).forEach(k => form[k] = k === 'rating' ? 0 : '')
  Object.keys(formErrors).forEach(k => formErrors[k] = false)
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  showModal.value = false
  document.body.style.overflow = ''
}

function validate() {
  formErrors.prenom   = !form.prenom.trim()
  formErrors.nom      = !form.nom.trim()
  formErrors.email    = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  formErrors.location = !form.location.trim()
  formErrors.service  = !form.service
  formErrors.rating   = form.rating === 0
  formErrors.texte    = !form.texte.trim()
  return !Object.values(formErrors).some(Boolean)
}

async function submitAvis() {
  modalError.value = ''
  if (!validate()) { modalError.value = 'Veuillez remplir tous les champs.'; return }
  modalSending.value = true
  try {
    const res  = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || 'Erreur')
    modalSent.value = true
  } catch {
    modalError.value = 'Une erreur est survenue. Réessayez.'
  } finally {
    modalSending.value = false
  }
}
</script>

<template>
  <div class="site">

    <!-- TOP BAR -->
    <div class="topbar">
      <a href="tel:+33605042704" class="topbar-phone">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
        </svg>
        06 05 04 27 04
      </a>
      <div class="topbar-rating">
        <span class="stars-gold">★★★★★</span>
        <span>{{ avg }}/5 · {{ reviews.length }} avis</span>
      </div>
    </div>

    <!-- ── HEADER ── -->
    <header class="header">
      <RouterLink to="/" class="header-logo">
        <img src="/images/logo.png" alt="Conciergerie Desruelle" />
      </RouterLink>
      <nav class="header-nav">
        <RouterLink to="/prestations" class="nav-item">Prestations</RouterLink>
        <RouterLink to="/avis"        class="nav-item">Avis</RouterLink>
        <RouterLink to="/apropos"     class="nav-item">À propos</RouterLink>
        <RouterLink to="/contact"     class="nav-item">Contact</RouterLink>
        <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta">Mon espace</RouterLink>
        <RouterLink v-else to="/connexion" class="btn-cta">Connexion</RouterLink>
      </nav>
      <button class="burger" @click="menuOpen = !menuOpen">
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
      </button>
    </header>

    <transition name="slide">
      <div v-if="menuOpen" class="mobile-menu">
        <a href="#" @click="menuOpen=false">Maintenance</a>
        <a href="#" @click="menuOpen=false">Rénovation</a>
        <a href="#" @click="menuOpen=false">Entretien</a>
        <a href="#" @click="menuOpen=false">Espaces verts</a>
        <RouterLink to="/avis"    @click="menuOpen=false">Avis clients</RouterLink>
        <RouterLink to="/apropos"  @click="menuOpen=false">À propos</RouterLink>
        <RouterLink to="/contact" @click="menuOpen=false">Contact</RouterLink>
        <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta-mobile" @click="menuOpen=false">Mon espace</RouterLink>
        <RouterLink v-else to="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>
      </div>
    </transition>

    <!-- PAGE HERO -->
    <section class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-inner">
        <p class="page-eyebrow">Certifiés et contrôlés</p>
        <h1>Avis de nos clients</h1>
        <p class="page-hero-sub">Découvrez les retours d'expérience de nos clients satisfaits.</p>
        <div v-if="reviews.length" class="hero-score">
          <span class="hero-note">{{ avg }}</span>
          <div class="hero-stars-wrap">
            <span class="stars-gold hero-stars">★★★★★</span>
            <span class="hero-count">{{ total }} avis</span>
          </div>
        </div>
      </div>
    </section>

    <!-- REVIEWS SECTION -->
    <section class="reviews-section">
      <div class="reviews-layout">

        <!-- Sidebar -->
        <aside class="reviews-aside">
          <div class="aside-summary">
            <div class="summary-score">{{ avg }}</div>
            <div class="stars-gold summary-stars">★★★★★</div>
            <div class="summary-total">sur {{ total }} avis</div>
          </div>

          <div class="rating-breakdown">
            <h4>Répartition</h4>
            <div v-for="n in [5,4,3,2,1]" :key="n"
              class="breakdown-row" :class="{ selected: filterNote===n }"
              @click="filterNote = filterNote===n ? 0 : n">
              <span class="breakdown-label">{{ n }} ★</span>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar"
                  :style="{ width: reviews.length ? (ratingCounts[n]/reviews.length*100)+'%' : '0%' }">
                </div>
              </div>
              <span class="breakdown-count">{{ ratingCounts[n] }}</span>
            </div>
          </div>

          <button v-if="filterNote > 0" class="reset-filter" @click="filterNote=0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Effacer le filtre
          </button>

          <div class="aside-cta">
            <p>Vous avez fait appel à nos services ?</p>
            <button class="btn-primary" @click="openModal">Laisser un avis</button>
          </div>
        </aside>

        <!-- Grille -->
        <div class="reviews-main">

          <!-- Loader -->
          <div v-if="loadingAvis" class="loading">
            <svg class="spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span>Chargement des avis…</span>
          </div>

          <template v-else>
            <div class="reviews-toolbar">
              <p class="reviews-count">
                <strong>{{ filteredReviews.length }}</strong>
                avis{{ filterNote > 0 ? ` · ${filterNote} étoile${filterNote>1?'s':''}` : '' }}
              </p>
            </div>

            <transition-group name="list" tag="div" class="reviews-grid">
              <div v-for="review in filteredReviews" :key="review.id" class="review-card">
                <div class="review-card-top">
                  <div class="review-avatar">{{ review.name.charAt(0) }}</div>
                  <div class="review-card-meta">
                    <strong class="review-name">{{ review.name }}</strong>
                    <span class="review-loc">{{ review.location }} · {{ review.date }}</span>
                  </div>
                  <span v-if="review.controle" class="badge-ok">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Contrôlé
                  </span>
                  <span v-else class="badge-pending">En attente</span>
                </div>

                <div class="review-stars">
                  <span v-for="(f,i) in starsArray(review.rating)" :key="i"
                    :class="f ? 'star-filled' : 'star-empty'">★</span>
                  <span class="review-score-num">{{ review.rating }}/5</span>
                </div>

                <div class="review-service-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  {{ review.service }}
                </div>

                <p class="review-text">"{{ review.texte }}"</p>
              </div>
            </transition-group>

            <div v-if="filteredReviews.length === 0 && !loadingAvis" class="no-results">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#eddde4" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>{{ filterNote > 0 ? 'Aucun avis pour cette note.' : 'Aucun avis publié pour le moment.' }}</p>
              <button v-if="filterNote > 0" class="btn-secondary" @click="filterNote=0">Voir tous les avis</button>
            </div>
          </template>
        </div>

      </div>
    </section>

    <!-- CTA -->
    <section class="cta-band">
      <div class="cta-band-inner">
        <div>
          <h2>Convaincu par nos clients ?</h2>
          <p>Créez votre compte pour demander un devis personnalisé.</p>
        </div>
        <RouterLink to="/connexion" class="btn-hero-primary">Connexion</RouterLink>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">CONCIERGERIE DESRUELLE</div>
          <address>141 Rue Henri Ghesquière<br>59160 Lille</address>
          <a href="tel:+33605042704">06 05 04 27 04</a>
        </div>
        <div class="footer-links">
          <h4>Prestations</h4>
          <a href="#">Maintenance</a>
          <a href="#">Rénovation</a>
          <a href="#">Entretien</a>
          <a href="#">Espaces verts</a>
          <RouterLink to="/avis">Avis clients</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
        </div>
        <div class="footer-links">
          <h4>Légal</h4>
          <a href="#">Mentions légales</a>
          <a href="#">CGU - Avis</a>
          <a href="#">Confidentialité</a>
          <a href="#">Cookies</a>
        </div>
      </div>
      <div class="footer-bottom">© 2025 Conciergerie Desruelle · Tous droits réservés</div>
    </footer>

    <!-- ══════════════════════════════════════════
         MODALE — Laisser un avis
    ══════════════════════════════════════════ -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">

          <!-- Succès -->
          <div v-if="modalSent" class="modal-success">
            <div class="success-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3>Merci pour votre avis !</h3>
            <p>Il sera publié après validation par notre équipe.</p>
            <button class="btn-primary" @click="closeModal">Fermer</button>
          </div>

          <!-- Formulaire -->
          <template v-else>
            <div class="modal-header">
              <h2>Laisser un avis</h2>
              <button class="modal-close" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-body">
              <!-- Prénom / Nom -->
              <div class="form-row">
                <div class="field" :class="{ error: formErrors.prenom }">
                  <label>Prénom <span class="req">*</span></label>
                  <input type="text" v-model="form.prenom" placeholder="Jean" @input="formErrors.prenom=false" />
                  <span v-if="formErrors.prenom" class="field-error">Requis</span>
                </div>
                <div class="field" :class="{ error: formErrors.nom }">
                  <label>Nom <span class="req">*</span></label>
                  <input type="text" v-model="form.nom" placeholder="Dupont" @input="formErrors.nom=false" />
                  <span v-if="formErrors.nom" class="field-error">Requis</span>
                </div>
              </div>

              <div class="field" :class="{ error: formErrors.email }">
                <label>Email <span class="req">*</span></label>
                <input type="email" v-model="form.email" placeholder="jean.dupont@email.com" @input="formErrors.email=false" />
                <span v-if="formErrors.email" class="field-error">Email invalide</span>
              </div>

              <div class="field" :class="{ error: formErrors.location }">
                <label>Ville <span class="req">*</span></label>
                <input type="text" v-model="form.location" placeholder="Lille (59)" @input="formErrors.location=false" />
                <span v-if="formErrors.location" class="field-error">Requis</span>
              </div>

              <!-- Service -->
              <div class="field" :class="{ error: formErrors.service }">
                <label>Service concerné <span class="req">*</span></label>
                <select v-model="form.service" @change="formErrors.service=false">
                  <option value="" disabled>Sélectionnez…</option>
                  <option v-for="s in services" :key="s" :value="s">{{ s }}</option>
                </select>
                <span v-if="formErrors.service" class="field-error">Requis</span>
              </div>

              <!-- Étoiles -->
              <div class="field" :class="{ error: formErrors.rating }">
                <label>Note <span class="req">*</span></label>
                <div class="star-picker">
                  <button v-for="n in 5" :key="n" type="button" class="star-btn"
                    :class="{ active: n <= (hoverRating || form.rating) }"
                    @mouseenter="hoverRating=n" @mouseleave="hoverRating=0"
                    @click="form.rating=n; formErrors.rating=false">★</button>
                  <span v-if="form.rating" class="star-label">
                    {{ ['','Très mauvais','Mauvais','Correct','Bien','Excellent'][form.rating] }}
                  </span>
                </div>
                <span v-if="formErrors.rating" class="field-error">Veuillez donner une note</span>
              </div>

              <!-- Texte -->
              <div class="field" :class="{ error: formErrors.texte }">
                <label>Votre avis <span class="req">*</span></label>
                <textarea v-model="form.texte" rows="4"
                  placeholder="Décrivez votre expérience…"
                  @input="formErrors.texte=false"
                  maxlength="500"></textarea>
                <div class="char-count" :class="{ warn: form.texte.length > 450 }">
                  {{ form.texte.length }} / 500
                </div>
                <span v-if="formErrors.texte" class="field-error">Requis</span>
              </div>

              <p class="modal-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Seuls votre prénom et l'initiale de votre nom seront affichés publiquement.
              </p>
            </div>

            <div class="modal-footer">
              <transition name="fade">
                <p v-if="modalError" class="global-error">{{ modalError }}</p>
              </transition>
              <button class="btn-submit" :disabled="modalSending" @click="submitAvis">
                <svg v-if="modalSending" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                {{ modalSending ? 'Envoi…' : 'Soumettre mon avis' }}
              </button>
            </div>
          </template>

        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.site { font-family: 'Segoe UI', system-ui, sans-serif; color: #2d1020; line-height: 1.65; overflow-x: hidden; }
a { text-decoration: none; }

/* TOPBAR */
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 6px 5%; background: #fff; border-bottom: 1px solid #eddde4; font-size: 12.5px; }
.topbar-phone { display: flex; align-items: center; gap: 6px; color: #6D1F3E; font-weight: 600; }
.topbar-rating { display: flex; align-items: center; gap: 6px; color: #888; }
.stars-gold { color: #f5a623; letter-spacing: 1px; }

/* HEADER */
.header { display: flex; justify-content: space-between; align-items: center; padding: 0 5%; height: 68px; background: #fff; border-bottom: 1px solid #eddde4; position: sticky; top: 0; z-index: 200; box-shadow: 0 1px 12px rgba(109,31,62,.06); }
.header-logo img { height: 56px; width: auto; object-fit: contain; display: block; }
.header-nav { display: flex; align-items: center; gap: 6px; }
.nav-item { display: flex; align-items: center; gap: 3px; padding: 6px 12px; border-radius: 6px; font-size: 13.5px; color: #555; cursor: pointer; transition: background .15s, color .15s; position: relative; }
.nav-item:hover { background: #faf0f3; color: #6D1F3E; }
.nav-item.active { color: #6D1F3E; font-weight: 600; background: #fdf0f4; }
.dropdown-menu { position: absolute; top: calc(100% + 8px); left: 0; background: #fff; border: 1px solid #eddde4; border-radius: 8px; padding: 6px 0; min-width: 160px; list-style: none; box-shadow: 0 8px 24px rgba(109,31,62,.12); z-index: 300; }
.dropdown-menu li a { display: block; padding: 9px 16px; font-size: 13.5px; color: #555; transition: background .15s; }
.dropdown-menu li a:hover { background: #faf0f3; color: #6D1F3E; }
.btn-cta { margin-left: 8px; padding: 8px 20px; background: #6D1F3E; color: #fff !important; border-radius: 6px; font-size: 13.5px; font-weight: 600; transition: background .2s, transform .15s; }
.btn-cta:hover { background: #5a1830; transform: translateY(-1px); }
.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.burger span { display: block; width: 22px; height: 2px; background: #6D1F3E; border-radius: 2px; }
.mobile-menu { display: flex; flex-direction: column; background: #fff; border-bottom: 1px solid #eddde4; padding: 8px 5% 16px; }
.mobile-menu a { padding: 11px 0; border-bottom: 1px solid #f5eef1; font-size: 15px; color: #555; }
.btn-cta-mobile { margin-top: 12px; background: #6D1F3E; color: #fff !important; text-align: center; padding: 13px; border-radius: 6px; font-weight: 600; }
.slide-enter-active, .slide-leave-active { transition: max-height .3s ease, opacity .3s; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 600px; opacity: 1; }

/* PAGE HERO */
.page-hero { position: relative; overflow: hidden; background: linear-gradient(135deg, #6D1F3E 0%, #8b2e52 100%); padding: 56px 5% 52px; text-align: center; color: #fff; }
.page-hero-bg { position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.page-hero-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
.page-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 10px; }
.page-hero h1 { font-size: clamp(28px, 4vw, 44px); font-weight: 700; margin-bottom: 14px; }
.page-hero-sub { font-size: 15px; opacity: .8; line-height: 1.7; margin-bottom: 28px; }
.page-hero-sub strong { color: #fff; }
.hero-score { display: inline-flex; align-items: center; gap: 14px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); padding: 12px 24px; border-radius: 12px; }
.hero-note { font-size: 40px; font-weight: 700; line-height: 1; }
.hero-stars-wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.hero-stars { font-size: 20px; }
.hero-count { font-size: 12px; opacity: .75; }

/* REVIEWS SECTION */
.reviews-section { padding: 56px 5%; background: #fdf8f9; }
.reviews-layout { display: grid; grid-template-columns: 260px 1fr; gap: 36px; max-width: 1100px; margin: 0 auto; align-items: start; }

/* ASIDE */
.reviews-aside { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 88px; }
.aside-summary { background: #fff; border: 1px solid #eddde4; border-radius: 12px; padding: 24px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.summary-score { font-size: 52px; font-weight: 700; color: #2d1020; line-height: 1; }
.summary-stars { font-size: 22px; }
.summary-total { font-size: 13px; color: #888; }
.summary-badge { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; background: #eaf7f0; color: #1a7a4a; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
.rating-breakdown { background: #fff; border: 1px solid #eddde4; border-radius: 12px; padding: 20px; }
.rating-breakdown h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 14px; }
.breakdown-row { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 6px; cursor: pointer; transition: background .15s; margin-bottom: 4px; }
.breakdown-row:hover, .breakdown-row.selected { background: #fdf0f4; }
.breakdown-label { font-size: 13px; color: #6D1F3E; font-weight: 600; min-width: 28px; }
.breakdown-bar-wrap { flex: 1; height: 7px; background: #f0e8eb; border-radius: 4px; overflow: hidden; }
.breakdown-bar { height: 100%; background: #6D1F3E; border-radius: 4px; transition: width .4s ease; }
.breakdown-count { font-size: 12px; color: #999; min-width: 16px; text-align: right; }
.reset-filter { display: flex; align-items: center; justify-content: center; gap: 6px; background: none; border: 1px solid #eddde4; border-radius: 7px; padding: 8px; font-size: 13px; color: #888; cursor: pointer; transition: all .2s; font-family: inherit; width: 100%; }
.reset-filter:hover { border-color: #6D1F3E; color: #6D1F3E; }
.aside-cta { background: #fdf0f4; border: 1px solid #eddde4; border-radius: 12px; padding: 20px; text-align: center; }
.aside-cta p { font-size: 13px; color: #555; margin-bottom: 12px; line-height: 1.5; }

/* BUTTONS */
.btn-primary { display: inline-block; background: #6D1F3E; color: #fff; padding: 10px 20px; border-radius: 7px; font-weight: 700; font-size: 13px; transition: background .2s; border: none; cursor: pointer; font-family: inherit; width: 100%; text-align: center; }
.btn-primary:hover { background: #5a1830; }
.btn-secondary { display: inline-block; border: 2px solid #6D1F3E; color: #6D1F3E; padding: 9px 20px; border-radius: 7px; font-weight: 700; font-size: 13px; background: none; cursor: pointer; font-family: inherit; transition: all .2s; }
.btn-secondary:hover { background: #6D1F3E; color: #fff; }

/* REVIEWS MAIN */
.loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 48px; color: #999; font-size: 14px; }
.reviews-toolbar { margin-bottom: 20px; }
.reviews-count { font-size: 14px; color: #888; }
.reviews-count strong { color: #2d1020; font-size: 16px; }
.reviews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.review-card { background: #fff; border: 1px solid #eddde4; border-radius: 12px; padding: 22px 20px; display: flex; flex-direction: column; gap: 12px; transition: box-shadow .2s, transform .2s; }
.review-card:hover { box-shadow: 0 6px 20px rgba(109,31,62,.1); transform: translateY(-2px); }
.review-card-top { display: flex; align-items: center; gap: 10px; }
.review-avatar { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; background: #6D1F3E; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; }
.review-card-meta { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.review-name { font-size: 14px; font-weight: 700; color: #2d1020; }
.review-loc { font-size: 12px; color: #999; }
.badge-ok { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; background: #eaf7f0; color: #1a7a4a; padding: 2px 10px; border-radius: 10px; font-weight: 600; flex-shrink: 0; }
.badge-pending { font-size: 11px; background: #fff8e8; color: #b07800; padding: 2px 10px; border-radius: 10px; font-weight: 600; flex-shrink: 0; }
.review-stars { display: flex; align-items: center; gap: 2px; }
.star-filled { color: #f5a623; font-size: 15px; }
.star-empty  { color: #ddd; font-size: 15px; }
.review-score-num { font-size: 13px; font-weight: 700; color: #2d1020; margin-left: 6px; }
.review-service-tag { display: inline-flex; align-items: center; gap: 5px; background: #fdf0f4; color: #6D1F3E; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px; width: fit-content; }
.review-text { font-size: 14px; color: #555; line-height: 1.7; font-style: italic; }
.no-results { grid-column: 1/-1; text-align: center; padding: 48px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.no-results p { font-size: 15px; color: #999; }
.list-enter-active, .list-leave-active { transition: opacity .25s, transform .25s; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(8px); }

/* CTA BAND */
.cta-band { background: linear-gradient(135deg, #6D1F3E 0%, #8b2e52 100%); padding: 56px 5%; }
.cta-band-inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; max-width: 900px; margin: 0 auto; }
.cta-band h2 { font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: #fff; margin-bottom: 8px; }
.cta-band p { font-size: 15px; color: rgba(255,255,255,.75); }
.btn-hero-primary { padding: 13px 28px; background: #fff; color: #6D1F3E; border-radius: 7px; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .15s; white-space: nowrap; }
.btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }

/* FOOTER */
.footer { background: #1e0a14; color: #a08090; padding: 48px 5% 0; }
.footer-inner { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,.08); }
.footer-brand { display: flex; flex-direction: column; gap: 10px; }
.footer-logo { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 1.5px; }
.footer-brand address { font-style: normal; font-size: 13px; line-height: 1.8; }
.footer-brand a { font-size: 14px; color: #c07090; font-weight: 600; }
.footer-links { display: flex; flex-direction: column; }
.footer-links h4 { font-size: 11px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; }
.footer-links a { font-size: 13px; color: #a08090; padding: 4px 0; transition: color .2s; }
.footer-links a:hover { color: #fff; }
.footer-bottom { text-align: center; padding: 20px 0; font-size: 12px; color: #604050; }

/* ── MODALE ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(20, 5, 12, 0.55);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 520px;
  box-shadow: 0 24px 64px rgba(109,31,62,.25);
  display: flex; flex-direction: column;
  max-height: 90vh; overflow: hidden;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 28px 18px;
  border-bottom: 1px solid #f0e8eb;
}
.modal-header h2 { font-size: 19px; font-weight: 700; color: #2d1020; }
.modal-close { background: none; border: none; cursor: pointer; color: #aaa; padding: 4px; border-radius: 6px; transition: color .2s, background .2s; }
.modal-close:hover { color: #6D1F3E; background: #fdf0f4; }
.modal-body { padding: 22px 28px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 0; }
.modal-footer {
  padding: 16px 28px 22px;
  border-top: 1px solid #f0e8eb;
  display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
}
.modal-note { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; color: #888; line-height: 1.55; margin-top: 4px; }
.modal-note svg { flex-shrink: 0; margin-top: 1px; }

/* FORM */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.field:last-of-type { margin-bottom: 0; }
label { font-size: 13px; font-weight: 600; color: #2d1020; }
.req { color: #6D1F3E; }
input, textarea, select {
  width: 100%; padding: 10px 13px; border: 1.5px solid #ddd; border-radius: 7px;
  font-size: 14px; color: #2d1020; font-family: inherit; background: #fafafa;
  transition: border-color .2s, box-shadow .2s; outline: none;
}
input:focus, textarea:focus, select:focus { border-color: #6D1F3E; background: #fff; box-shadow: 0 0 0 3px rgba(109,31,62,.08); }
.field.error input, .field.error textarea, .field.error select { border-color: #e05050; background: #fff8f8; }
.field-error { font-size: 12px; color: #e05050; font-weight: 500; }
textarea { resize: vertical; }
select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236D1F3E' stroke-width='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 13px center; padding-right: 34px; cursor: pointer; }

/* STAR PICKER */
.star-picker { display: flex; align-items: center; gap: 3px; }
.star-btn { background: none; border: none; font-size: 30px; color: #ddd; cursor: pointer; padding: 0; line-height: 1; transition: color .15s, transform .1s; }
.star-btn.active { color: #f5a623; }
.star-btn:hover { transform: scale(1.2); }
.star-label { font-size: 13px; color: #6D1F3E; font-weight: 600; margin-left: 8px; }
.char-count { font-size: 11.5px; color: #bbb; text-align: right; }
.char-count.warn { color: #e05050; }

/* SUBMIT */
.btn-submit { display: inline-flex; align-items: center; gap: 8px; background: #6D1F3E; color: #fff; padding: 12px 26px; border-radius: 7px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: background .2s; font-family: inherit; }
.btn-submit:hover:not(:disabled) { background: #5a1830; }
.btn-submit:disabled { opacity: .65; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.global-error { font-size: 13px; color: #e05050; font-weight: 500; }

/* SUCCESS */
.modal-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 32px; gap: 14px; }
.success-icon { width: 62px; height: 62px; background: #6D1F3E; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.modal-success h3 { font-size: 21px; font-weight: 700; color: #2d1020; }
.modal-success p { font-size: 14px; color: #666; line-height: 1.7; max-width: 320px; }
.modal-success .btn-primary { width: auto; padding: 11px 28px; }

/* TRANSITIONS */
.modal-enter-active, .modal-leave-active { transition: opacity .25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform .25s; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: translateY(16px) scale(0.97); }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .reviews-layout { grid-template-columns: 1fr; }
  .reviews-aside { position: static; flex-direction: row; flex-wrap: wrap; }
  .aside-summary { flex: 1 1 160px; }
  .rating-breakdown { flex: 1 1 200px; }
  .aside-cta { flex: 1 1 100%; }
}
@media (max-width: 768px) {
  .header-nav { display: none; }
  .burger { display: flex; }
  .reviews-grid { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 28px; }
  .cta-band-inner { flex-direction: column; text-align: center; }
  .reviews-aside { flex-direction: column; }
  .form-row { grid-template-columns: 1fr; }
  .modal { max-height: 95vh; }
}
</style>