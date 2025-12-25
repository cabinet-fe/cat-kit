import { ref, onUnmounted } from 'vue'

/**
 * 全屏模式 composable
 */
export function useFullscreen() {
  const isFullscreen = ref(false)

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      exit()
    }
  }

  const enter = () => {
    isFullscreen.value = true
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)
  }

  const exit = () => {
    isFullscreen.value = false
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
  }

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  })

  return {
    isFullscreen,
    enter,
    exit
  }
}

