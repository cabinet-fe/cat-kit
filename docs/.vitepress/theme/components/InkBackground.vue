<template>
  <div class="ink-background" aria-hidden="true">
    <!-- SVG 定义区 -->
    <svg width="0" height="0" style="position: absolute">
      <defs>
        <!-- 基础墨渍形状 -->
        <path
          id="ink-blob-1"
          d="M45.7,-76.3C58.9,-69.3,69.1,-55.5,76.5,-41.2C83.9,-26.9,88.5,-12.1,86.6,2.1C84.7,16.3,76.3,29.9,66.6,41.9C56.9,53.9,45.9,64.3,33.3,70.5C20.7,76.7,6.5,78.7,-6.8,76.9C-20.1,75.1,-32.5,69.5,-43.8,61.7C-55.1,53.9,-65.3,43.9,-72.6,32.2C-79.9,20.5,-84.3,7.1,-82.4,-5.4C-80.5,-17.9,-72.3,-29.5,-63.1,-40.1C-53.9,-50.7,-43.7,-60.3,-32.1,-68.2C-20.5,-76.1,-7.5,-82.3,4.1,-81.2C15.7,-80.1,31.4,-71.7,45.7,-76.3Z"
          transform="translate(100 100)"
        />

        <path
          id="ink-blob-2"
          d="M38.9,-64.3C50.2,-55.1,59.1,-43.6,65.3,-30.9C71.5,-18.2,75,-4.3,72.6,8.7C70.2,21.7,61.9,33.8,52.2,43.5C42.5,53.2,31.4,60.5,19.1,64.2C6.8,67.9,-6.7,68,-19.7,64.1C-32.7,60.2,-45.2,52.3,-54.8,41.8C-64.4,31.3,-71.1,18.2,-72.1,4.7C-73.1,-8.8,-68.4,-22.7,-59.6,-34.5C-50.8,-46.3,-37.9,-56,-24.8,-63.3C-11.7,-70.6,1.6,-75.5,13.8,-73.2C26,-70.9,48.8,-61.4,38.9,-64.3Z"
          transform="translate(100 100)"
        />

        <!-- 墨韵渐变 -->
        <radialGradient
          id="ink-gradient"
          cx="50%"
          cy="50%"
          r="50%"
          fx="50%"
          fy="50%"
        >
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.8" />
          <stop offset="60%" stop-color="currentColor" stop-opacity="0.4" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </radialGradient>
      </defs>
    </svg>

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

    <!-- 全局纹理噪点 -->
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
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.6;
  mix-blend-mode: multiply;
}

.ink-layer {
  position: absolute;
  width: 600px;
  height: 600px;
  mix-blend-mode: multiply; /* 模拟墨汁渗入效果 */
  filter: blur(40px); /* 关键：强力模糊产生晕染感 */
  opacity: 0.08; /* 极淡，保持背景不抢眼 */
  color: var(--ink-heavy);
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
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; /* 有机形状 */
  animation: breathe 10s ease-in-out infinite alternate;
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
  animation-direction: alternate-reverse;
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
  background-color: var(--paper-white); /* 此时为深色背景 */
}

:global(.dark) .noise-overlay {
  mix-blend-mode: overlay;
  opacity: 0.1;
}

:global(.dark) .ink-layer {
  mix-blend-mode: screen; /* 暗色下使用 screen 模拟光晕/白墨 */
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
</style>
