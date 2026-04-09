<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <img src="/images/logo.png" alt="Desruelle" />
      </div>
      <h1>Créer un compte</h1>
      <p class="auth-sub">Rejoignez la conciergerie Desruelle</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="row-2">
          <div class="field">
            <label>Prénom *</label>
            <input v-model="form.prenom" type="text" required placeholder="Jean" />
          </div>
          <div class="field">
            <label>Nom *</label>
            <input v-model="form.nom" type="text" required placeholder="Dupont" />
          </div>
        </div>
        <div class="field">
          <label>Email *</label>
          <input v-model="form.email" type="email" required placeholder="jean@email.fr" />
        </div>
        <div class="field">
          <label>Mot de passe *</label>
          <input v-model="form.password" type="password" required placeholder="8 caractères minimum" minlength="8" />
        </div>
        <div class="field">
          <label>Téléphone</label>
          <input v-model="form.telephone" type="tel" placeholder="06 00 00 00 00" />
        </div>
        <div class="field">
          <label>Adresse</label>
          <input v-model="form.adresse" type="text" placeholder="12 rue de la Paix, Lille" />
        </div>

        <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="auth-link">
        Déjà un compte ?
        <RouterLink to="/connexion">Se connecter</RouterLink>
      </p>
      <p class="auth-link">
        <RouterLink to="/">← Retour au site</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'

const { register, dashboardRoute } = useAuth()
const router = useRouter()

const form = ref({ prenom: '', nom: '', email: '', password: '', telephone: '', adresse: '' })
const loading  = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  loading.value = true
  errorMsg.value = ''
  try {
    await register(form.value)
    router.push(dashboardRoute())
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdf8f9;
  padding: 2rem;
}
.auth-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,.08);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 480px;
  text-align: center;
}
.auth-logo img { height: 52px; margin-bottom: 1.5rem; }
h1 { font-size: 1.6rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.auth-sub { color: #6b6375; font-size: .95rem; margin-bottom: 2rem; }
.auth-form { text-align: left; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { margin-bottom: 1.2rem; }
.field label { display: block; font-size: .85rem; font-weight: 600; color: #2d1020; margin-bottom: .4rem; }
.field input {
  width: 100%; padding: .7rem 1rem;
  border: 1.5px solid #e5e4e7; border-radius: 8px;
  font-size: .95rem; outline: none; box-sizing: border-box;
  transition: border-color .2s;
}
.field input:focus { border-color: #6D1F3E; }
.form-error { color: #e53e3e; font-size: .88rem; margin-bottom: 1rem; }
.btn-primary {
  width: 100%; padding: .85rem; border: none;
  background: #6D1F3E; color: #fff;
  font-size: 1rem; font-weight: 600; border-radius: 8px;
  cursor: pointer; transition: background .2s;
}
.btn-primary:hover:not(:disabled) { background: #5a1830; }
.btn-primary:disabled { opacity: .6; cursor: default; }
.auth-link { margin-top: 1.2rem; font-size: .9rem; color: #6b6375; }
.auth-link a { color: #6D1F3E; text-decoration: none; font-weight: 600; }
.auth-link a:hover { text-decoration: underline; }
</style>
