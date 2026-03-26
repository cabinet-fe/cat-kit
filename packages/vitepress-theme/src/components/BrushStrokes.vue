<template>
  <div class="brush-strokes" aria-hidden="true">
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" class="brush-svg">
      <defs>
        <!-- 移除 feTurbulence + feDisplacementMap 滤镜，保留 mask -->
        <mask id="brush-fade">
          <linearGradient id="fade-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="white" stop-opacity="0" />
            <stop offset="0.1" stop-color="white" stop-opacity="0.8" />
            <stop offset="0.9" stop-color="white" stop-opacity="0.8" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
          <rect x="0" y="0" width="1000" height="100" fill="url(#fade-grad)" />
        </mask>
      </defs>

      <path
        d="M50,50 Q250,30 500,50 T950,50"
        class="stroke-path"
        fill="none"
        stroke="currentColor"
        stroke-width="20"
        stroke-linecap="round"
        mask="url(#brush-fade)"
      />

      <!-- 飞白效果辅助线 -->
      <path
        d="M80,45 Q280,25 530,45 T920,55"
        class="stroke-path-small"
        fill="none"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.6"
      />
    </svg>
  </div>
</template>

<style scoped>
.brush-strokes {
  width: 100%;
  height: 60px;
  margin: 40px 0 20px 0;
  color: var(--ink-trace);
  opacity: 0.5;
  mix-blend-mode: multiply;
  pointer-events: none;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.brush-svg {
  width: 100%;
  max-width: 1000px;
  height: 100%;
}

.stroke-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  /* 保留描边动画，性能开销可接受 */
  animation: drawStroke 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.stroke-path-small {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawStroke 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
}

@keyframes drawStroke {
  to {
    stroke-dashoffset: 0;
  }
}

:global(.dark) .brush-strokes {
  mix-blend-mode: screen;
  color: var(--ink-faint);
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .stroke-path,
  .stroke-path-small {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
