<template>
  <span class="badge" :class="colorClass">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ statut: { type: String, required: true } })

const MAP = {
  en_attente:     { label: 'En attente',   color: 'orange' },
  valide:         { label: 'Validé',        color: 'blue'   },
  refuse:         { label: 'Refusé',        color: 'red'    },
  accepte_client: { label: 'Accepté',       color: 'green'  },
  refuse_client:  { label: 'Refusé',        color: 'red'    },
  annule:         { label: 'Annulé',        color: 'red'    },
  planifie:       { label: 'Planifié',      color: 'blue'   },
  en_cours:       { label: 'En cours',      color: 'purple' },
  termine:        { label: 'Terminé',       color: 'green'  },
  approuve:       { label: 'Approuvé',      color: 'green'  },
  assigne:        { label: 'Assigné',       color: 'blue'   },
  confirme:       { label: 'Confirmé',      color: 'green'  },
}

const label     = computed(() => MAP[props.statut]?.label || props.statut)
const colorClass = computed(() => MAP[props.statut]?.color || 'gray')
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: .25rem .75rem;
  border-radius: 999px;
  font-size: .8rem;
  font-weight: 600;
  white-space: nowrap;
}
.orange { background: #fff3e0; color: #e65100; }
.blue   { background: #e3f2fd; color: #1565c0; }
.green  { background: #e8f5e9; color: #2e7d32; }
.red    { background: #ffebee; color: #c62828; }
.purple { background: #fdf0f4; color: #6D1F3E; }
.gray   { background: #f5f5f5; color: #424242; }
</style>
