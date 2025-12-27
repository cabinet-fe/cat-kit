<template>
  <div class="ink-particles" aria-hidden="true">
    <!-- 使用纯 CSS 粒子替代 Canvas，GPU 加速 -->
    <div
      v-for="i in PARTICLE_COUNT"
      :key="i"
      class="particle"
      :style="getParticleStyle(i)"
    ></div>
  </div>
</template>

<script setup lang="ts">
// 配置
const PARTICLE_COUNT = 15 // 减少粒子数量

// 为每个粒子生成随机样式
function getParticleStyle(index: number) {
  // 使用 index 作为伪随机种子，确保 SSR 和客户端一致
  const seed = index * 1.618033988749895 // 黄金分割比
  const random = (offset: number) =>
    (((seed + offset) * 9301 + 49297) % 233280) / 233280

  const size = random(1) * 3 + 2
  const left = random(2) * 100
  const delay = random(3) * 20
  const duration = 15 + random(4) * 15
  const opacity = random(5) * 0.4 + 0.1

  return {
    '--size': `${size}px`,
    '--left': `${left}%`,
    '--delay': `-${delay}s`,
    '--duration': `${duration}s`,
    '--opacity': opacity
  }
}
</script>

<style scoped>
.ink-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  left: var(--left);
  top: -10px;
  border-radius: 50%;
  background-color: var(--ink-light);
  opacity: var(--opacity);
  will-change: transform; /* 提示浏览器优化 */
  animation: fall var(--duration) linear var(--delay) infinite;
}

@keyframes fall {
  0% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(25vh) translateX(10px);
  }
  50% {
    transform: translateY(50vh) translateX(-5px);
  }
  75% {
    transform: translateY(75vh) translateX(8px);
  }
  100% {
    transform: translateY(110vh) translateX(0);
  }
}

/* 暗色模式 */
:global(.dark) .particle {
  background-color: var(--ink-faint);
}

/* 尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
    opacity: calc(var(--opacity) * 0.5);
    top: calc(var(--left) * 0.8);
  }
}
</style>
