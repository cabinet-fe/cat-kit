<template>
  <canvas ref="canvasRef" class="ink-particles"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationId: number
let particles: Particle[] = []
let observer: MutationObserver | null = null
const mouse = { x: 0, y: 0 }
let width = 0
let height = 0

// 配置
const PARTICLE_COUNT = 30
const INK_COLORS = ['#1a1a1a', '#333333', '#666666']
const DARK_INK_COLORS = ['#e8e6e3', '#c7c5c2', '#a3a19e']

/** 获取当前主题对应的颜色 */
function getCurrentColors(): string[] {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? DARK_INK_COLORS : INK_COLORS
}

class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
  originalAlpha: number

  constructor() {
    const colors = getCurrentColors()
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 3 + 1
    this.speedX = Math.random() * 0.5 - 0.25
    this.speedY = Math.random() * 0.5 + 0.1 // 缓慢下落
    this.color = colors[Math.floor(Math.random() * colors.length)]!
    this.alpha = Math.random() * 0.5 + 0.1
    this.originalAlpha = this.alpha
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    // 鼠标交互：简单的避让效果
    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 100) {
      const forceDirectionX = dx / distance
      const forceDirectionY = dy / distance
      const force = (100 - distance) / 100
      const directionX = forceDirectionX * force * 2
      const directionY = forceDirectionY * force * 2
      this.x -= directionX
      this.y -= directionY
      this.alpha = Math.min(this.originalAlpha + 0.4, 1) // 靠近鼠标变深
    } else {
      if (this.alpha > this.originalAlpha) {
        this.alpha -= 0.02
      }
    }

    // 边界检查
    if (this.y > height) {
      this.y = -10
      this.x = Math.random() * width
    }
    if (this.x > width) this.x = 0
    if (this.x < 0) this.x = width
  }

  draw() {
    if (!ctx) return
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function updateParticleColors() {
  const colors = getCurrentColors()
  particles.forEach(p => {
    p.color = colors[Math.floor(Math.random() * colors.length)]!
  })
}

function resize() {
  if (!canvasRef.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvasRef.value.width = width
  canvasRef.value.height = height
  updateParticleColors()
}

function handleMouseMove(e: MouseEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

function animate() {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, width, height)

  particles.forEach(p => {
    p.update()
    p.draw()
  })

  animationId = requestAnimationFrame(animate)
}

function init() {
  if (!canvasRef.value) return
  resize()

  // 初始化粒子
  particles = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle())
  }

  animate()

  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', handleMouseMove)
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    init()

    // 监听暗色模式变化
    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          updateParticleColors()
        }
      })
    })
    observer.observe(document.documentElement, { attributes: true })
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', handleMouseMove)
  observer?.disconnect()
})
</script>

<style scoped>
.ink-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 让鼠标事件穿透到下层，但我们在 window 上监听了 */
  z-index: 0;
}
</style>
