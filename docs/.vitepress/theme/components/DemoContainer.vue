<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title?: string
}>()

const showCode = ref(false)
</script>

<template>
  <div class="demo-container">
    <div v-if="title" class="demo-title">{{ title }}</div>

    <div class="demo-preview">
      <slot name="demo"></slot>
    </div>

    <div class="demo-actions">
      <button class="toggle-code-btn" @click="showCode = !showCode" :aria-label="showCode ? '隐藏代码' : '显示代码'">
        <span v-if="!showCode">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          查看代码
        </span>
        <span v-else>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
          隐藏代码
        </span>
      </button>
    </div>

    <div v-show="showCode" class="demo-code">
      <slot name="code"></slot>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.25s;
}

.demo-container:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.demo-title {
  padding: 1rem 1.25rem;
  font-weight: 600;
  font-size: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
}

.demo-preview {
  padding: 1.5rem 1.25rem;
  background-color: var(--vp-c-bg);
}

.demo-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
}

.toggle-code-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
  background: transparent;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s;
}

.toggle-code-btn:hover {
  color: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
  background-color: var(--vp-c-brand-soft);
}

.toggle-code-btn svg {
  display: block;
}

.demo-code {
  border-top: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-alt);
}

.demo-code :deep(div[class*="language-"]) {
  margin: 0;
  border-radius: 0;
}

.demo-code :deep(.vp-code-group) {
  margin: 0;
}
</style>
