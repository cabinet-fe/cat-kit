<template>
  <div class="run-code">
    <div>{{ title }}</div>
    <pre class="editor" contenteditable @input="handleEdit">{{ internal }}</pre>

    <div><template v-if="result">结果: </template>{{ result }}</div>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, shallowRef, type PropType } from 'vue'

const props = defineProps({
  title: {
    type: String
  },

  code: {
    type: String
  },

  ctx: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  }
})

const internal = shallowRef((props.code ?? '').trim())

const handleEdit = (e: Event) => {
  const input = e.target as HTMLInputElement
  internal.value = input.innerText
}

const result = shallowRef<any>()

watchEffect(() => {
  const { ctx } = props

  try {
    const params = Object.keys(ctx)
    const f = new Function(...params, internal.value)
    result.value = f(...params.map(key => ctx[key]))
  } catch (error) {
    console.warn('代码不合法')
  }
})
</script>
<script lang="ts">
export default {
  name: 'VRunCode'
}
</script>

<style scoped>
.run-code {
}

.editor {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 4px;
  width: 100%;
  outline: none;
}
</style>
