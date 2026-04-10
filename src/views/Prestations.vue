<script setup>
import { useAuth } from '../composables/useAuth.js'
const { isAuthenticated, dashboardRoute } = useAuth()
import { ref } from 'vue'
import { useStats } from '../composables/Usestats.js'

const showDropdown = ref(false)
const menuOpen     = ref(false)
const activeTab    = ref('maintenance')
const { total, avg } = useStats()

const tabs = [
  { id: 'maintenance',  label: 'Maintenance',    icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
  { id: 'renovation',   label: 'Rénovation',     icon: '<path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7a1.41 1.41 0 0 0 .49-1 1.47 1.47 0 0 0-1.4-1.43 1.41 1.41 0 0 0-1 .43l-1.27 1.27 2.2 2.2z"/>' },
  { id: 'entretien',    label: 'Entretien',      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { id: 'espaces-verts',label: 'Espaces verts',  icon: '<path d="M2 22c1.25-1.25 2.5-2.5 3.75-3.75"/><path d="M22 2C11 2 2 11 2 22c4-4 8-8.5 10.5-11S20 3 22 2z"/>' },
]

const prestations = {
  maintenance: {
    title: 'Maintenance immobilière',
    subtitle: 'Entretien et réparations : vos bâtiments toujours en parfait état',
    intro: 'Plutôt que de faire appel à plusieurs prestataires différents, sollicitez Conciergerie Desruelle. Depuis près de cinq ans, nous proposons des services de maintenance courante pour les particuliers, les entreprises, les syndics et les copropriétés.',
    sections: [
      {
        title: 'Nettoyage et entretien courant',
        items: ['Balayage et lessivage des sols', 'Dépoussiérage et désinfection', 'Gestion des déchets et des encombrants', 'Nettoyage des parties communes, locaux professionnels, maisons, appartements'],
      },
      {
        title: 'Travaux d\'espaces verts',
        items: ['Taille de haie', 'Abattage d\'arbre', 'Tonte de gazon', 'Débroussaillage'],
      },
      {
        title: 'Petits travaux et réparations',
        items: ['Petits travaux d\'électricité : luminaires, prises, interrupteurs', 'Petits travaux de plomberie : chasse d\'eau, débouchage', 'Agencement : sélection, livraison et installation de meubles', 'Remplacement d\'appareils électroménagers'],
      },
    ],
    cible: ['Particuliers souhaitant entretenir leur bien', 'Entreprises pour leurs locaux professionnels', 'Syndics pour leurs immeubles d\'habitation', 'Copropriétés avec des besoins spécifiques'],
  },
  renovation: {
    title: 'Travaux de rénovation',
    subtitle: 'Des travaux pour sublimer votre patrimoine immobilier',
    intro: 'Conciergerie Desruelle place toute son énergie au service de votre tranquillité d\'esprit. Professionnels, rigoureux et respectueux des délais, nous réalisons votre rénovation clé en main, quelle que soit la pièce concernée.',
    sections: [
      {
        title: 'Rénovation intérieure complète',
        items: ['Cuisine équipée : mobilier, revêtements, électroménager', 'Salle de bains clé en main : meubles, plomberie, accessoires', 'Pose de revêtements muraux : enduit, papier peint, parement', 'Pose de revêtements de sol : carrelage, parquet, lino', 'Rénovation de plafond et peinture intérieure / extérieure'],
      },
      {
        title: 'Suivi et coordination de chantier',
        items: ['Planification des travaux avec devis détaillé', 'Coordination des artisans partenaires', 'Contrôle qualité tout au long du chantier', 'Accompagnement jusqu\'à la réception finale'],
      },
      {
        title: 'Remeubler votre logement',
        items: ['Conseil dans le choix du mobilier', 'Réception et livraison de votre commande', 'Montage et installation sur place', 'Bureaux, bibliothèques, placards et plus encore'],
      },
    ],
    cible: ['Propriétaires souhaitant valoriser leur bien', 'Futurs bailleurs avant mise en location', 'Personnes souhaitant rénover leur lieu de vie', 'Tout budget, du petit rafraîchissement au grand chantier'],
  },
  entretien: {
    title: 'Entretien & nettoyage',
    subtitle: 'Pour des surfaces propres et nettes',
    intro: 'Vous avez l\'impression de vous laisser déborder par les tâches du quotidien ? Conciergerie Desruelle propose un large éventail de prestations adaptées à vos besoins, réguliers comme ponctuels, pour les particuliers, les entreprises et les copropriétés.',
    sections: [
      {
        title: 'Particuliers',
        items: ['Ménage complet : dépoussiérage, balayage, lessivage, désinfection', 'Nettoyage des sanitaires et vitres', 'Entretien du jardin : tonte, débroussaillage, désherbage', 'Débarras et rangement'],
      },
      {
        title: 'Entreprises',
        items: ['Désinfection des points de contact', 'Nettoyage des sols : balayage, lessivage, shampouinage', 'Nettoyage des sanitaires et vitrerie', 'Intervention possible en horaires décalés'],
      },
      {
        title: 'Syndics et locations Airbnb',
        items: ['Entretien des parties communes : cage d\'escalier, hall, couloir', 'Entrée et sortie de poubelles', 'Désinfection des contenants à déchets', 'Nettoyage des vitres et espaces verts communs'],
      },
    ],
    cible: ['Particuliers débordés par les tâches ménagères', 'Entreprises souhaitant des locaux impeccables', 'Syndics de copropriété', 'Propriétaires de logements Airbnb'],
  },
  'espaces-verts': {
    title: 'Espaces verts',
    subtitle: 'Des jardins bien entretenus où il fait bon vivre',
    intro: 'Entretenir son jardin demande du temps, du matériel et un savoir-faire. Conciergerie Desruelle effectue vos travaux de jardinage pour que votre espace extérieur retrouve toute sa splendeur, en interventions ponctuelles ou en entretien régulier.',
    sections: [
      {
        title: 'Nos prestations jardin',
        items: ['Taille de haie ou d\'arbuste', 'Tonte de gazon et ramassage des feuilles', 'Abattage d\'arbre', 'Entretien de massif floral', 'Désherbage et débroussaillage', 'Entretien des allées, cours et abords de terrasse'],
      },
      {
        title: 'Notre approche',
        items: ['Étude personnalisée de vos besoins', 'Devis gratuit et sans engagement', 'Adaptation à votre budget et vos délais', 'Interventions ponctuelles ou contrat régulier'],
      },
    ],
    cible: ['Particuliers souhaitant un jardin entretenu', 'Copropriétés avec espaces verts communs', 'Entreprises avec espaces extérieurs', 'Syndics pour les abords d\'immeubles'],
  },
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
        <span>{{ avg }}/5 · {{ total }} avis</span>
      </div>
    </div>

    <!-- HEADER -->
    <header class="header">
      <RouterLink to="/" class="header-logo">
        <img src="/images/logo.png" alt="Conciergerie Desruelle" />
      </RouterLink>
      <nav class="header-nav">
        <RouterLink to="/prestations" class="nav-item active">Prestations</RouterLink>
        <RouterLink to="/avis"        class="nav-item">Avis</RouterLink>
        <RouterLink to="/apropos"     class="nav-item">À propos</RouterLink>
        <RouterLink to="/contact"     class="nav-item">Contact</RouterLink>
        <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta">Mon espace</RouterLink>
        <RouterLink v-else to="/connexion" class="btn-cta">Connexion</RouterLink>
      </nav>
      <button class="burger" @click="menuOpen=!menuOpen"><span></span><span></span><span></span></button>
    </header>

    <transition name="slide">
      <div v-if="menuOpen" class="mobile-menu">
        <RouterLink to="/prestations" @click="menuOpen=false">Prestations</RouterLink>
        <RouterLink to="/avis"        @click="menuOpen=false">Avis clients</RouterLink>
        <RouterLink to="/apropos"     @click="menuOpen=false">À propos</RouterLink>
        <RouterLink to="/contact"     @click="menuOpen=false">Contact</RouterLink>
        <RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta-mobile" @click="menuOpen=false">Mon espace</RouterLink>
        <RouterLink v-else to="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>
      </div>
    </transition>

    <!-- PAGE HERO -->
    <section class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-inner">
        <p class="page-eyebrow">Ce que nous faisons</p>
        <h1>Nos prestations</h1>
        <p class="page-hero-sub">Maintenance, rénovation, entretien, espaces verts — une offre complète pour simplifier votre quotidien.</p>
      </div>
    </section>

    <!-- TABS -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs" :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="tab.icon"></svg>
        {{ tab.label }}
      </button>
    </div>

    <!-- CONTENU PRESTATION -->
    <transition name="fade" mode="out-in">
      <section :key="activeTab" class="prestation-section">
        <div class="prestation-inner">

          <!-- Header -->
          <div class="prestation-header">
            <h2>{{ prestations[activeTab].title }}</h2>
            <p class="prestation-subtitle">{{ prestations[activeTab].subtitle }}</p>
            <p class="prestation-intro">{{ prestations[activeTab].intro }}</p>
          </div>

          <!-- Sections de services -->
          <div class="services-sections">
            <div v-for="section in prestations[activeTab].sections" :key="section.title" class="service-section-card">
              <h3>{{ section.title }}</h3>
              <ul>
                <li v-for="item in section.items" :key="item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Pour qui -->
          <div class="pour-qui">
            <h3>Pour qui ?</h3>
            <div class="pour-qui-grid">
              <div v-for="c in prestations[activeTab].cible" :key="c" class="pour-qui-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D1F3E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {{ c }}
              </div>
            </div>
          </div>



        </div>
      </section>
    </transition>

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
          <RouterLink to="/prestations">Maintenance</RouterLink>
          <RouterLink to="/prestations">Rénovation</RouterLink>
          <RouterLink to="/prestations">Entretien</RouterLink>
          <RouterLink to="/prestations">Espaces verts</RouterLink>
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
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.site { font-family: var(--sans); color: #2d1020; line-height: 1.65; overflow-x: hidden; }
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
.nav-item { display: flex; align-items: center; gap: 3px; padding: 6px 12px; border-radius: 6px; font-size: 13.5px; color: #555; transition: background .15s, color .15s; }
.nav-item:hover { background: #faf0f3; color: #6D1F3E; }
.nav-item.active { color: #6D1F3E; font-weight: 600; background: #fdf0f4; }
.btn-cta { margin-left: 8px; padding: 8px 20px; background: #6D1F3E; color: #fff !important; border-radius: 6px; font-size: 13.5px; font-weight: 600; transition: background .2s, transform .15s; }
.btn-cta:hover { background: #5a1830; transform: translateY(-1px); }
.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.burger span { display: block; width: 22px; height: 2px; background: #6D1F3E; border-radius: 2px; }

/* MOBILE */
.mobile-menu { display: flex; flex-direction: column; background: #fff; border-bottom: 1px solid #eddde4; padding: 8px 5% 16px; }
.mobile-menu a { padding: 11px 0; border-bottom: 1px solid #f5eef1; font-size: 15px; color: #555; }
.btn-cta-mobile { margin-top: 12px; background: #6D1F3E; color: #fff !important; text-align: center; padding: 13px; border-radius: 6px; font-weight: 600; }
.slide-enter-active, .slide-leave-active { transition: max-height .3s ease, opacity .3s; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 400px; opacity: 1; }

/* PAGE HERO */
.page-hero { position: relative; overflow: hidden; background: linear-gradient(135deg, #6D1F3E 0%, #8b2e52 100%); padding: 56px 5% 52px; text-align: center; color: #fff; }
.page-hero-bg { position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.page-hero-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
.page-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 10px; }
.page-hero h1 { font-size: clamp(28px, 4vw, 44px); font-weight: 700; margin-bottom: 14px; }
.page-hero-sub { font-size: 15px; opacity: .8; line-height: 1.7; }

/* TABS */
.tabs-bar { display: flex; justify-content: center; gap: 8px; padding: 24px 5%; background: #fff; border-bottom: 1px solid #eddde4; flex-wrap: wrap; }
.tab-btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px; border: 1.5px solid #eddde4; border-radius: 8px; background: #fff; font-size: 14px; font-weight: 600; color: #777; cursor: pointer; transition: all .2s; font-family: inherit; }
.tab-btn:hover { border-color: #6D1F3E; color: #6D1F3E; background: #fdf0f4; }
.tab-btn.active { background: #6D1F3E; color: #fff; border-color: #6D1F3E; }
.tab-btn.active svg { stroke: #fff; }

/* PRESTATION SECTION */
.prestation-section { padding: 56px 5%; background: #fdf8f9; min-height: 400px; }
.prestation-inner { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }

.prestation-header { max-width: 720px; margin: 0 auto; text-align: center;}
.prestation-header h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 700; color: #6D1F3E; margin-bottom: 8px; }
.prestation-subtitle { font-size: 16px; color: #555; font-style: italic; margin-bottom: 14px; }
.prestation-intro { font-size: 15px; color: #555; line-height: 1.8; }

/* SERVICES CARDS */
.services-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.service-section-card { background: #fff; border: 1px solid #eddde4; border-radius: 12px; padding: 24px; }
.service-section-card h3 { font-size: 15px; font-weight: 700; color: #2d1020; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #fdf0f4; }
.service-section-card ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.service-section-card li { display: flex; align-items: flex-start; gap: 9px; font-size: 14px; color: #555; line-height: 1.55; }
.service-section-card li svg { flex-shrink: 0; margin-top: 3px; }

/* POUR QUI */
.pour-qui { background: #fff; border: 1px solid #eddde4; border-radius: 12px; padding: 24px; }
.pour-qui h3 { font-size: 15px; font-weight: 700; color: #2d1020; margin-bottom: 16px; }
.pour-qui-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.pour-qui-item { display: flex; align-items: flex-start; gap: 9px; font-size: 14px; color: #555; line-height: 1.55; background: #fdf8f9; padding: 10px 14px; border-radius: 8px; }
.pour-qui-item svg { flex-shrink: 0; margin-top: 2px; }

/* PRESTATION CTA */
.prestation-cta { background: linear-gradient(135deg, #6D1F3E 0%, #8b2e52 100%); border-radius: 14px; padding: 32px 36px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; color: #fff; }
.prestation-cta strong { font-size: 17px; display: block; margin-bottom: 6px; }
.prestation-cta p { font-size: 14px; opacity: .8; }
.btn-primary { display: inline-block; background: #fff; color: #6D1F3E; padding: 12px 26px; border-radius: 7px; font-weight: 700; font-size: 14px; white-space: nowrap; transition: transform .15s, box-shadow .15s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }

/* FADE TRANSITION */
.fade-enter-active, .fade-leave-active { transition: opacity .2s, transform .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(6px); }

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
@media (max-width: 768px) {
  .header-nav { display: none; }
  .burger { display: flex; }
  .tabs-bar { gap: 6px; padding: 16px 5%; }
  .tab-btn { padding: 8px 14px; font-size: 13px; }
  .prestation-cta { flex-direction: column; text-align: center; }
  .footer-inner { grid-template-columns: 1fr; gap: 28px; }
}
</style>