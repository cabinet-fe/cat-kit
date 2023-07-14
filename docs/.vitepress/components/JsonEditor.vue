<template>
  <textarea :value="fmtVal" @input="handleUpdate" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { safeRun } from '@cat-kit/fe'

defineOptions({
  name: 'JsonEditor'
})

const props = defineProps({
  modelValue: Object
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Object): void
}>()

const fmtVal = computed(() => {
  return safeRun(() => JSON.stringify(props.modelValue, null, 2))
})

const handleUpdate = (ev: Event) => {
  const json = safeRun(() => JSON.parse((ev.target as HTMLInputElement).value))
  json && emit('update:modelValue', json)
}
</script>

<style scoped>
textarea {
  width: 100%;
  height: 200px;
  border: 1px solid #ccc;
}
</style>
