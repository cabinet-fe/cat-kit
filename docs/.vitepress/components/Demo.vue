<template>
  <ul class="menus">
    <li
      class="menu-item"
      :class="{
        'menu-item--active': visibleType === key
      }"
      v-for="(menu, key) of menus"
      :key="key"
      @click="handleClick(key)"
    >
      {{ menu }}
    </li>
  </ul>

  <!-- 显示示例 -->
  <ClientOnly v-if="visibleType === 'example'">
    <div class="demo-box">
      <component v-if="demos" :is="_demos[path]" v-bind="$attrs" />
    </div>
  </ClientOnly>

  <!-- 源代码 -->
  <div v-else-if="visibleType === 'code'">
    <pre
      class="language-vue line-numbers"
    ><code v-html="decodedCode"></code></pre>
  </div>
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

const menus = {
  example: '示例',
  code: '查看代码'
}

type VisibleType = keyof typeof menus

const visibleType = shallowRef<VisibleType>('example')

const handleClick = (type: VisibleType) => {
  visibleType.value = type
}

const decodedCode = computed(() => {
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

<style scoped>
.demo-box {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.menus {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: flex-start;

  align-items: center;
  border-radius: 8px;
  margin-bottom: -12px;
}

.menu-item {
  list-style: none;
  display: inline;
  padding: 0;
  margin: 0;
  cursor: pointer;
  padding: 6px 0;
  margin-right: 12px;
  color: var(--vp-c-text-2);
}

.menu-item--active {
  color: var(--vp-c-brand);
}

.language-vue {
  border-radius: 8px;
}
</style>
