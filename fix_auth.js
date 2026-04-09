import fs from 'fs';

const files = ['./src/views/Prestations.vue', './src/views/Avis.vue', './src/views/Contact.vue', './src/views/APropos.vue'];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    // Add imports
    if (!content.includes('useAuth')) {
        content = content.replace('<script setup>', '<script setup>\nimport { useAuth } from \'../composables/useAuth.js\'\nconst { isAuthenticated, dashboardRoute } = useAuth()');
    }

    // Replace links
    content = content.replace(
        '<RouterLink to="/connexion"   class="btn-cta">Connexion</RouterLink>',
        '<RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta">Mon espace</RouterLink>\n        <RouterLink v-else to="/connexion" class="btn-cta">Connexion</RouterLink>'
    ).replace(
        '<RouterLink to="/connexion" class="btn-cta">Connexion</RouterLink>',
        '<RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta">Mon espace</RouterLink>\n        <RouterLink v-else to="/connexion" class="btn-cta">Connexion</RouterLink>'
    );

    content = content.replace(
        '<RouterLink to="/connexion"   class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>',
        '<RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta-mobile" @click="menuOpen=false">Mon espace</RouterLink>\n        <RouterLink v-else to="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>'
    ).replace(
        '<RouterLink to="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>',
        '<RouterLink v-if="isAuthenticated" :to="dashboardRoute()" class="btn-cta-mobile" @click="menuOpen=false">Mon espace</RouterLink>\n        <RouterLink v-else to="/connexion" class="btn-cta-mobile" @click="menuOpen=false">Connexion</RouterLink>'
    );

    fs.writeFileSync(f, content);
});
console.log('Fixed auth injects');
