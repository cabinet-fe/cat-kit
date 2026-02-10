# 虚拟化

## 介绍

本页介绍 `@cat-kit/fe` 的虚拟化能力，核心为 `Virtualizer` 与 `VirtualContainer`，用于大列表渲染优化。

## 快速使用

```typescript
import { Virtualizer, VirtualContainer } from '@cat-kit/fe'

const vertical = new Virtualizer({
  length: 10_000,
  buffer: 8,
  estimateSize: () => 36
})

const container = new VirtualContainer({ vertical })
container.connect(document.querySelector('#list') as HTMLElement)
console.log(vertical.getVisibleItems())
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 概述

虚拟滚动通过只渲染可见区域内的元素来优化长列表性能。`@cat-kit/fe` 提供了 `Virtualizer` 和 `VirtualContainer` 两个类来实现虚拟滚动。

## Virtualizer - 虚拟化核心

`Virtualizer` 负责计算哪些元素应该被渲染。

### 基本用法

```typescript
import { Virtualizer } from '@cat-kit/fe'

const virtualizer = new Virtualizer({
  length: 10000, // 总元素数量
  estimateSize: () => 50, // 估算每个元素高度
  buffer: 5, // 上下缓冲元素数量
  onChange: ({ items, totalSize }) => {
    console.log('可见元素：', items)
    console.log('总高度：', totalSize)
    // 更新 UI
    renderItems(items)
  }
})
```

### 配置选项

```typescript
interface VirtualizerOption {
  /** 元素总数 */
  length?: number

  /** 缓冲区元素数量（上下各多渲染几个） */
  buffer?: number

  /** 估算元素尺寸的函数 */
  estimateSize?: (index: number) => number

  /** 可见元素变化时的回调 */
  onChange?: (ctx: { items: VirtualItem[]; totalSize: number }) => void
}
```

### 更新状态

```typescript
// 更新滚动位置和容器尺寸
virtualizer.update({
  length: 15000, // 更新总数
  containerSize: 600, // 容器高度
  offsetSize: 1000, // 滚动距离
  buffer: 10 // 更新缓冲区
})
```

### 更新元素尺寸

当元素实际渲染后，需要更新其真实尺寸：

```typescript
// 元素渲染后测量真实高度
const element = document.querySelector(`[data-index="0"]`)
if (element) {
  const height = element.getBoundingClientRect().height
  virtualizer.updateItemSize(0, height)
}
```

### 获取可见项

```typescript
const items = virtualizer.getVisibleItems()
// items: VirtualItem[]

interface VirtualItem {
  index: number // 元素索引
  start: number // 元素起始位置（px）
  size: number // 元素尺寸（px）
}
```

## VirtualContainer - 容器管理

`VirtualContainer` 将 `Virtualizer` 与 DOM 元素绑定。

### 基本用法

```typescript
import { Virtualizer, VirtualContainer } from '@cat-kit/fe'

const virtualizer = new Virtualizer({
  length: 10000,
  estimateSize: () => 50,
  onChange: ({ items }) => {
    renderItems(items)
  }
})

const container = new VirtualContainer({
  vertical: virtualizer
})

// 连接到 DOM 元素
container.connect('#list-container')
```

### 滚动控制

```typescript
// 滚动到指定位置（px）
container.scrollTo(1000)

// 滚动到指定元素
container.scrollToIndex(100)
```

### 清理

```typescript
// 断开连接，移除事件监听
container.disconnect()
```

## 完整示例

### Vue 3 示例

```vue
<template>
  <div class="virtual-list-container" ref="containerRef">
    <div class="virtual-list-spacer" :style="{ height: totalSize + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.index"
        :data-index="item.index"
        class="virtual-list-item"
        :style="{
          position: 'absolute',
          top: item.start + 'px',
          left: 0,
          right: 0
        }"
        :ref="(el) => measureItem(el as HTMLElement, item.index)"
      >
        {{ data[item.index] }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Virtualizer, VirtualContainer } from '@cat-kit/fe'

type VisibleItem = {
  index: number
  start: number
  size: number
}

// 数据
const data = ref(Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`))

// 虚拟滚动状态
const visibleItems = ref<VisibleItem[]>([])
const totalSize = ref(0)

// DOM 引用
const containerRef = ref<HTMLElement>()

// 创建虚拟化器
const virtualizer = new Virtualizer({
  length: data.value.length,
  estimateSize: () => 50,
  buffer: 5,
  onChange: ({ items, totalSize: size }) => {
    visibleItems.value = items
    totalSize.value = size
  }
})

const container = new VirtualContainer({
  vertical: virtualizer
})

// 测量元素实际高度
function measureItem(el: HTMLElement | null, index: number) {
  if (!el) return

  const height = el.getBoundingClientRect().height
  virtualizer.updateItemSize(index, height)
}

onMounted(() => {
  if (containerRef.value) {
    container.connect(containerRef.value)
  }
})

onUnmounted(() => {
  container.disconnect()
})
</script>

<style scoped>
.virtual-list-container {
  height: 600px;
  overflow: auto;
  border: 1px solid #ccc;
}

.virtual-list-spacer {
  position: relative;
}

.virtual-list-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
</style>
```

### React 示例

```typescript
import { useEffect, useRef, useState } from 'react'
import { Virtualizer, VirtualContainer } from '@cat-kit/fe'

type VisibleItem = {
  index: number
  start: number
  size: number
}

function VirtualList({ data }: { data: string[] }) {
  const [visibleItems, setVisibleItems] = useState<VisibleItem[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const virtualizerRef = useRef<Virtualizer>()
  const containerManagerRef = useRef<VirtualContainer>()
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    // 创建虚拟化器
    const virtualizer = new Virtualizer({
      length: data.length,
      estimateSize: () => 50,
      buffer: 5,
      onChange: ({ items, totalSize }) => {
        setVisibleItems(items)
        setTotalSize(totalSize)
      }
    })

    const container = new VirtualContainer({
      vertical: virtualizer
    })

    virtualizerRef.current = virtualizer
    containerManagerRef.current = container

    if (containerRef.current) {
      container.connect(containerRef.current)
    }

    return () => {
      container.disconnect()
    }
  }, [data.length])

  // 测量元素
  useEffect(() => {
    visibleItems.forEach(item => {
      const el = itemRefs.current.get(item.index)
      if (el && virtualizerRef.current) {
        const height = el.getBoundingClientRect().height
        virtualizerRef.current.updateItemSize(item.index, height)
      }
    })
  }, [visibleItems])

  return (
    <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${totalSize}px`, position: 'relative' }}>
        {visibleItems.map(item => (
          <div
            key={item.index}
            ref={el => el && itemRefs.current.set(item.index, el)}
            data-index={item.index}
            style={{
              position: 'absolute',
              top: `${item.start}px`,
              left: 0,
              right: 0,
              padding: '10px',
              borderBottom: '1px solid #eee'
            }}
          >
            {data[item.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 原生 JavaScript 示例

```typescript
import { Virtualizer, VirtualContainer } from '@cat-kit/fe'

class VirtualListRenderer {
  private data: string[]
  private virtualizer: Virtualizer
  private container: VirtualContainer
  private containerEl: HTMLElement

  constructor(containerEl: HTMLElement, data: string[]) {
    this.data = data
    this.containerEl = containerEl

    this.virtualizer = new Virtualizer({
      length: data.length,
      estimateSize: () => 50,
      buffer: 5,
      onChange: ({ items, totalSize }) => {
        this.render(items, totalSize)
      }
    })

    this.container = new VirtualContainer({
      vertical: this.virtualizer
    })

    this.container.connect(containerEl)
  }

  private render(items: VirtualItem[], totalSize: number) {
    const spacer = this.containerEl.querySelector('.spacer') as HTMLElement
    if (!spacer) {
      const newSpacer = document.createElement('div')
      newSpacer.className = 'spacer'
      newSpacer.style.position = 'relative'
      this.containerEl.appendChild(newSpacer)
    }

    spacer.style.height = `${totalSize}px`
    spacer.innerHTML = ''

    items.forEach(item => {
      const el = document.createElement('div')
      el.className = 'item'
      el.dataset.index = String(item.index)
      el.style.position = 'absolute'
      el.style.top = `${item.start}px`
      el.style.left = '0'
      el.style.right = '0'
      el.textContent = this.data[item.index]

      // 测量实际高度
      spacer.appendChild(el)
      const height = el.getBoundingClientRect().height
      this.virtualizer.updateItemSize(item.index, height)
    })
  }

  destroy() {
    this.container.disconnect()
  }
}

// 使用
const data = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`)
const container = document.querySelector('#container') as HTMLElement
const list = new VirtualListRenderer(container, data)
```

## 高级用法

### 动态高度元素

```typescript
const virtualizer = new Virtualizer({
  length: data.length,
  // 根据内容估算不同高度
  estimateSize: index => {
    const item = data[index]
    return item.length > 100 ? 100 : 50
  },
  onChange: ({ items }) => {
    renderItems(items)
  }
})
```

### 水平虚拟滚动

```typescript
const horizontalVirtualizer = new Virtualizer({
  length: columns.length,
  estimateSize: () => 150, // 列宽
  buffer: 3
})

const container = new VirtualContainer({
  horizontal: horizontalVirtualizer
})
```

### 重置状态

```typescript
// 当数据完全变化时重置
virtualizer.reset()
```

## 性能优化建议

1. **准确估算**：尽可能准确地估算元素尺寸，减少重计算
2. **合理缓冲**：buffer 值通常设置为 3-10
3. **避免频繁更新**：使用防抖处理 `updateItemSize`
4. **复用元素**：配合对象池模式复用 DOM 元素
5. **懒加载图片**：配合 IntersectionObserver 懒加载图片

## API详解

### Virtualizer

#### 构造函数

```typescript
new Virtualizer(option: VirtualizerOption)
```

#### 方法

- `update(option: UpdateOption): void` - 更新配置
- `updateItemSize(index: number, size: number): void` - 更新元素尺寸
- `getVisibleItems(): VirtualItem[]` - 获取可见项
- `getTotalSize(): number` - 获取总尺寸
- `reset(): void` - 重置状态

### VirtualContainer

#### 构造函数

```typescript
new VirtualContainer(option?: {
  horizontal?: Virtualizer
  vertical?: Virtualizer
})
```

#### 方法

- `connect(el: string | HTMLElement): void` - 连接容器
- `disconnect(): void` - 断开连接
- `scrollTo(offset: number): void` - 滚动到位置
- `scrollToIndex(index: number): void` - 滚动到元素
