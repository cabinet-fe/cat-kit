<template>
  <div
    class="solar-terms-container"
    :class="{ visible: isVisible }"
    aria-hidden="true"
  >
    <!-- 卷轴主体 -->
    <div class="scroll-body">
      <!-- 顶部卷轴杆 -->
      <div class="scroll-rod top"></div>

      <!-- 纸张区域 -->
      <div class="paper-content">
        <!-- 装饰边框 -->
        <div class="border-pattern top"></div>

        <!-- 内容区域 -->
        <div class="term-content">
          <!-- 节气名称 (竖排) -->
          <div class="term-name">
            <span v-for="(char, idx) in currentTerm.name" :key="idx">{{
              char
            }}</span>
          </div>

          <!-- 分隔线 -->
          <div class="divider-line"></div>

          <!-- 节气图案与信息 -->
          <div class="term-info">
            <div class="term-icon" :style="{ color: currentSeasonColor }">
              <component :is="currentTerm.icon" />
            </div>
            <div class="term-date">{{ currentTerm.dateStr }}</div>
            <div class="term-season">{{ currentTerm.season }}</div>
          </div>
        </div>

        <!-- 装饰边框 -->
        <div class="border-pattern bottom"></div>

        <!-- 背景纹理 - 使用 CSS 渐变代替 SVG 滤镜 -->
        <div class="paper-texture"></div>
      </div>

      <!-- 底部卷轴杆 -->
      <div class="scroll-rod bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, type VNode } from 'vue'

// --- 二十四节气数据 ---
interface SolarTermInfo {
  name: string
  season: '春' | '夏' | '秋' | '冬'
  color: string
  longitude: number
}

// 二十四节气信息，按太阳黄经度数排列（从春分 0° 开始）
const SOLAR_TERMS_INFO: SolarTermInfo[] = [
  { name: '春分', season: '春', color: '#68b88e', longitude: 0 },
  { name: '清明', season: '春', color: '#68b88e', longitude: 15 },
  { name: '谷雨', season: '春', color: '#68b88e', longitude: 30 },
  { name: '立夏', season: '夏', color: '#e54d42', longitude: 45 },
  { name: '小满', season: '夏', color: '#e54d42', longitude: 60 },
  { name: '芒种', season: '夏', color: '#e54d42', longitude: 75 },
  { name: '夏至', season: '夏', color: '#e54d42', longitude: 90 },
  { name: '小暑', season: '夏', color: '#e54d42', longitude: 105 },
  { name: '大暑', season: '夏', color: '#e54d42', longitude: 120 },
  { name: '立秋', season: '秋', color: '#c9a86c', longitude: 135 },
  { name: '处暑', season: '秋', color: '#c9a86c', longitude: 150 },
  { name: '白露', season: '秋', color: '#c9a86c', longitude: 165 },
  { name: '秋分', season: '秋', color: '#c9a86c', longitude: 180 },
  { name: '寒露', season: '秋', color: '#c9a86c', longitude: 195 },
  { name: '霜降', season: '秋', color: '#c9a86c', longitude: 210 },
  { name: '立冬', season: '冬', color: '#2f4f7f', longitude: 225 },
  { name: '小雪', season: '冬', color: '#2f4f7f', longitude: 240 },
  { name: '大雪', season: '冬', color: '#2f4f7f', longitude: 255 },
  { name: '冬至', season: '冬', color: '#2f4f7f', longitude: 270 },
  { name: '小寒', season: '冬', color: '#2f4f7f', longitude: 285 },
  { name: '大寒', season: '冬', color: '#2f4f7f', longitude: 300 },
  { name: '立春', season: '春', color: '#68b88e', longitude: 315 },
  { name: '雨水', season: '春', color: '#68b88e', longitude: 330 },
  { name: '惊蛰', season: '春', color: '#68b88e', longitude: 345 }
]

// SVG 图标路径
const SEASON_ICONS: Record<string, string> = {
  春: 'M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2M12 14C9.79 14 8 15.79 8 18V22H16V18C16 15.79 14.21 14 12 14M10 18H14V20H10V18Z',
  夏: 'M12 7C12.56 7 13 6.56 13 6V2C13 1.44 12.56 1 12 1S11 1.44 11 2V6C11 6.56 11.44 7 12 7M21 11H17C16.44 11 16 11.44 16 12S16.44 13 17 13H21C21.56 13 22 12.56 22 12S21.56 11 21 11M12 17C11.44 17 11 17.44 11 18V22C11 22.56 11.44 23 12 23S13 22.56 13 22V18C13 17.44 12.56 17 12 17M7 11H3C2.44 11 2 11.44 2 12S2.44 13 3 13H7C7.56 13 8 12.56 8 12S7.56 11 7 11M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9Z',
  秋: 'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.97C7.14 20 7.64 20 8.14 20C12.28 20 17.21 18.25 20.22 14.5C22.5 11.67 22.5 8.5 22.5 8.5C22.5 8.5 19.5 8.5 17 8M18.73 13.04C16.5 15.75 12.5 17.25 9 17.25C8.5 17.25 8 17.22 7.5 17.17L8.77 14.04C9.19 13.17 10.08 12.57 11.08 12.57C11.58 12.57 12.08 12.74 12.5 13.04C13.5 13.79 15 14.29 16.58 14.29C17.42 14.29 18.22 14.08 18.73 13.04Z',
  冬: 'M20.79 13.95L18.46 14.57L16.46 13.44V10.56L18.46 9.43L20.79 10.05L21.31 8.12L19.54 7.65L20.41 5.96L18.61 5.07L17.56 7.04L15.56 5.91L15.11 3.5H13.11L13.56 6.35L11.56 7.5L9.56 6.35L10.01 3.5H8.01L7.56 5.91L5.56 7.04L4.5 5.07L2.71 5.96L3.58 7.65L1.81 8.12L2.33 10.05L4.66 9.43L6.66 10.56V13.44L4.66 14.57L2.33 13.95L1.81 15.88L3.58 16.35L2.71 18.04L4.5 18.93L5.56 16.96L7.56 18.09L8.01 20.5H10.01L9.56 17.65L11.56 16.5V13.62L9.56 12.5L9.11 10.09L11.11 8.96L13.11 10.09L12.66 12.5L10.66 13.62V16.5L12.66 17.65L12.21 20.5H14.21L14.66 18.09L16.66 16.96L17.71 18.93L19.5 18.04L18.63 16.35L20.41 15.88L20.79 13.95M13.11 14.5L11.11 13.37V10.63L13.11 9.5L15.11 10.63V13.37L13.11 14.5Z'
}

/** 创建 SVG 图标 */
function createIcon(d: string): VNode {
  return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
    h('path', { d })
  ])
}

// --- 缓存节气计算结果 ---
interface CurrentTermResult {
  name: string
  season: '春' | '夏' | '秋' | '冬'
  color: string
  dateStr: string
  icon: VNode
}

// 使用闭包缓存计算结果，避免重复计算
let cachedTerm: CurrentTermResult | null = null
let cachedDate: string | null = null

function toJulianDay(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d =
    date.getDate() +
    (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24

  let jy = y
  let jm = m
  if (m <= 2) {
    jy -= 1
    jm += 12
  }

  const a = Math.floor(jy / 100)
  const b = 2 - a + Math.floor(a / 4)

  return (
    Math.floor(365.25 * (jy + 4716)) +
    Math.floor(30.6001 * (jm + 1)) +
    d +
    b -
    1524.5
  )
}

function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) *
      Math.sin((M * Math.PI) / 180) +
    (0.019993 - 0.000101 * T) * Math.sin((2 * M * Math.PI) / 180) +
    0.00029 * Math.sin((3 * M * Math.PI) / 180)
  let sunLon = L0 + C
  const omega = 125.04 - 1934.136 * T
  sunLon -= 0.00569 + 0.00478 * Math.sin((omega * Math.PI) / 180)
  sunLon = sunLon % 360
  if (sunLon < 0) sunLon += 360
  return sunLon
}

function findSolarTermDate(year: number, longitude: number): Date {
  const baseDay = 79 + (longitude / 360) * 365.2422
  let estimatedDayOfYear = baseDay
  if (estimatedDayOfYear > 365) estimatedDayOfYear -= 365

  const estimatedDate = new Date(year, 0, 1)
  estimatedDate.setDate(estimatedDayOfYear)

  let low = toJulianDay(new Date(year, 0, 1))
  let high = toJulianDay(new Date(year, 11, 31))

  const estimatedJd = toJulianDay(estimatedDate)
  low = Math.max(low, estimatedJd - 20)
  high = Math.min(high, estimatedJd + 20)

  while (high - low > 0.0001) {
    const mid = (low + high) / 2
    const sunLon = getSunLongitude(mid)
    let diff = sunLon - longitude
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    if (diff < 0) {
      low = mid
    } else {
      high = mid
    }
  }

  const jd = (low + high) / 2
  const z = Math.floor(jd + 0.5)
  let a = z
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    a = z + 1 + alpha - Math.floor(alpha / 4)
  }
  const b = a + 1524
  const c = Math.floor((b - 122.1) / 365.25)
  const d = Math.floor(365.25 * c)
  const monthOffset = Math.floor((b - d) / 30.6001)

  const day = b - d - Math.floor(30.6001 * monthOffset)
  const month = monthOffset < 14 ? monthOffset - 1 : monthOffset - 13
  const resultYear = month > 2 ? c - 4716 : c - 4715

  return new Date(resultYear, month - 1, day)
}

function getCurrentSolarTerm(date: Date): CurrentTermResult {
  // 检查缓存：同一天内不重复计算
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  if (cachedTerm && cachedDate === dateKey) {
    return cachedTerm
  }

  const year = date.getFullYear()
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  interface TermWithDate {
    info: SolarTermInfo
    date: Date
  }

  const termsThisYear: TermWithDate[] = SOLAR_TERMS_INFO.map(info => ({
    info,
    date: findSolarTermDate(year, info.longitude)
  }))

  const termsLastYear = SOLAR_TERMS_INFO.slice(-3).map(info => ({
    info,
    date: findSolarTermDate(year - 1, info.longitude)
  }))

  const termsNextYear = SOLAR_TERMS_INFO.slice(0, 3).map(info => ({
    info,
    date: findSolarTermDate(year + 1, info.longitude)
  }))

  const allTerms = [...termsLastYear, ...termsThisYear, ...termsNextYear].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )

  let currentTermData = allTerms[0]!
  for (let i = allTerms.length - 1; i >= 0; i--) {
    const term = allTerms[i]
    if (term && term.date <= today) {
      currentTermData = term
      break
    }
  }

  const termDate = currentTermData.date
  const iconPath = SEASON_ICONS[currentTermData.info.season]!

  const result: CurrentTermResult = {
    name: currentTermData.info.name,
    season: currentTermData.info.season,
    color: currentTermData.info.color,
    dateStr: `${termDate.getMonth() + 1}月${termDate.getDate()}日`,
    icon: createIcon(iconPath)
  }

  // 缓存结果
  cachedTerm = result
  cachedDate = dateKey

  return result
}

// 只计算一次，不使用 computed 避免不必要的响应式开销
const currentTerm = getCurrentSolarTerm(new Date())
const currentSeasonColor = currentTerm.color
const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 500)
})
</script>

<style scoped>
.solar-terms-container {
  position: fixed;
  top: 15vh;
  right: 2rem;
  z-index: 2;
  opacity: 0;
  transform: translateX(20px);
  transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  font-family: var(--vp-font-family-base);
  pointer-events: none;
}

.solar-terms-container.visible {
  opacity: 1;
  transform: translateX(0);
}

.scroll-body {
  position: relative;
  width: 100px;
  background: rgba(248, 246, 241, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  border-radius: 2px;
}

.paper-content {
  position: relative;
  padding: 20px 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.paper-texture {
  position: absolute;
  inset: 0;
  /* 使用 CSS 渐变模拟纸张纹理，代替 SVG feTurbulence */
  background-image: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 1px,
      rgba(0, 0, 0, 0.02) 1px,
      rgba(0, 0, 0, 0.02) 2px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(0, 0, 0, 0.02) 1px,
      rgba(0, 0, 0, 0.02) 2px
    );
  pointer-events: none;
  mix-blend-mode: multiply;
}

.scroll-rod {
  height: 8px;
  background: #5c4033;
  border-radius: 4px;
  width: 116px;
  margin-left: -8px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.scroll-rod::after,
.scroll-rod::before {
  content: '';
  position: absolute;
  top: 0;
  width: 8px;
  height: 100%;
  background: #8b5a2b;
  border-radius: 2px;
}
.scroll-rod::after {
  right: 4px;
}
.scroll-rod::before {
  left: 4px;
}

.term-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.term-name {
  font-size: 24px;
  color: var(--ink-heavy);
  font-weight: normal;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'STSong', 'SimSun', 'Songti SC', serif;
  text-shadow: none;
}

.divider-line {
  width: 1px;
  height: 30px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--ink-trace),
    transparent
  );
  opacity: 0.5;
}

.term-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.term-icon {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  margin-bottom: 2px;
}

.term-date,
.term-season {
  font-size: 11px;
  color: var(--ink-light);
  writing-mode: vertical-rl;
  letter-spacing: 2px;
  opacity: 0.8;
}

.border-pattern {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  background-image: repeating-linear-gradient(
    90deg,
    var(--ink-trace),
    var(--ink-trace) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.2;
}

.border-pattern.top {
  top: 4px;
}
.border-pattern.bottom {
  bottom: 4px;
}

/* 响应式：在小屏幕上隐藏 */
@media (max-width: 1280px) {
  .solar-terms-container {
    display: none;
  }
}

:global(.dark) .scroll-body {
  background: rgba(26, 26, 26, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:global(.dark) .paper-texture {
  opacity: 0.1;
  mix-blend-mode: screen;
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .solar-terms-container {
    transition: none;
  }
  .solar-terms-container.visible {
    transform: none;
  }
}
</style>
