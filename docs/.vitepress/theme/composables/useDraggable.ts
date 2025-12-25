import { ref, onUnmounted } from 'vue'

export interface UseDraggableOptions {
  /** 初始值 */
  initial?: number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 拖拽方向：垂直或水平 */
  direction?: 'vertical' | 'horizontal'
  /** 是否反向（向上/向左增加） */
  reverse?: boolean
}

/**
 * 拖拽调整尺寸 composable
 */
export function useDraggable(options: UseDraggableOptions = {}) {
  const {
    initial = 200,
    min = 80,
    max = 500,
    direction = 'vertical',
    reverse = true
  } = options

  const value = ref(initial)
  const isDragging = ref(false)

  let startPos = 0
  let startValue = 0

  const onDragStart = (e: MouseEvent) => {
    isDragging.value = true
    startPos = direction === 'vertical' ? e.clientY : e.clientX
    startValue = value.value

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragEnd)
    document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  const onDragMove = (e: MouseEvent) => {
    if (!isDragging.value) return

    const currentPos = direction === 'vertical' ? e.clientY : e.clientX
    const delta = reverse ? startPos - currentPos : currentPos - startPos
    value.value = Math.max(min, Math.min(max, startValue + delta))
  }

  const onDragEnd = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  onUnmounted(() => {
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
  })

  return {
    value,
    isDragging,
    onDragStart
  }
}

