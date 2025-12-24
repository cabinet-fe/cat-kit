<template>
  <div class="ink-background" aria-hidden="true">
    <!-- SVG 定义区：墨渍滤镜和形状 -->
    <svg width="0" height="0" style="position: absolute">
      <defs>
        <!-- 墨渍滤镜：产生边缘毛刺感 -->
        <filter id="ink-spread">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
        </filter>

        <!-- 墨渍形状 1: 大块晕染 -->
        <path
          id="ink-blot-1"
          d="M45,-58C56.9,-46.3,64.1,-30.9,67.6,-14.3C71.1,2.3,70.9,20.1,62.7,34.8C54.5,49.5,38.3,61.1,21,66.4C3.7,71.7,-14.7,70.7,-30.9,63.2C-47.1,55.7,-61.1,41.7,-68.2,24.8C-75.3,7.9,-75.5,-11.9,-66.6,-27.3C-57.7,-42.7,-39.7,-53.7,-23.4,-61.4C-7.1,-69.1,7.5,-73.5,23.3,-68.9L39.1,-64.3"
        />

        <!-- 墨渍形状 2: 飞白点 -->
        <path
          id="ink-blot-2"
          d="M12,-18C15.5,-14.8,17.4,-9.4,18.1,-3.8C18.8,1.8,18.3,7.6,15.6,12.3C12.9,17,8,20.6,2.3,21.8C-3.4,23,-9.9,21.8,-14.7,18.2C-19.5,14.6,-22.6,8.6,-23.2,2.2C-23.8,-4.2,-21.9,-11,-17.6,-16.1C-13.3,-21.2,-6.6,-24.6,-0.6,-24.3L5.4,-24"
        />
      </defs>
    </svg>

    <!-- 散落的墨渍 -->

    <!-- 右上角 - 主墨韵 -->
    <div class="ink-mark mark-tr">
      <svg viewBox="-80 -80 160 160" class="ink-svg">
        <use href="#ink-blot-1" fill="currentColor" filter="url(#ink-spread)" />
      </svg>
    </div>

    <!-- 左侧 - 装饰墨点 -->
    <div class="ink-mark mark-ml">
      <svg viewBox="-30 -30 60 60" class="ink-svg">
        <use href="#ink-blot-2" fill="currentColor" filter="url(#ink-spread)" />
      </svg>
    </div>

    <!-- 右下 - 淡墨痕 -->
    <div class="ink-mark mark-br">
      <svg viewBox="-80 -80 160 160" class="ink-svg">
        <use
          href="#ink-blot-1"
          fill="currentColor"
          filter="url(#ink-spread)"
          transform="rotate(120) scale(0.8)"
        />
      </svg>
    </div>

    <!-- 随机小点 -->
    <div class="ink-mark mark-random-1">
      <svg viewBox="-30 -30 60 60" class="ink-svg">
        <use
          href="#ink-blot-2"
          fill="currentColor"
          filter="url(#ink-spread)"
          transform="scale(0.6)"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.ink-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1; /* 最底层 */
  pointer-events: none;
  overflow: hidden;
  /* 宣纸纹理噪点 - 可选 */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
}

.ink-mark {
  position: absolute;
  /* 使用浓墨色，通过 opacity 控制深浅 */
  color: var(--ink-heavy);
  /* 正片叠底，模拟墨汁渗入纸张 */
  mix-blend-mode: multiply;
}

.ink-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 位置与大小定义 */

/* 右上大墨渍 */
.mark-tr {
  top: -5%;
  right: -5%;
  width: 40vw;
  max-width: 500px;
  opacity: 0.03; /* 极淡 */
  transform: rotate(15deg);
}

/* 左中墨点 */
.mark-ml {
  top: 40%;
  left: 5%;
  width: 150px;
  opacity: 0.04;
  transform: rotate(-10deg);
}

/* 右下墨痕 */
.mark-br {
  bottom: -10%;
  right: 10%;
  width: 300px;
  opacity: 0.02;
  transform: rotate(45deg);
}

/* 随机小点 */
.mark-random-1 {
  top: 15%;
  left: 20%;
  width: 80px;
  opacity: 0.03;
}

/* 暗色模式适配 */
:global(.dark) .ink-mark {
  color: var(--ink-light); /* 暗色模式下使用淡墨色 */
  mix-blend-mode: screen; /* 暗色模式下使用 screen 模式，模拟白墨在黑纸上的晕染 */
}
</style>
