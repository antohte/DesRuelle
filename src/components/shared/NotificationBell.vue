<template>
  <div class="notif-wrapper" ref="wrapper">
    <button class="bell-btn" @click="toggle" :aria-label="`${unread} notifications`">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="unread" class="badge">{{ unread > 9 ? '9+' : unread }}</span>
    </button>

    <div v-if="open" class="dropdown">
      <div class="dropdown-header">
        <span>Notifications</span>
        <button v-if="unread" class="mark-all" @click="markAllRead">Tout marquer lu</button>
      </div>
      <div class="dropdown-body">
        <div v-if="!notifications.length" class="empty">Aucune notification</div>
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notif-item"
          :class="{ unread: !n.lu }"
          @click="handleClick(n)"
        >
          <p class="notif-titre">{{ n.titre }}</p>
          <p class="notif-msg">{{ n.message }}</p>
          <p class="notif-time">{{ formatDate(n.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '../../composables/useNotifications.js'

const { notifications, unread, markRead, markAllRead, startPolling, stopPolling } = useNotifications()
const router = useRouter()
const open = ref(false)
const wrapper = ref(null)

function toggle() { open.value = !open.value }

async function handleClick(n) {
  if (!n.lu) await markRead(n.id)
  if (n.lien) { router.push(n.lien); open.value = false }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function onClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) open.value = false
}

onMounted(() => { startPolling(); document.addEventListener('click', onClickOutside) })
onUnmounted(() => { stopPolling(); document.removeEventListener('click', onClickOutside) })
</script>

<style scoped>
.notif-wrapper { position: relative; }
.bell-btn {
  position: relative; background: none; border: none;
  cursor: pointer; color: #6b6375; padding: .4rem;
  border-radius: 8px; display: flex; align-items: center;
}
.bell-btn:hover { background: #fdf8f9; color: #6D1F3E; }
.badge {
  position: absolute; top: 0; right: 0;
  background: #6D1F3E; color: #fff;
  font-size: .65rem; font-weight: 700;
  min-width: 16px; height: 16px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
}
.dropdown {
  position: absolute; right: 0; top: calc(100% + 8px);
  width: 340px; background: #fff;
  border: 1.5px solid #e5e4e7; border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,.12);
  z-index: 1000; overflow: hidden;
}
.dropdown-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: .9rem 1.1rem; border-bottom: 1px solid #f0eff2;
  font-weight: 600; font-size: .95rem;
}
.mark-all { background: none; border: none; color: #6D1F3E; font-size: .8rem; cursor: pointer; }
.mark-all:hover { text-decoration: underline; }
.dropdown-body { max-height: 360px; overflow-y: auto; }
.empty { padding: 2rem; text-align: center; color: #6b6375; font-size: .9rem; }
.notif-item {
  padding: .9rem 1.1rem; border-bottom: 1px solid #f0eff2;
  cursor: pointer; transition: background .15s;
}
.notif-item:hover { background: #faf9fc; }
.notif-item.unread { background: #fdf8f9; border-left: 3px solid #6D1F3E; }
.notif-titre { font-weight: 600; font-size: .9rem; color: #2d1020; margin: 0 0 .2rem; }
.notif-msg { font-size: .85rem; color: #6b6375; margin: 0 0 .3rem; }
.notif-time { font-size: .75rem; color: #999; margin: 0; }
</style>
