<template>
  <div class="tween-demo">
    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>单条时间轴补间</h3>
          <p>切换 easing，观察位置、进度和值的同步变化。</p>
        </div>

        <label class="easing-select">
          <span>Easing</span>
          <select v-model="easingName">
            <option v-for="option in easingOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>
      </div>

      <div class="track">
        <div class="track-fill" :style="{ width: `${value}%` }" />
        <div class="track-orb" :style="{ left: `calc(${value}% - 14px)` }" />
      </div>

      <div class="metrics">
        <div class="metric">
          <span class="metric-label">state</span>
          <strong>{{ state }}</strong>
        </div>
        <div class="metric">
          <span class="metric-label">progress</span>
          <strong>{{ progress.toFixed(1) }}%</strong>
        </div>
        <div class="metric">
          <span class="metric-label">value</span>
          <strong>{{ value.toFixed(1) }}</strong>
        </div>
        <div class="metric">
          <span class="metric-label">elapsed</span>
          <strong>{{ elapsed }}ms</strong>
        </div>
      </div>

      <p class="status">{{ statusText }}</p>

      <div class="controls">
        <button type="button" @click="playTween">play</button>
        <button type="button" @click="pauseTween">pause</button>
        <button type="button" @click="resumeTween">resume</button>
        <button type="button" @click="seekHalf">seek(0.5)</button>
        <button type="button" @click="resetTween">reset</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Tween, tweenEasings } from '@cat-kit/fe'
import type { TweenFrame, TweenState } from '@cat-kit/fe'
import { onUnmounted, ref, watch } from 'vue'

type EasingName = 'linear' | 'easeOutQuad' | 'easeInOutQuad'

const easingOptions: EasingName[] = ['linear', 'easeOutQuad', 'easeInOutQuad']
const easingName = ref<EasingName>('easeOutQuad')
const state = ref<TweenState>('idle')
const progress = ref(0)
const value = ref(0)
const elapsed = ref(0)
const statusText = ref('点击 play 观察 Tween 逐帧推进')

let tween: Tween | null = null

function syncFrame(frame?: TweenFrame) {
  state.value = frame?.state ?? tween?.getState() ?? 'idle'
  progress.value = (frame?.progress ?? tween?.getProgress() ?? 0) * 100
  value.value = frame?.value ?? tween?.getValue() ?? 0
  elapsed.value = Math.round(frame?.elapsed ?? 0)
}

function createTween() {
  tween?.cancel()
  tween = new Tween({
    from: 0,
    to: 100,
    duration: 1400,
    easing: tweenEasings[easingName.value],
    onUpdate(frame) {
      syncFrame(frame)
    },
    onFinish(frame) {
      statusText.value = '已完成，当前值停在终点'
      syncFrame(frame)
    },
    onCancel(frame) {
      syncFrame(frame)
    }
  })

  syncFrame()
}

function ensureTween() {
  if (!tween) {
    createTween()
  }

  return tween!
}

function playTween() {
  createTween()
  ensureTween().play()
  statusText.value = `正在播放，easing = ${easingName.value}`
  syncFrame()
}

function pauseTween() {
  ensureTween().pause()
  statusText.value = '已暂停，可以继续 resume'
  syncFrame()
}

function resumeTween() {
  ensureTween().resume()
  statusText.value = '继续播放中'
  syncFrame()
}

function seekHalf() {
  ensureTween().seek(0.5)
  statusText.value = '已跳到 50% 位置'
  syncFrame()
}

function resetTween() {
  ensureTween().reset()
  statusText.value = '已重置到起点'
  syncFrame()
}

watch(easingName, () => {
  const currentProgress = tween?.getProgress() ?? 0
  createTween()
  tween?.seek(currentProgress)
  statusText.value = `已切换为 ${easingName.value}`
  syncFrame()
})

createTween()

onUnmounted(() => {
  tween?.cancel()
  tween = null
})
</script>

<style scoped>
.tween-demo {
  padding: 4px 0;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background:
    radial-gradient(circle at top left, rgba(255, 210, 167, 0.28), transparent 38%),
    linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(255, 255, 255, 0.98));
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.panel-head h3 {
  margin: 0;
  font-size: 16px;
}

.panel-head p {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.easing-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.easing-select select {
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--vp-c-text-1);
}

.track {
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.track-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff9f68, #ff6b4a);
}

.track-orb {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  background: linear-gradient(135deg, #ff824d, #ff5b3f);
  box-shadow: 0 8px 20px rgba(255, 107, 74, 0.25);
  transform: translateY(-50%);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.metric-label {
  font-size: 11px;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status {
  margin: 0;
  color: #c2410c;
  font-size: 13px;
  font-weight: 600;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.controls button {
  padding: 9px 14px;
  border: 0;
  border-radius: 999px;
  background: #111827;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.controls button:hover {
  background: #1f2937;
}

@media (max-width: 640px) {
  .panel-head {
    flex-direction: column;
  }

  .easing-select {
    min-width: 100%;
  }

  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
