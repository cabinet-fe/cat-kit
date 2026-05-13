<template>
  <div class="demo-box">
    <div class="demo-controls">
      <label>
        长度
        <input v-model.number="size" min="0" max="64" type="number" />
      </label>

      <button type="button" @click="refresh">生成</button>
    </div>

    <code class="demo-result">{{ id }}</code>
  </div>
</template>

<script lang="ts" setup>
import { nanoid } from '@cat-kit/crypto'
import { ref } from 'vue'

const size = ref(21)
const id = ref(nanoid(size.value))

function refresh() {
  id.value = nanoid(size.value)
}
</script>

<style scoped>
.demo-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

input {
  width: 120px;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

button {
  padding: 8px 14px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  cursor: pointer;
}

.demo-result {
  display: block;
  min-height: 38px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow-wrap: anywhere;
  background: var(--vp-c-bg-soft);
}
</style>
