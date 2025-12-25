<template>
  <div class="seal-stamp" aria-hidden="true">
    <svg width="120" height="120" viewBox="0 0 100 100" class="seal-svg">
      <defs>
        <filter id="seal-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 -0.2" in="noise" result="alphaNoise" />
          <feComposite operator="out" in="SourceGraphic" in2="alphaNoise" />
        </filter>
        <!-- 印泥质感 -->
        <filter id="rough-paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
          <feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="2">
            <feDistantLight azimuth="45" elevation="60"/>
          </feDiffuseLighting>
        </filter>
      </defs>

      <g filter="url(#seal-noise)" transform="rotate(-5, 50, 50)">
        <!-- 印章边框 -->
        <rect x="5" y="5" width="90" height="90" rx="4" fill="none" stroke="currentColor" stroke-width="4" />
        <rect x="12" y="12" width="76" height="76" rx="2" fill="none" stroke="currentColor" stroke-width="2" />

        <!-- 印章文字：喵喵工具 -->
        <!-- 使用简单的几何形状模拟篆刻感，因为不能依赖特殊字体 -->
        <g fill="currentColor">
          <!-- 喵 (左上) -->
          <path d="M20,20 h25 v25 h-25 z M24,24 v17 h17 v-17 z" />
          <rect x="28" y="28" width="9" height="9" />

          <!-- 喵 (右上) -->
           <path d="M55,20 h25 v25 h-25 z M59,24 v17 h17 v-17 z" />
           <rect x="63" y="28" width="9" height="9" />

          <!-- 工 (左下) -->
          <rect x="20" y="55" width="25" height="4" />
          <rect x="30" y="55" width="5" height="25" />
          <rect x="20" y="76" width="25" height="4" />

          <!-- 具 (右下) -->
          <rect x="55" y="55" width="25" height="25" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
          <rect x="55" y="65" width="25" height="3" />
          <rect x="66" y="55" width="3" height="25" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.seal-stamp {
  position: absolute;
  top: 35vh;
  right: 15%;
  z-index: 0;
  color: var(--guochao-vermilion);
  opacity: 0;
  animation: sealIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s forwards;
  mix-blend-mode: multiply;
  pointer-events: none;
}

@keyframes sealIn {
  from {
    opacity: 0;
    transform: scale(1.5) rotate(15deg);
  }
  to {
    opacity: 0.85;
    transform: scale(1) rotate(0deg);
  }
}

.seal-stamp:hover {
  animation: sealPulse 2s infinite;
}

@keyframes sealPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

:global(.dark) .seal-stamp {
  mix-blend-mode: normal;
  opacity: 0.9;
}
</style>

