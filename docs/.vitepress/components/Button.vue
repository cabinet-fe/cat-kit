<template>
  <button class="v-button" @click="emit('click')"><slot /></button>
</template>

<script lang="ts" setup>
const emit = defineEmits(['click'])
</script>

<script lang="ts">
export default {
  name: 'VButton'
}
</script>

<style scoped>
.v-button {
  border-radius: 4px;
  padding: 2px 4px;
  background-color: var(--vp-c-brand);
  color: #fff;
}

.v-button:active {
  background-color: var(--vp-c-brand-dark);
}
</style>
