<template>
  <div class="cloud-patterns" :class="[position]" aria-hidden="true">
    <svg
      class="cloud-svg"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <!-- 移除 feTurbulence + feDisplacementMap 滤镜，保留渐变 -->
        <linearGradient id="cloud-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
          <stop offset="50%" stop-color="currentColor" stop-opacity="0.15" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 祥云 1 -->
      <g class="cloud-group c1">
        <path
          d="M150,200 Q180,160 220,180 T280,180 T340,200 T400,180 T460,200 V400 H150 Z"
          fill="url(#cloud-gradient)"
        />
      </g>

      <!-- 祥云 2 -->
      <g class="cloud-group c2">
        <path
          d="M750,250 Q780,210 820,230 T880,230 T940,250 T1000,230 T1060,250 V400 H750 Z"
          fill="url(#cloud-gradient)"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  position?: 'top' | 'bottom'
}>()
</script>

<style scoped>
.cloud-patterns {
  position: absolute;
  left: 0;
  width: 100%;
  height: 400px;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  color: var(--ink-light);
  mix-blend-mode: multiply;
}

.cloud-patterns.top {
  top: 0;
  transform: scaleY(-1);
}

.cloud-patterns.bottom {
  bottom: 0;
}

.cloud-svg {
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.cloud-group {
  transform-origin: center;
  will-change: transform;
}

/* 将无限动画改为一次性进入动画 */
.c1 {
  animation: floatCloudIn 2s ease-out forwards;
}

.c2 {
  animation: floatCloudIn 2.5s ease-out 0.3s forwards;
  opacity: 0;
}

@keyframes floatCloudIn {
  0% {
    transform: translateX(-40px) translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
}

:global(.dark) .cloud-patterns {
  color: var(--ink-trace);
  mix-blend-mode: screen;
  opacity: 0.4;
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .c1,
  .c2 {
    animation: none;
    opacity: 1;
  }
}
</style>
