<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <img src="/images/logo.png" alt="Desruelle" />
      </div>
      <h1>Connexion</h1>
      <p class="auth-sub">Accédez à votre espace personnel</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" required autocomplete="email" placeholder="votre@email.fr" />
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
        </div>

        <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-link">
        Pas encore de compte ?
        <RouterLink to="/inscription">Créer un compte</RouterLink>
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

const { login, dashboardRoute } = useAuth()
const router = useRouter()

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
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
  max-width: 420px;
  text-align: center;
}
.auth-logo img { height: 52px; margin-bottom: 1.5rem; }
h1 { font-size: 1.6rem; font-weight: 700; color: #2d1020; margin: 0 0 .3rem; }
.auth-sub { color: #6b6375; font-size: .95rem; margin-bottom: 2rem; }
.auth-form { text-align: left; }
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
