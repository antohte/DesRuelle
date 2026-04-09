<script setup>
import { ref } from 'vue'
import { useStats } from '../composables/useStats.js'
import { useAuth } from '../composables/useAuth.js'

const { total, avg } = useStats()
const { isAuthenticated, dashboardRoute } = useAuth()

const menuOpen = ref(false)
const activeService = ref(null)

const services = [
  { iconId: 'home',      title: 'Gestion locative',     desc: 'Recherche de locataires, bail, états des lieux, remise des clés, relance impayés.' },
  { iconId: 'broom',     title: 'Entretien & nettoyage', desc: 'Maisons, appartements, locaux commerciaux, immeubles, vitres.' },
  { iconId: 'hammer',    title: 'Rénovation',            desc: 'Cuisine, salle de bains, peinture, revêtements intérieur et extérieur.' },
  { iconId: 'wrench',    title: 'Maintenance',           desc: 'Électricité, plomberie, remplacement d\'équipement et électroménager.' },
  { iconId: 'leaf',      title: 'Espaces verts',         desc: 'Taille de haies, abattage d\'arbres, entretien de jardins.' },
  { iconId: 'star',      title: 'Événementiel & autres', desc: 'Organisation d\'événements, gardiennage d\'animaux, courses, débarras.' },
]

const audiences = [
  { iconId: 'user',     label: 'Particulier', text: 'Service complet pour simplifier votre quotidien et prendre soin de votre logement.' },
  { iconId: 'building', label: 'Entreprise',  text: 'Entretien de locaux professionnels pour un cadre de travail optimal.' },
  { iconId: 'key',      label: 'Propriétaire',text: 'Mise en location et remise en état de votre bien par un professionnel de confiance.' },
  { iconId: 'layers',   label: 'Syndic',      text: 'Nettoyage des parties communes par une équipe à taille humaine et réactive.' },
]

const icons = {
  home:     `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  broom:    `<path d="M5 22l9-9"/><path d="M18 2a4 4 0 0 0-4 4v2H8a6 6 0 0 0-6 6v2h16v-2a6 6 0 0 0-2-4.47V6a2 2 0 0 1 2-2z"/>`,
  hammer:   `<path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7a1.41 1.41 0 0 0 .49-1 1.47 1.47 0 0 0-1.4-1.43 1.41 1.41 0 0 0-1 .43l-1.27 1.27 2.2 2.2z"/>`,
  wrench:   `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  leaf:     `<path d="M2 22c1.25-1.25 2.5-2.5 3.75-3.75"/><path d="M22 2C11 2 2 11 2 22c4-4 8-8.5 10.5-11S20 3 22 2z"/>`,
  star:     `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  user:     `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  building: `<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="8" y="7" width="2" height="2"/><rect x="14" y="7" width="2" height="2"/><rect x="8" y="12" width="2" height="2"/><rect x="14" y="12" width="2" height="2"/>`,
  key:      `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>`,
  layers:   `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
}

const reviews = [
  { rating: 5, name: 'Pierre M.', location: 'Capinghem', date: 'Jan. 2026', text: 'Excellente relation avec les membres de l\'équipe.' },
  { rating: 5, name: 'Fabien C.', location: 'Capinghem', date: 'Sept. 2025', text: 'Très bonne écoute et exécution parfaite. Je recommande vivement.' },
  { rating: 4.7, name: 'Dominique G.', location: 'Lille', date: 'Avr. 2025', text: 'Très professionnel et efficace. Très réactif en cas de difficultés.' },
]
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
      <a href="/" class="header-logo">
        <img src="/images/logo.png" alt="Conciergerie Desruelle" />
      </a>
      <nav class="header-nav">
        <a href="/prestations" class="nav-item">Prestations</a>
        <a href="/avis"        class="nav-item">Avis</a>
        <a href="/apropos"     class="nav-item">À propos</a>
        <a href="/contact"     class="nav-item">Contact</a>
        <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta">Dashboard</RouterLink>
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
        <a href="/prestations" @click="menuOpen=false">Prestations</a>
        <a href="/avis"        @click="menuOpen=false">Avis clients</a>
        <a href="/apropos"     @click="menuOpen=false">À propos</a>
        <a href="/contact"     @click="menuOpen=false">Contact</a>
        <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta-mobile" @click="menuOpen=false">Dashboard</RouterLink>
        <RouterLink v-else to="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>
      </div>
    </transition>

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-inner">
        <div class="hero-badge">
          <span class="stars">★★★★★</span>
          <span>{{ total }} avis · Plus que pro</span>
        </div>
        <h1>Votre conciergerie<br><em>de confiance</em> à Lille</h1>
        <p>Disponibles 7j/7 et 24h/24 pour simplifier votre quotidien, gérer votre bien, rénover et entretenir vos espaces.</p>
        <div class="hero-actions">
          <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-hero-primary">Mon espace</RouterLink>
          <RouterLink v-else to="/connexion" class="btn-hero-primary">Connexion</RouterLink>
          <a href="#services"  class="btn-hero-secondary">Voir nos services</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>Depuis 2020</strong><span>Entreprise familiale</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><strong>7j/7 · 24h/24</strong><span>Disponibilité totale</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><strong>Métropole Lilloise</strong><span>Zone d'intervention</span></div>
        </div>
      </div>
      <div class="hero-img-wrap">
        <img src="/images/conciergerie-service.jpg" alt="Services conciergerie Desruelle" />
      </div>
    </section>

    <!-- ── SERVICES ── -->
    <section id="services" class="section">
      <div class="section-header">
        <p class="section-eyebrow">Ce que nous faisons</p>
        <h2>Une offre complète pour <em>simplifier votre vie</em></h2>
      </div>
      <div class="services-grid">
        <div
          v-for="(s, i) in services"
          :key="i"
          class="service-card"
          :class="{ active: activeService === i }"
          @mouseenter="activeService = i"
          @mouseleave="activeService = null"
        >
          <div class="service-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="icons[s.iconId]"></svg>
          </div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
      <div class="section-cta">
        <a href="/connexion" class="btn-primary">Connexion</a>
      </div>
    </section>

    <!-- ── POUR QUI ── -->
    <section class="section section-tinted">
      <div class="section-header">
        <p class="section-eyebrow">Pour qui ?</p>
        <h2>Particuliers, pros, propriétaires :<br><em>nous nous adaptons à vous</em></h2>
      </div>
      <div class="audience-grid">
        <div v-for="a in audiences" :key="a.label" class="audience-card">
          <div class="audience-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="icons[a.iconId]"></svg>
          </div>
          <h3>{{ a.label }}</h3>
          <p>{{ a.text }}</p>
        </div>
      </div>
      <blockquote class="big-quote">
        « Nous optimisons vos revenus locatifs en toute simplicité. »
      </blockquote>
    </section>

    <!-- ── ABOUT ── -->
    <section id="about" class="section section-about">
      <div class="about-img">
        <img src="/images/conciergerie-famille.jpg" alt="Famille Desruelle" />
        <div class="about-img-badge">
          <strong>Depuis 2020</strong>
          <span>Entreprise familiale</span>
        </div>
      </div>
      <div class="about-content">
        <p class="section-eyebrow">Notre histoire</p>
        <h2 class="about-title">Une <em>famille</em> au service de vos besoins</h2>
        <p>Franck et Antoine Desruelle ont fondé leur entreprise avec une conviction : <strong>le service doit être humain, réactif et fiable</strong>. Depuis 2020, ils accompagnent particuliers, entreprises, syndics et collectivités de la métropole lilloise.</p>
        <div class="about-zone">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span><strong>Lille (59160)</strong> — Loos, Ronchin, La Madeleine et toute la métropole lilloise</span>
        </div>
        <a href="/contact" class="btn-primary">Nous contacter</a>
      </div>
    </section>

    <!-- ── AVIS ── -->
    <section id="avis" class="section section-tinted">
      <div class="section-header">
        <p class="section-eyebrow">Ce que disent nos clients</p>
        <h2>Des avis <em>contrôlés et vérifiés</em></h2>
        <div class="rating-global">
          <span class="stars big-stars">★★★★★</span>
          <strong>{{ avg }} / 5</strong>
          <span>sur {{ total }} avis · certifiés blockchain Plus que pro</span>
        </div>
      </div>
      <div class="reviews-grid">
        <div v-for="r in reviews" :key="r.name" class="review-card">
          <div class="review-top">
            <span class="stars">{{ '★'.repeat(Math.floor(r.rating)) }}</span>
            <span class="review-score">{{ r.rating }}</span>
            <span class="badge-ok">Contrôlé</span>
          </div>
          <p class="review-text">"{{ r.text }}"</p>
          <div class="review-meta">
            <strong>{{ r.name }}</strong>
            <span>{{ r.location }} · {{ r.date }}</span>
          </div>
        </div>
      </div>
      <div class="section-cta">
        <a href="/avis" class="btn-secondary">Voir tous les avis</a>
      </div>
    </section>

    <!-- ── CTA BANDE ── -->
    <section class="cta-band">
      <div class="cta-band-inner">
        <div>
          <h2>Prêt à nous confier votre projet ?</h2>
          <p>Devis gratuit, réponse rapide, intervention dans toute la métropole lilloise.</p>
        </div>
        <a href="/connexion" class="btn-hero-primary">Connexion</a>
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
          <a href="/avis">Avis clients</a>
          <a href="/contact">Contact</a>
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
  transition: background .15s, color .15s;
  position: relative;
}
.nav-item:hover { background: #faf0f3; color: #6D1F3E; }

.dropdown-menu {
  position: absolute; top: calc(100% + 8px); left: 0;
  background: #fff; border: 1px solid #eddde4; border-radius: 8px;
  padding: 6px 0; min-width: 160px; list-style: none;
  box-shadow: 0 8px 24px rgba(109,31,62,.12); z-index: 300;
}
.dropdown-menu li a {
  display: block; padding: 9px 16px;
  font-size: 13.5px; color: #555;
  transition: background .15s;
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
.burger span { display: block; width: 22px; height: 2px; background: #6D1F3E; border-radius: 2px; transition: .3s; }

/* ─────────── MOBILE MENU ─────────── */
.mobile-menu {
  display: flex; flex-direction: column;
  background: #fff; border-bottom: 1px solid #eddde4;
  padding: 8px 5% 16px;
}
.mobile-menu a { padding: 11px 0; border-bottom: 1px solid #f5eef1; font-size: 15px; color: #555; }
.btn-cta-mobile {
  margin-top: 12px; background: #6D1F3E; color: #fff !important;
  text-align: center; padding: 13px; border-radius: 6px; font-weight: 600;
}
.slide-enter-active, .slide-leave-active { transition: max-height .3s ease, opacity .3s; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 600px; opacity: 1; }

/* ─────────── HERO ─────────── */
.hero {
  display: grid; grid-template-columns: 1fr 1fr;
  min-height: 580px; position: relative; overflow: hidden;
  background: #fff;
}
.hero-bg {
  position: absolute; inset: 0 50% 0 0;
  background: linear-gradient(135deg, #6D1F3E 0%, #8b2e52 100%);
  z-index: 0;
}
.hero-inner {
  position: relative; z-index: 1;
  padding: 64px 5% 64px 5%;
  display: flex; flex-direction: column; justify-content: center; gap: 20px;
  color: #fff;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
  padding: 5px 14px; border-radius: 20px; font-size: 12.5px;
  width: fit-content;
}
.hero h1 {
  font-size: clamp(30px, 4vw, 48px); font-weight: 700; line-height: 1.15;
  color: #fff;
}
.hero h1 em { color: #f5c0cf; }
.hero > .hero-inner > p { font-size: 16px; opacity: .85; max-width: 420px; margin: 0 auto; text-align: center;}

.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;}
.btn-hero-primary {
  padding: 13px 28px; background: #fff; color: #6D1F3E;
  border-radius: 7px; font-weight: 700; font-size: 14px;
  transition: transform .15s, box-shadow .15s;
}
.btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }
.btn-hero-secondary {
  padding: 13px 28px; border: 2px solid rgba(255,255,255,.5); color: #fff;
  border-radius: 7px; font-weight: 600; font-size: 14px;
  transition: background .2s;
}
.btn-hero-secondary:hover { background: rgba(255,255,255,.1); }

.hero-stats {
  display: flex; align-items: center; gap: 20px;
  margin-top: 8px; padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,.2);
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat strong { font-size: 14px; font-weight: 700; }
.stat span { font-size: 11.5px; opacity: .7; }
.stat-sep { width: 1px; height: 32px; background: rgba(255,255,255,.25); }

.hero-img-wrap { position: relative; z-index: 1; overflow: hidden; }
.hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ─────────── SECTIONS ─────────── */
.section { padding: 72px 5%; }
.section-tinted { background: #fdf8f9; }

.section-header { text-align: center; margin-bottom: 48px; }
.section-eyebrow {
  font-size: 12px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: #6D1F3E; margin-bottom: 10px;
}
.section-header h2 { font-size: clamp(24px, 3vw, 34px); font-weight: 700; line-height: 1.2; color: #2d1020; }
.section-cta { text-align: center; margin-top: 40px; }

/* ─────────── SERVICES ─────────── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.service-card {
  background: #fff; border: 1.5px solid #eddde4; border-radius: 12px;
  padding: 28px 24px; cursor: default;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.service-card:hover, .service-card.active {
  border-color: #6D1F3E;
  box-shadow: 0 8px 28px rgba(109,31,62,.12);
  transform: translateY(-3px);
}
.service-icon {
  width: 52px; height: 52px;
  background: #fdf0f4; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
  flex-shrink: 0;
}
.service-card { text-align: center; }
.audience-icon {
  width: 60px; height: 60px;
  background: #fdf0f4; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.service-card h3 { font-size: 15px; font-weight: 700; color: #2d1020; margin-bottom: 8px; }
.service-card p { font-size: 13.5px; color: #777; line-height: 1.65; }

/* ─────────── AUDIENCE ─────────── */
.audience-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.audience-card {
  background: #fff; border: 1px solid #eddde4; border-radius: 12px;
  padding: 28px 20px; text-align: center;
  transition: box-shadow .2s;
}
.audience-card:hover { box-shadow: 0 4px 16px rgba(109,31,62,.1); }
.audience-card h3 { font-size: 14px; font-weight: 700; color: #6D1F3E; margin-bottom: 8px; }
.audience-card p { font-size: 13px; color: #777; line-height: 1.6; }

.big-quote {
  margin-top: 48px; text-align: center;
  font-size: clamp(18px, 2.5vw, 26px); font-style: italic;
  color: #6D1F3E; font-weight: 500; line-height: 1.4;
  padding: 0 10%;
}

/* ─────────── ABOUT ─────────── */
.section-about {
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
}
.about-img { position: relative; }
.about-img img { width: 100%; height: 420px; object-fit: cover; border-radius: 14px; display: block; }
.about-img-badge {
  position: absolute; bottom: -20px; right: -20px;
  background: #6D1F3E; color: #fff;
  padding: 18px 24px; border-radius: 10px;
  display: flex; flex-direction: column; gap: 2px;
  box-shadow: 0 8px 24px rgba(109,31,62,.3);
}
.about-img-badge strong { font-size: 18px; font-weight: 700; }
.about-img-badge span { font-size: 12px; opacity: .8; }

.about-content { display: flex; flex-direction: column; gap: 16px; }
.about-content h2, .about-title { font-size: clamp(24px, 3vw, 34px); font-weight: 700; line-height: 1.2; color: #6D1F3E; }
.about-content p { font-size: 15px; color: #555; line-height: 1.8; }

.about-zone {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fdf8f9; border: 1px solid #eddde4; border-radius: 8px;
  padding: 14px 16px; font-size: 14px; color: #555;
}
.about-zone svg { flex-shrink: 0; margin-top: 2px; }

/* ─────────── REVIEWS ─────────── */
.rating-global {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-top: 16px; font-size: 14px; color: #777;
}
.big-stars { font-size: 22px; }
.rating-global strong { font-size: 20px; color: #2d1020; font-weight: 700; }

.reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.review-card {
  background: #fff; border: 1px solid #eddde4; border-radius: 12px;
  padding: 24px 20px; display: flex; flex-direction: column; gap: 14px;
}
.review-top { display: flex; align-items: center; gap: 8px; }
.review-score { font-weight: 700; font-size: 14px; color: #2d1020; }
.badge-ok {
  font-size: 11px; background: #eaf7f0; color: #1a7a4a;
  padding: 2px 10px; border-radius: 10px; font-weight: 600; margin-left: auto;
}
.review-text { font-size: 14.5px; color: #444; line-height: 1.65; font-style: italic; flex: 1; }
.review-meta { border-top: 1px solid #f0e8eb; padding-top: 12px; display: flex; flex-direction: column; gap: 2px; }
.review-meta strong { font-size: 13px; color: #2d1020; }
.review-meta span { font-size: 12px; color: #999; }

/* ─────────── CTA BAND ─────────── */
.cta-band { background: linear-gradient(135deg, #6D1F3E 0%, #8b2e52 100%); padding: 56px 5%; }
.cta-band-inner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 32px; flex-wrap: wrap; max-width: 900px; margin: 0 auto;
}
.cta-band h2 { font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: #fff; margin-bottom: 8px; }
.cta-band p { font-size: 15px; color: rgba(255,255,255,.75); }

/* ─────────── BUTTONS ─────────── */
.btn-primary {
  display: inline-block; background: #6D1F3E; color: #fff;
  padding: 13px 28px; border-radius: 7px; font-weight: 700; font-size: 14px;
  transition: background .2s, transform .15s;
}
.btn-primary:hover { background: #5a1830; transform: translateY(-1px); }

.btn-secondary {
  display: inline-block; border: 2px solid #6D1F3E; color: #6D1F3E;
  padding: 11px 26px; border-radius: 7px; font-weight: 700; font-size: 14px;
  transition: all .2s;
}
.btn-secondary:hover { background: #6D1F3E; color: #fff; }

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

.footer-links { display: flex; flex-direction: column; gap: 0; }
.footer-links h4 {
  font-size: 11px; font-weight: 700; color: #fff;
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;
}
.footer-links a { font-size: 13px; color: #a08090; padding: 4px 0; transition: color .2s; }
.footer-links a:hover { color: #fff; }

.footer-bottom {
  text-align: center; padding: 20px 0;
  font-size: 12px; color: #604050;
}

/* ─────────── RESPONSIVE ─────────── */
@media (max-width: 1024px) {
  .services-grid { grid-template-columns: repeat(2, 1fr); }
  .audience-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-inner { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .header-nav { display: none; }
  .burger { display: flex; }

  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero-bg { inset: 0 0 auto 0; height: 100%; }
  .hero-inner { padding: 48px 5%; }
  .hero-img-wrap { height: 240px; }

  .services-grid { grid-template-columns: 1fr; }
  .audience-grid { grid-template-columns: 1fr 1fr; }
  .reviews-grid { grid-template-columns: 1fr; }

  .section-about { grid-template-columns: 1fr; }
  .about-img-badge { right: 0; }

  .cta-band-inner { flex-direction: column; text-align: center; }

  .footer-inner { grid-template-columns: 1fr; gap: 28px; }
  .big-quote { padding: 0; }
  .hero-stats { flex-wrap: wrap; gap: 14px; }
}
</style>