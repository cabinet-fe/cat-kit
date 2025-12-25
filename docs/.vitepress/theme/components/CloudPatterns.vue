<template>
  <div class="cloud-patterns" :class="[position]" aria-hidden="true">
    <svg class="cloud-svg" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="cloud-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" />
          <feDisplacementMap in="SourceGraphic" scale="10" />
        </filter>
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
          filter="url(#cloud-texture)"
        />
      </g>

      <!-- 祥云 2 -->
      <g class="cloud-group c2">
         <path
          d="M750,250 Q780,210 820,230 T880,230 T940,250 T1000,230 T1060,250 V400 H750 Z"
          fill="url(#cloud-gradient)"
          filter="url(#cloud-texture)"
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
  transform: scaleY(-1); /* 翻转放在顶部 */
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
}

.c1 {
  animation: floatCloud 25s ease-in-out infinite alternate;
}

.c2 {
  animation: floatCloud 30s ease-in-out infinite alternate-reverse;
}

@keyframes floatCloud {
  0% { transform: translateX(-20px) translateY(0); }
  100% { transform: translateX(20px) translateY(-10px); }
}

:global(.dark) .cloud-patterns {
  color: var(--ink-trace);
  mix-blend-mode: screen;
  opacity: 0.4;
}
</style>

