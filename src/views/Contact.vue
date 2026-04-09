<script setup>
import { useAuth } from '../composables/useAuth.js'
const { isAuthenticated, dashboardRoute } = useAuth()
import { ref, reactive } from 'vue'
import { useStats } from '../composables/Usestats.js'

const { total, avg } = useStats()

const showDropdown = ref(false)
const menuOpen     = ref(false)
const submitted    = ref(false)
const sending      = ref(false)
const errorMsg     = ref('')

const form = reactive({
  prenom:    '',
  nom:       '',
  email:     '',
  telephone: '',
  adresse:   '',
  objet:     '',
  message:   '',
})

const errors = reactive({
  prenom:    false,
  nom:       false,
  email:     false,
  telephone: false,
  adresse:   false,
  objet:     false,
  message:   false,
})

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

function validatePhone(val) {
  return /^[\d\s\+\-\.]{8,}$/.test(val)
}

function validate() {
  errors.prenom    = !form.prenom.trim()
  errors.nom       = !form.nom.trim()
  errors.email     = !validateEmail(form.email)
  errors.telephone = !validatePhone(form.telephone)
  errors.adresse   = !form.adresse.trim()
  errors.objet     = !form.objet.trim()
  errors.message   = !form.message.trim()
  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  errorMsg.value = ''
  if (!validate()) {
    errorMsg.value = 'Veuillez remplir tous les champs correctement.'
    return
  }

  sending.value = true

  try {
    // ── À CONFIGURER ──────────────────────────────────────────────────────
    // 1. Créez un compte sur https://www.emailjs.com (gratuit)
    // 2. Remplacez les 3 valeurs ci-dessous par les vôtres :
    const SERVICE_ID  = 'VOTRE_SERVICE_ID'
    const TEMPLATE_ID = 'VOTRE_TEMPLATE_ID'
    const PUBLIC_KEY  = 'VOTRE_PUBLIC_KEY'
    // ─────────────────────────────────────────────────────────────────────

    // Le template EmailJS doit contenir ces variables :
    // {{prenom}}, {{nom}}, {{email}}, {{telephone}},
    // {{adresse}}, {{objet}}, {{message}}

    const payload = {
      service_id:  SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id:     PUBLIC_KEY,
      template_params: {
        prenom:    form.prenom,
        nom:       form.nom,
        email:     form.email,
        telephone: form.telephone,
        adresse:   form.adresse,
        objet:     form.objet,
        message:   form.message,
      }
    }

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Échec de l\'envoi')
    submitted.value = true
  } catch (e) {
    errorMsg.value = 'Une erreur est survenue. Veuillez réessayer ou nous appeler directement.'
  } finally {
    sending.value = false
  }
}

function resetForm() {
  Object.keys(form).forEach(k => form[k] = '')
  Object.keys(errors).forEach(k => errors[k] = false)
  submitted.value = false
  errorMsg.value  = ''
}
</script>

<template>
  <div class="site">

    <!-- ── TOP BAR ── -->
    <div class="topbar">
      <a href="tel:+33605042704" class="topbar-phone">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
        </svg>
        06 05 04 27 04
      </a>
      <div class="topbar-rating">
        <span class="stars">★★★★★</span>
        <span>{{ avg }}/5 · {{ total }} avis</span>
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

    <!-- Mobile menu -->
    <transition name="slide">
      <div v-if="menuOpen" class="mobile-menu">
        <a href="#" @click="menuOpen=false">Maintenance</a>
        <a href="#" @click="menuOpen=false">Rénovation</a>
        <a href="#" @click="menuOpen=false">Entretien</a>
        <a href="#" @click="menuOpen=false">Espaces verts</a>
        <RouterLink to="/avis"   @click="menuOpen=false">Avis clients</RouterLink>
        <RouterLink to="/apropos"  @click="menuOpen=false">À propos</RouterLink>
        <RouterLink to="/contact" @click="menuOpen=false">Contact</RouterLink>
        <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta-mobile" @click="menuOpen=false">Mon espace</RouterLink>
        <RouterLink v-else to="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>
      </div>
    </transition>

    <!-- ── PAGE HEADER ── -->
    <section class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-inner">
        <p class="page-eyebrow">Besoin d'informations ?</p>
        <h1>Contactez-nous</h1>
        <p class="page-hero-sub">Posez-nous toutes vos questions avant de créer votre compte. Notre équipe vous répondra dans les plus brefs délais.</p>
      </div>
    </section>

    <!-- ── FORMULAIRE ── -->
    <section class="contact-section">
      <div class="contact-layout">

        <!-- Infos latérales -->
        <aside class="contact-aside">
          <div class="aside-card">
            <div class="aside-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
            </div>
            <div>
              <h4>Téléphone</h4>
              <a href="tel:+33605042704">06 05 04 27 04</a>
            </div>
          </div>

          <div class="aside-card">
            <div class="aside-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <h4>Adresse</h4>
              <p>141 Rue Henri Ghesquière<br>59160 Lille</p>
            </div>
          </div>

          <div class="aside-card">
            <div class="aside-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h4>Disponibilité</h4>
              <p>7j/7 · 24h/24</p>
            </div>
          </div>

          <div class="aside-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Ce formulaire est réservé aux questions générales. Pour demander un devis, <strong>créez votre compte</strong>.</span>
          </div>
        </aside>

        <!-- Formulaire -->
        <div class="form-wrap">

          <!-- Succès -->
          <transition name="fade">
            <div v-if="submitted" class="form-success">
              <div class="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3>Message envoyé !</h3>
              <p>Merci pour votre message. Notre équipe vous contactera dans les plus brefs délais.</p>
              <button class="btn-primary" @click="resetForm">Envoyer un autre message</button>
            </div>
          </transition>

          <!-- Formulaire -->
          <form v-if="!submitted" @submit.prevent="handleSubmit" novalidate>

            <div class="form-row">
              <div class="field" :class="{ error: errors.prenom }">
                <label for="prenom">Prénom <span class="req">*</span></label>
                <input
                  id="prenom" type="text" v-model="form.prenom"
                  placeholder="Jean"
                  @input="errors.prenom = false"
                />
                <span v-if="errors.prenom" class="field-error">Prénom requis</span>
              </div>
              <div class="field" :class="{ error: errors.nom }">
                <label for="nom">Nom <span class="req">*</span></label>
                <input
                  id="nom" type="text" v-model="form.nom"
                  placeholder="Dupont"
                  @input="errors.nom = false"
                />
                <span v-if="errors.nom" class="field-error">Nom requis</span>
              </div>
            </div>

            <div class="form-row">
              <div class="field" :class="{ error: errors.email }">
                <label for="email">Adresse e-mail <span class="req">*</span></label>
                <input
                  id="email" type="email" v-model="form.email"
                  placeholder="jean.dupont@email.com"
                  @input="errors.email = false"
                />
                <span v-if="errors.email" class="field-error">E-mail invalide</span>
              </div>
              <div class="field" :class="{ error: errors.telephone }">
                <label for="telephone">Téléphone <span class="req">*</span></label>
                <input
                  id="telephone" type="tel" v-model="form.telephone"
                  placeholder="06 00 00 00 00"
                  @input="errors.telephone = false"
                />
                <span v-if="errors.telephone" class="field-error">Numéro invalide</span>
              </div>
            </div>

            <div class="field" :class="{ error: errors.adresse }">
              <label for="adresse">Adresse <span class="req">*</span></label>
              <input
                id="adresse" type="text" v-model="form.adresse"
                placeholder="12 rue de la Paix, 59000 Lille"
                @input="errors.adresse = false"
              />
              <span v-if="errors.adresse" class="field-error">Adresse requise</span>
            </div>

            <div class="field" :class="{ error: errors.objet }">
              <label for="objet">Objet <span class="req">*</span></label>
              <input
                id="objet" type="text" v-model="form.objet"
                placeholder="Question sur vos services, tarifs…"
                @input="errors.objet = false"
              />
              <span v-if="errors.objet" class="field-error">Objet requis</span>
            </div>

            <div class="field" :class="{ error: errors.message }">
              <label for="message">Message <span class="req">*</span></label>
              <textarea
                id="message" v-model="form.message" rows="6"
                placeholder="Décrivez votre demande en détail…"
                @input="errors.message = false"
              ></textarea>
              <span v-if="errors.message" class="field-error">Message requis</span>
            </div>

            <div class="form-footer">
              <span class="form-note"><span class="req">*</span> Champs obligatoires</span>
              <div class="form-footer-right">
                <transition name="fade">
                  <p v-if="errorMsg" class="global-error">{{ errorMsg }}</p>
                </transition>
                <button type="submit" class="btn-submit" :disabled="sending">
                  <svg v-if="sending" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  {{ sending ? 'Envoi en cours…' : 'Envoyer le message' }}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ── -->
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

  </div>
</template>

<style scoped>
/* ─────────── BASE ─────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.site { font-family: 'Segoe UI', system-ui, sans-serif; color: #2d1020; line-height: 1.65; overflow-x: hidden; }
a { text-decoration: none; }
em { font-style: normal; color: #6D1F3E; }

/* ─────────── TOPBAR ─────────── */
.topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 5%; background: #fff; border-bottom: 1px solid #eddde4;
  font-size: 12.5px;
}
.topbar-phone { display: flex; align-items: center; gap: 6px; color: #6D1F3E; font-weight: 600; }
.topbar-rating { display: flex; align-items: center; gap: 6px; color: #888; }
.stars { color: #f5a623; letter-spacing: 1px; }

/* ─────────── HEADER ─────────── */
.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 5%; height: 68px;
  background: #fff; border-bottom: 1px solid #eddde4;
  position: sticky; top: 0; z-index: 200;
  box-shadow: 0 1px 12px rgba(109,31,62,.06);
}
.header-logo img { height: 56px; width: auto; object-fit: contain; display: block; }

.header-nav { display: flex; align-items: center; gap: 6px; }
.nav-item {
  display: flex; align-items: center; gap: 3px;
  padding: 6px 12px; border-radius: 6px;
  font-size: 13.5px; color: #555; cursor: pointer;
  transition: background .15s, color .15s; position: relative;
}
.nav-item:hover { background: #faf0f3; color: #6D1F3E; }
.nav-item.active { color: #6D1F3E; font-weight: 600; background: #fdf0f4; }

.dropdown-menu {
  position: absolute; top: calc(100% + 8px); left: 0;
  background: #fff; border: 1px solid #eddde4; border-radius: 8px;
  padding: 6px 0; min-width: 160px; list-style: none;
  box-shadow: 0 8px 24px rgba(109,31,62,.12); z-index: 300;
}
.dropdown-menu li a {
  display: block; padding: 9px 16px;
  font-size: 13.5px; color: #555; transition: background .15s;
}
.dropdown-menu li a:hover { background: #faf0f3; color: #6D1F3E; }

.btn-cta {
  margin-left: 8px; padding: 8px 20px;
  background: #6D1F3E; color: #fff !important; border-radius: 6px;
  font-size: 13.5px; font-weight: 600;
  transition: background .2s, transform .15s;
}
.btn-cta:hover { background: #5a1830; transform: translateY(-1px); }

.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.burger span { display: block; width: 22px; height: 2px; background: #6D1F3E; border-radius: 2px; }

/* ─────────── MOBILE MENU ─────────── */
.mobile-menu {
  display: flex; flex-direction: column;
  background: #fff; border-bottom: 1px solid #eddde4; padding: 8px 5% 16px;
}
.mobile-menu a { padding: 11px 0; border-bottom: 1px solid #f5eef1; font-size: 15px; color: #555; }
.btn-cta-mobile {
  margin-top: 12px; background: #6D1F3E; color: #fff !important;
  text-align: center; padding: 13px; border-radius: 6px; font-weight: 600;
}
.slide-enter-active, .slide-leave-active { transition: max-height .3s ease, opacity .3s; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 600px; opacity: 1; }

/* ─────────── PAGE HERO ─────────── */
.page-hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #6D1F3E 0%, #8b2e52 100%);
  padding: 56px 5% 52px; text-align: center; color: #fff;
}
.page-hero-bg {
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.page-hero-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
.page-eyebrow {
  font-size: 12px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 10px;
}
.page-hero h1 { font-size: clamp(28px, 4vw, 44px); font-weight: 700; margin-bottom: 14px; }
.page-hero-sub { font-size: 16px; opacity: .8; line-height: 1.7; }

/* ─────────── CONTACT SECTION ─────────── */
.contact-section { padding: 64px 5%; background: #fdf8f9; }
.contact-layout {
  display: grid; grid-template-columns: 300px 1fr; gap: 40px;
  max-width: 1100px; margin: 0 auto; align-items: start;
}

/* ─────────── ASIDE ─────────── */
.contact-aside { display: flex; flex-direction: column; gap: 14px; }

.aside-card {
  background: #fff; border: 1px solid #eddde4; border-radius: 10px;
  padding: 18px 20px; display: flex; align-items: flex-start; gap: 14px;
}
.aside-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  background: #fdf0f4; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.aside-card h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 4px; }
.aside-card a { font-size: 14px; color: #6D1F3E; font-weight: 600; }
.aside-card p { font-size: 14px; color: #555; line-height: 1.6; }

.aside-note {
  background: #fdf0f4; border: 1px solid #eddde4; border-radius: 10px;
  padding: 14px 16px; display: flex; align-items: flex-start; gap: 10px;
  font-size: 13px; color: #555; line-height: 1.6;
}
.aside-note svg { flex-shrink: 0; margin-top: 2px; }
.aside-note strong { color: #6D1F3E; }

/* ─────────── FORM WRAP ─────────── */
.form-wrap {
  background: #fff; border: 1px solid #eddde4; border-radius: 14px;
  padding: 40px 40px;
}

/* ─────────── FIELDS ─────────── */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.field:last-of-type { margin-bottom: 0; }

label { font-size: 13px; font-weight: 600; color: #2d1020; }
.req { color: #6D1F3E; }

input, textarea {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid #ddd; border-radius: 7px;
  font-size: 14px; color: #2d1020; font-family: inherit;
  background: #fafafa;
  transition: border-color .2s, background .2s, box-shadow .2s;
  outline: none;
  resize: vertical;
}
input::placeholder, textarea::placeholder { color: #bbb; }
input:focus, textarea:focus {
  border-color: #6D1F3E; background: #fff;
  box-shadow: 0 0 0 3px rgba(109,31,62,.08);
}
.field.error input, .field.error textarea {
  border-color: #e05050; background: #fff8f8;
}
.field-error { font-size: 12px; color: #e05050; font-weight: 500; }

/* ─────────── FORM FOOTER ─────────── */
.form-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 24px; flex-wrap: wrap; gap: 12px;
}
.form-note { font-size: 12px; color: #aaa; }
.form-footer-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.global-error { font-size: 13px; color: #e05050; font-weight: 500; text-align: right; }

.btn-submit {
  display: inline-flex; align-items: center; gap: 8px;
  background: #6D1F3E; color: #fff;
  padding: 13px 28px; border-radius: 7px;
  font-size: 14px; font-weight: 700; border: none; cursor: pointer;
  transition: background .2s, transform .15s;
  font-family: inherit;
}
.btn-submit:hover:not(:disabled) { background: #5a1830; transform: translateY(-1px); }
.btn-submit:disabled { opacity: .65; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─────────── SUCCESS ─────────── */
.form-success {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 48px 24px; gap: 16px;
}
.success-icon {
  width: 64px; height: 64px; background: #6D1F3E; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.form-success h3 { font-size: 22px; font-weight: 700; color: #2d1020; }
.form-success p { font-size: 15px; color: #666; max-width: 380px; line-height: 1.7; }
.btn-primary {
  display: inline-block; background: #6D1F3E; color: #fff;
  padding: 12px 26px; border-radius: 7px; font-weight: 700; font-size: 14px;
  margin-top: 8px; cursor: pointer; border: none; font-family: inherit;
  transition: background .2s;
}
.btn-primary:hover { background: #5a1830; }

/* ─────────── FADE ─────────── */
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ─────────── FOOTER ─────────── */
.footer { background: #1e0a14; color: #a08090; padding: 48px 5% 0; }
.footer-inner {
  display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px;
  padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,.08);
}
.footer-brand { display: flex; flex-direction: column; gap: 10px; }
.footer-logo { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 1.5px; }
.footer-brand address { font-style: normal; font-size: 13px; line-height: 1.8; }
.footer-brand a { font-size: 14px; color: #c07090; font-weight: 600; }
.footer-links { display: flex; flex-direction: column; }
.footer-links h4 {
  font-size: 11px; font-weight: 700; color: #fff;
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;
}
.footer-links a { font-size: 13px; color: #a08090; padding: 4px 0; transition: color .2s; }
.footer-links a:hover { color: #fff; }
.footer-bottom { text-align: center; padding: 20px 0; font-size: 12px; color: #604050; }

/* ─────────── RESPONSIVE ─────────── */
@media (max-width: 900px) {
  .contact-layout { grid-template-columns: 1fr; }
  .contact-aside { flex-direction: row; flex-wrap: wrap; }
  .aside-card { flex: 1 1 200px; }
  .aside-note { flex: 1 1 100%; }
}
@media (max-width: 768px) {
  .header-nav { display: none; }
  .burger { display: flex; }
  .form-wrap { padding: 24px 20px; }
  .form-row { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 28px; }
  .form-footer { flex-direction: column; align-items: stretch; }
  .form-footer-right { align-items: stretch; }
  .btn-submit { justify-content: center; }
  .contact-aside { flex-direction: column; }
}
</style>