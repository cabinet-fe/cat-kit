<template>
  <div class="ink-background" aria-hidden="true">
    <!-- 右上角 - 主墨晕 -->
    <div class="ink-layer layer-tr">
      <div class="ink-blob blob-1"></div>
      <div class="ink-blob blob-2"></div>
    </div>

    <!-- 左侧 - 装饰墨迹 -->
    <div class="ink-layer layer-ml">
      <div class="ink-blob blob-3"></div>
    </div>

    <!-- 右下 - 淡墨痕 -->
    <div class="ink-layer layer-br">
      <div class="ink-blob blob-4"></div>
    </div>

    <!-- 全局纹理噪点 - 使用静态 CSS 背景代替 SVG 滤镜 -->
    <div class="noise-overlay"></div>
  </div>
</template>

<style scoped>
.ink-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background-color: var(--paper-white);
  transition: background-color 0.3s ease;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  /* 使用静态 PNG 噪点图或简单的 CSS 渐变代替 feTurbulence */
  background-image: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.01) 2px,
      rgba(0, 0, 0, 0.01) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.01) 2px,
      rgba(0, 0, 0, 0.01) 4px
    );
  opacity: 0.5;
  mix-blend-mode: multiply;
}

.ink-layer {
  position: absolute;
  width: 600px;
  height: 600px;
  mix-blend-mode: multiply;
  /* 降低模糊强度：40px -> 20px，显著减少 GPU 开销 */
  filter: blur(20px);
  opacity: 0.08;
  color: var(--ink-heavy);
  /* 提示浏览器此元素将被合成 */
  will-change: transform;
}

.ink-blob {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at center,
    currentColor 0%,
    transparent 70%
  );
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  /* 将无限动画改为一次性动画，减少持续 GPU 开销 */
  animation: breathe 10s ease-in-out forwards;
}

/* 形状差异化 */
.blob-1 {
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  transform: rotate(10deg);
}

.blob-2 {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  background: radial-gradient(
    circle at 40% 40%,
    currentColor 0%,
    transparent 60%
  );
  animation-duration: 15s;
  animation-direction: reverse;
}

/* 位置布局 */
.layer-tr {
  top: -15%;
  right: -10%;
  transform: scale(1.5);
}

.layer-ml {
  top: 30%;
  left: -10%;
  width: 400px;
  height: 400px;
  opacity: 0.05;
}

.layer-br {
  bottom: -20%;
  right: 10%;
  width: 500px;
  height: 500px;
  opacity: 0.06;
  transform: rotate(45deg);
}

@keyframes breathe {
  0% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    transform: scale(1) rotate(0deg);
  }
  100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: scale(1.05) rotate(5deg);
  }
}

/* 暗色模式适配 */
:global(.dark) .ink-background {
  background-color: var(--paper-white);
}

:global(.dark) .noise-overlay {
  mix-blend-mode: overlay;
  opacity: 0.1;
}

:global(.dark) .ink-layer {
  mix-blend-mode: screen;
  color: var(--ink-light);
  opacity: 0.05;
}

:global(.dark) .ink-blob {
  background: radial-gradient(
    circle at center,
    currentColor 0%,
    transparent 80%
  );
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ink-blob {
    animation: none;
  }
}
</style>
