<template>
  <ClientOnly v-if="visibleExample">
    <component v-if="demos" :is="_demos[path]" v-bind="$attrs" />
  </ClientOnly>

  <div v-else v-html="decodedCode"></div>

  <button @click="visibleExample = !visibleExample">点击</button>
</template>

<script lang="ts" setup>
import { computed, shallowRef } from 'vue'

const props = defineProps({
  demos: {
    type: Object,
    required: true
  },

  path: {
    type: String,
    required: true
  },

  source: {
    type: String
  }
})

const visibleExample = shallowRef(true)

const decodedCode = computed(() => {
  console.log(props.source)
  return decodeURIComponent(props.source || '')
})

const _demos = computed(() => {
  const { demos } = props
  if (!demos) return {}
  return Object.keys(demos).reduce((acc, cur) => {
    const key = cur.match(/examples\/(.+)\.vue$/)?.[1] || 'default'
    acc[key] = demos[cur].default
    return acc
  }, {} as any)
})
</script>

<script lang="ts">
export default {
  name: 'VDemo'
}
</script>
