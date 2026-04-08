<script setup>
import { ref } from 'vue'
import { useStats } from '../composables/useStats.js'

const showDropdown = ref(false)
const menuOpen     = ref(false)
const { total, avg } = useStats()

const audiences = [
  {
    iconPath: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    label: 'Particulier',
    text: 'Vous êtes en quête d\'un service complet qui facilite votre quotidien en prenant soin de votre logement ?',
  },
  {
    iconPath: '<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="8" y="7" width="2" height="2"/><rect x="14" y="7" width="2" height="2"/>',
    label: 'Gérant d\'entreprise',
    text: 'Vous souhaitez améliorer l\'entretien de vos locaux professionnels afin que vos salariés travaillent dans un cadre optimal ?',
  },
  {
    iconPath: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    label: 'Propriétaire',
    text: 'Vous voulez mettre votre bien en location et avez besoin d\'un professionnel de confiance pour sa remise en état ?',
  },
  {
    iconPath: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    label: 'Syndic de copropriété',
    text: 'Vous cherchez une équipe de professionnels à taille humaine, qui se chargera du nettoyage des parties communes de votre immeuble ?',
  },
]

const stats = [
  { value: '2020', label: 'Année de création' },
  { value: '7j/7', label: 'Disponibilité' },
  { value: '24h/24', label: 'Réactivité' },
  { value: 'Lille', label: 'Basés dans le Nord' },
]
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
        <span>{{ avg }}/5 · {{ total }} avis</span>
      </div>
    </div>

    <!-- HEADER -->
    <header class="header">
      <a href="/" class="header-logo">
        <img src="/images/logo.png" alt="Conciergerie Desruelle" />
      </a>
      <nav class="header-nav">
        <div class="nav-item dropdown" @mouseenter="showDropdown=true" @mouseleave="showDropdown=false">
          Prestations
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          <ul v-if="showDropdown" class="dropdown-menu">
            <li><a href="#">Maintenance</a></li>
            <li><a href="#">Rénovation</a></li>
            <li><a href="#">Entretien</a></li>
            <li><a href="#">Espaces verts</a></li>
          </ul>
        </div>
        <a href="/avis"     class="nav-item">Avis</a>
        <a href="/apropos"  class="nav-item active">À propos</a>
        <a href="/contact"  class="nav-item">Contact</a>
        <a href="/connexion" class="btn-cta">Connexion</a>
      </nav>
      <button class="burger" @click="menuOpen=!menuOpen"><span></span><span></span><span></span></button>
    </header>

    <transition name="slide">
      <div v-if="menuOpen" class="mobile-menu">
        <a href="#" @click="menuOpen=false">Maintenance</a>
        <a href="#" @click="menuOpen=false">Rénovation</a>
        <a href="#" @click="menuOpen=false">Entretien</a>
        <a href="#" @click="menuOpen=false">Espaces verts</a>
        <a href="/avis"    @click="menuOpen=false">Avis clients</a>
        <a href="/apropos" @click="menuOpen=false">À propos</a>
        <a href="/contact" @click="menuOpen=false">Contact</a>
        <a href="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</a>
      </div>
    </transition>

    <!-- PAGE HERO -->
    <section class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-inner">
        <p class="page-eyebrow">Qui sommes-nous ?</p>
        <h1>À propos de nous</h1>
        <p class="page-hero-sub">Une entreprise familiale lilloise fondée avec une seule conviction : le service doit être humain, réactif et fiable.</p>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats-bar">
      <div v-for="s in stats" :key="s.label" class="stat-item">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </section>

    <!-- POUR QUI -->
    <section class="section">
      <div class="section-header">
        <p class="section-eyebrow">Pour qui ?</p>
        <h2>Des services variés, adressés aux <em>particuliers et professionnels</em></h2>
      </div>

      <div class="audience-grid">
        <div v-for="a in audiences" :key="a.label" class="audience-card">
          <div class="audience-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="a.iconPath"></svg>
          </div>
          <h3>{{ a.label }}</h3>
          <p>{{ a.text }}</p>
        </div>
      </div>

      <div class="text-block">
        <p>Bien plus qu'une simple conciergerie à Lille, Conciergerie Desruelle est <strong>le partenaire de votre sérénité</strong>. Grâce à un éventail de services proposés à des tarifs abordables, nous réalisons une partie de votre gestion locative (y compris dans le cadre d'une location Airbnb), votre ménage tout au long de l'année ou encore de petites réparations et travaux chez vous.</p>
        <p>Vous avez un bien à louer mais vous manquez de temps pour vous en charger ? La Conciergerie Desruelle <strong>prend soin de votre patrimoine immobilier</strong>. Nous assurons le ménage indispensable avant la mise en location de votre logement. Nous publions ensuite une annonce, que ce soit pour une location de courte durée ou contrat de bail classique. Nous vous accompagnons également pour l'état des lieux d'entrée et même pour percevoir les loyers, notamment en cas d'impayés.</p>
      </div>

      <blockquote class="big-quote">
        « Grâce à notre service de conciergerie, vous optimisez vos revenus locatifs en toute simplicité. »
      </blockquote>
    </section>

    <!-- HISTOIRE -->
    <section class="section section-tinted">
      <div class="two-col">
        <div class="col-content">
          <p class="section-eyebrow">Notre histoire</p>
          <h2>Une <em>famille</em> au service de vos besoins</h2>
          <p>Franck et Antoine Desruelle ont toujours eu en eux le sens du service mais c'est entre deux vagues de la pandémie de Covid-19 qu'ils ont finalement décidé de lancer leur <strong>entreprise à taille humaine</strong>. Depuis 2020, ils s'adressent à une clientèle variée qui se compose de <strong>particuliers</strong>, d'<strong>entreprises</strong>, de <strong>syndics</strong> ou encore de <strong>collectivités</strong>.</p>
        </div>
        <div class="col-image">
          <img src="/images/conciergerie-famille.jpg" alt="Famille Desruelle" />
        </div>
      </div>
    </section>

    <!-- ZONE -->
    <section class="section">
      <div class="two-col reverse">
        <div class="col-image">
          <img src="/images/conciergerie-lille.jpg" alt="Lille" />
        </div>
        <div class="col-content">
          <p class="section-eyebrow">Zone d'intervention</p>
          <h2>Notre zone de chalandise autour de <em>la ville de Lille</em></h2>
          <p>Notre conciergerie est située à <strong>Lille (59160)</strong>, dans le Nord. Toutefois, nos clients peuvent nous solliciter depuis l'intégralité de la <strong>métropole lilloise</strong> ainsi que de nombreuses <strong>communes alentours</strong> : Loos, Ronchin, La Madeleine et plus encore.</p>
          <p class="mt-12">Faites-nous confiance pour le nettoyage courant de votre logement, des petits travaux de rénovation dans votre maison, l'accompagnement de voyageurs pendant leur séjour à Lille et bien d'autres prestations.</p>

          <div class="zone-tags">
            <span v-for="ville in ['Lille','Loos','Ronchin','La Madeleine','Métropole lilloise']" :key="ville" class="zone-tag">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ ville }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section section-tinted">
      <div class="cta-inline">
        <div>
          <h2>Vous hésitez encore ?</h2>
          <p>Lisez les avis authentiques des clients qui ont déjà fait appel à notre conciergerie.</p>
        </div>
        <div class="cta-inline-actions">
          <a href="/avis" class="btn-primary">Voir les avis clients</a>
          <a href="/contact" class="btn-secondary">Nous contacter</a>
        </div>
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
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.site { font-family: 'Segoe UI', system-ui, sans-serif; color: #2d1020; line-height: 1.65; overflow-x: hidden; }
a { text-decoration: none; }
em { font-style: normal; color: #6D1F3E; }

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
.page-hero-sub { font-size: 15px; opacity: .8; line-height: 1.7; }

/* STATS BAR */
.stats-bar { display: flex; justify-content: center; gap: 0; background: #fff; border-bottom: 1px solid #eddde4; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 24px 48px; border-right: 1px solid #eddde4; }
.stat-item:last-child { border-right: none; }
.stat-item strong { font-size: 22px; font-weight: 700; color: #6D1F3E; }
.stat-item span { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; }

/* SECTIONS */
.section { padding: 64px 5%; }
.section-tinted { background: #fdf8f9; }
.section-header { margin-bottom: 40px; }
.section-header h2 { font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: #2d1020; line-height: 1.25; margin-top: 8px; }

/* AUDIENCE GRID */
.audience-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
.audience-card { background: #fff; border: 1px solid #eddde4; border-radius: 12px; padding: 24px 20px; transition: box-shadow .2s, transform .2s; }
.audience-card:hover { box-shadow: 0 6px 20px rgba(109,31,62,.1); transform: translateY(-2px); }
.audience-icon { width: 44px; height: 44px; background: #fdf0f4; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.audience-card h3 { font-size: 14px; font-weight: 700; color: #6D1F3E; margin-bottom: 8px; }
.audience-card p { font-size: 13px; color: #777; line-height: 1.65; }

/* TEXT BLOCK */
.text-block { display: flex; flex-direction: column; gap: 16px; max-width: 800px; margin: 0 auto; text-align: center; }
.text-block p { font-size: 15px; color: #555; line-height: 1.85; }

/* QUOTE */
.big-quote { margin: 36px auto 0; padding: 20px 28px; background: #fdf0f4; border-left: 4px solid #6D1F3E; border-radius: 0 10px 10px 0; font-size: 17px; font-style: italic; color: #6D1F3E; font-weight: 500; line-height: 1.5; max-width: 700px; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.two-col.reverse { direction: rtl; }
.two-col.reverse > * { direction: ltr; }
.col-content { display: flex; flex-direction: column; gap: 16px; }
.col-content h2 { font-size: clamp(22px, 3vw, 30px); font-weight: 700; color: #2d1020; line-height: 1.25; }
.col-content p { font-size: 15px; color: #555; line-height: 1.85; }
.mt-12 { margin-top: 12px; }
.col-image img { width: 100%; height: 340px; object-fit: cover; border-radius: 14px; display: block; background: #eddde4; }

/* ZONE TAGS */
.zone-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.zone-tag { display: inline-flex; align-items: center; gap: 5px; background: #fdf0f4; color: #6D1F3E; font-size: 12.5px; font-weight: 600; padding: 5px 12px; border-radius: 20px; border: 1px solid #eddde4; }

/* CTA INLINE */
.cta-inline { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; text-align: center; max-width: 600px; margin: 0 auto; }
.cta-inline h2 { font-size: clamp(20px, 2.5vw, 28px); font-weight: 700; color: #2d1020; margin-bottom: 8px; }
.cta-inline p { font-size: 15px; color: #666; }
.cta-inline-actions { display: flex; gap: 12px; flex-shrink: 0; justify-content: center; }
.btn-primary { display: inline-block; background: #6D1F3E; color: #fff; padding: 12px 24px; border-radius: 7px; font-weight: 700; font-size: 14px; transition: background .2s, transform .15s; }
.btn-primary:hover { background: #5a1830; transform: translateY(-1px); }
.btn-secondary { display: inline-block; border: 2px solid #6D1F3E; color: #6D1F3E; padding: 10px 22px; border-radius: 7px; font-weight: 700; font-size: 14px; transition: all .2s; }
.btn-secondary:hover { background: #6D1F3E; color: #fff; }

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

/* RESPONSIVE */
@media (max-width: 1024px) {
  .audience-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-bar { flex-wrap: wrap; }
  .stat-item { flex: 1 1 40%; border-right: none; border-bottom: 1px solid #eddde4; }
}
@media (max-width: 768px) {
  .header-nav { display: none; }
  .burger { display: flex; }
  .audience-grid { grid-template-columns: 1fr; }
  .two-col, .two-col.reverse { grid-template-columns: 1fr; direction: ltr; gap: 32px; }
  .two-col.reverse > * { direction: ltr; }
  .cta-inline { flex-direction: column; }
  .cta-inline-actions { flex-direction: column; width: 100%; }
  .btn-primary, .btn-secondary { text-align: center; }
  .footer-inner { grid-template-columns: 1fr; gap: 28px; }
  .stat-item { flex: 1 1 45%; padding: 16px 24px; }
}
</style>