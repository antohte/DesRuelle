<template>
  <div class="star-rating" :class="{ readonly: !interactive }">
    <span
      v-for="i in 5"
      :key="i"
      class="star"
      :class="{ filled: i <= (hovered || modelValue), hoverable: interactive }"
      @mouseenter="interactive && (hovered = i)"
      @mouseleave="interactive && (hovered = 0)"
      @click="interactive && emit('update:modelValue', i)"
    >★</span>
    <span v-if="showLabel && modelValue" class="label">{{ modelValue }}/5</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  interactive: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const hovered = ref(0)
</script>

<style scoped>
.star-rating { display: inline-flex; align-items: center; gap: .15rem; }
.star { font-size: 1.4rem; color: #ddd; transition: color .1s; cursor: default; }
.star.filled { color: #f59e0b; }
.star.hoverable { cursor: pointer; }
.star.hoverable:hover { transform: scale(1.15); }
.label { font-size: .85rem; color: #6b6375; margin-left: .4rem; }
</style>
