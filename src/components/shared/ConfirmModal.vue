<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="emit('update:modelValue', false)">
      <div class="modal">
        <h3>{{ title }}</h3>
        <p v-if="message">{{ message }}</p>
        <slot />
        <div class="actions">
          <button class="btn-cancel" @click="emit('update:modelValue', false)">Annuler</button>
          <button class="btn-confirm" :class="danger ? 'danger' : ''" @click="confirm">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue:   { type: Boolean, default: false },
  title:        { type: String, default: 'Confirmation' },
  message:      { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirmer' },
  danger:       { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'confirm'])
function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.modal {
  background: #fff; border-radius: 14px;
  padding: 2rem; width: 100%; max-width: 420px;
  box-shadow: 0 8px 40px rgba(0,0,0,.18);
}
h3 { margin: 0 0 .8rem; font-size: 1.15rem; color: #2d1020; }
p { color: #6b6375; margin-bottom: 1.2rem; font-size: .95rem; }
.actions { display: flex; justify-content: flex-end; gap: .8rem; margin-top: 1.5rem; }
.btn-cancel {
  padding: .6rem 1.2rem; border: 1.5px solid #e5e4e7;
  background: #fff; border-radius: 8px; cursor: pointer; font-size: .9rem;
}
.btn-cancel:hover { background: #fdf8f9; }
.btn-confirm {
  padding: .6rem 1.4rem; border: none;
  background: #6D1F3E; color: #fff;
  border-radius: 8px; cursor: pointer; font-size: .9rem; font-weight: 600;
}
.btn-confirm.danger { background: #c62828; }
.btn-confirm:hover { opacity: .9; }
</style>
