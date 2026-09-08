---
title: "@cat-kit/vitepress-theme 主题与组合式函数"
description: 包根 @cat-kit/vitepress-theme 的全部公共导出：默认主题对象、CatKitLayout 布局、useConsoleInterceptor、useDraggable、useFullscreen 三个组合式函数，以及 DemoContainer 与 Mermaid 全局组件的 props。
aliases: [theme api, composables, 主题 API, useConsoleInterceptor, 组合式函数]
keywords: [useConsoleInterceptor, useDraggable, useFullscreen, LogEntry, UseConsoleInterceptorOptions, UseDraggableOptions, CatKitLayout, DemoContainer, Mermaid, enhanceApp, DefaultTheme, isFullscreen, clearLogs, isDragging, onDragStart, 控制台拦截, 拖拽调整, 全屏切换, 主题对象]
---

# @cat-kit/vitepress-theme 主题与组合式函数

包根 `@cat-kit/vitepress-theme` 导出默认主题对象（`extends` 官方 `DefaultTheme`，`Layout` 为 `CatKitLayout`，`enhanceApp` 注册全局组件 `DemoContainer` 与 `Mermaid`）、布局组件 `CatKitLayout`，以及 3 个组合式函数 `useConsoleInterceptor`、`useDraggable`、`useFullscreen`。全部组合式函数仅运行在浏览器环境（依赖 `window` 与 DOM 事件）。

## 快速上手

主题入口只需两行（前置步骤，站点全局生效一次）：

```ts
// .vitepress/theme/index.ts
import theme from '@cat-kit/vitepress-theme'

export default theme
```

之后在任意组件中使用组合式函数：

```vue
<!-- components/Stage.vue -->
<script setup lang="ts">
import { useFullscreen } from '@cat-kit/vitepress-theme'

const { isFullscreen, enter, exit } = useFullscreen()
</script>

<template>
  <div>
    <button @click="isFullscreen ? exit() : enter()">
      {{ isFullscreen ? '退出全屏' : '进入全屏' }}
    </button>
    <!-- 进入全屏后 body 滚动被锁定，按 Escape 退出 -->
    <div :class="{ fullscreen: isFullscreen }">舞台内容</div>
  </div>
</template>
```

## API 签名

```ts
import type { App, DefineComponent, Ref } from 'vue'

/** 默认导出：VitePress 主题对象 */
declare const theme: {
  /** 扩展 VitePress 官方默认主题 DefaultTheme */
  extends: typeof DefaultTheme
  /** 布局替换为 CatKitLayout */
  Layout: typeof CatKitLayout
  /** 注册全局组件 DemoContainer 与 Mermaid */
  enhanceApp(ctx: { app: App }): void
}
export default theme

/** 布局组件：包裹默认主题 Layout；无 props，首页（frontmatter.layout === 'home'）插槽注入装饰 */
export declare const CatKitLayout: DefineComponent<
  Record<string, never>,
  Record<string, never>,
  unknown
>

export interface LogEntry {
  /** 递增的日志 id，用作列表 key */
  id: number
  /** console 方法名 */
  type: 'log' | 'warn' | 'error' | 'info' | 'debug'
  /** 本次调用的原始参数（未序列化） */
  args: unknown[]
  /** 收集时刻的毫秒时间戳 */
  timestamp: number
}

export interface UseConsoleInterceptorOptions {
  /** 是否激活拦截。必填；true 拦截并收集，false 恢复原始 console */
  active: Ref<boolean>
  /** 日志容器元素引用；传入后新日志到达时自动滚动到底部 */
  containerRef?: Ref<HTMLElement | undefined>
}

export declare function useConsoleInterceptor(options: UseConsoleInterceptorOptions): {
  /** 收集到的日志，激活期间每次 console 调用追加一条 */
  logs: Ref<LogEntry[]>
  /** 清空 logs */
  clearLogs(): void
}

export interface UseDraggableOptions {
  /** 初始值。默认 200 */
  initial?: number
  /** 最小值。默认 80 */
  min?: number
  /** 最大值。默认 500 */
  max?: number
  /** 拖拽方向。默认 'vertical' */
  direction?: 'vertical' | 'horizontal'
  /** 反向：向上 / 向左拖动增大数值。默认 true */
  reverse?: boolean
}

export declare function useDraggable(options?: UseDraggableOptions): {
  /** 当前值，钳制在 [min, max] 区间 */
  value: Ref<number>
  /** 是否拖拽中 */
  isDragging: Ref<boolean>
  /** 绑定到把手元素的 mousedown 事件 */
  onDragStart(e: MouseEvent): void
}

export declare function useFullscreen(): {
  /** 是否处于全屏状态 */
  isFullscreen: Ref<boolean>
  /** 进入全屏：锁定 body 滚动并监听 keydown */
  enter(): void
  /** 退出全屏：恢复 body 滚动并移除监听 */
  exit(): void
}
```

样式入口为副作用导入，两个路径指向同一份 CSS：

```ts
import '@cat-kit/vitepress-theme/style.css'
// 等价写法：
import '@cat-kit/vitepress-theme/styles/theme.css'
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `active` | `Ref<boolean>` | — | 是 | 初始值立即生效（`immediate` watch）；组件卸载时自动恢复原始 console |
| `containerRef` | `Ref<HTMLElement \| undefined>` | — | 否 | 传入后新日志在 `nextTick` 中把 `scrollTop` 置为 `scrollHeight` |
| `initial` | `number` | `200` | 否 | `value` 的起点 |
| `min` | `number` | `80` | 否 | `value` 下界 |
| `max` | `number` | `500` | 否 | `value` 上界 |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | 否 | `vertical` 取 `clientY`，`horizontal` 取 `clientX` |
| `reverse` | `boolean` | `true` | 否 | `true` 时向上 / 向左拖动增大数值 |

### 全局组件 props

`DemoContainer` 与 `Mermaid` 由 `enhanceApp` 注册为同名全局组件，不从包根导出。手动注册（不使用默认主题入口时）后按下列 props 传值：

| 组件 | prop | 类型 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `DemoContainer` | `is` | `DefineComponent` | 否 | 预览区渲染的示例组件；缺省时预览区为空 |
| `DemoContainer` | `path` | `string` | 是 | 相对 `examplesDir` 的示例路径 |
| `DemoContainer` | `code` | `string` | 否 | 源码原文，需 `encodeURIComponent` 编码 |
| `DemoContainer` | `highlightCode` | `string` | 否 | Shiki 高亮 HTML，需 `encodeURIComponent` 编码 |
| `DemoContainer` | `lineCount` | `number` | 否 | 源码行数，用于源码视图行号 |
| `Mermaid` | `code` | `string` | 是 | 图表源码，需 `encodeURIComponent` 编码；暗色模式切换时重绘 |

## 方法与事件

组合式函数返回值的同步 / 异步行为与触发条件：

- `useConsoleInterceptor` 返回 `{ logs, clearLogs }`：均为同步。`logs` 在 `active` 为 `true` 期间随每次 `console.log / warn / error / info / debug` 调用同步追加，原始输出同时透传到浏览器控制台；`active` 变为 `false` 或组件卸载时恢复原始 console，`logs` 保留。函数体内不抛错。
- `useDraggable` 返回 `{ value, isDragging, onDragStart }`：均为同步。`onDragStart(e)` 在 mousedown 时向 `document` 注册 `mousemove` / `mouseup`，拖拽期间 `value` 钳制在 `[min, max]`，`body` 的 `cursor` 置为 `ns-resize`（vertical）或 `ew-resize`（horizontal）、`userSelect` 置为 `none`；mouseup 解除监听并还原样式。组件卸载时解除残留监听。
- `useFullscreen` 返回 `{ isFullscreen, enter, exit }`：均为同步。`enter()` 把 `body.style.overflow` 置为 `hidden` 并注册 `window` 的 `keydown`；按 `Escape` 触发 `exit()`；`exit()` 还原 `overflow` 并移除监听。组件卸载时执行与 `exit()` 相同的清理。

## 典型示例

### 收集示例运行时的 console 输出

```vue
<!-- components/RunPanel.vue -->
<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useConsoleInterceptor, type LogEntry } from '@cat-kit/vitepress-theme'

const props = defineProps<{ active?: boolean }>()

const containerRef = ref<HTMLElement>()

// active 必填：prop 可缺省，用 toRef 兜底为 false
const { logs, clearLogs } = useConsoleInterceptor({
  active: toRef(() => props.active ?? false),
  containerRef
})

function format(entry: LogEntry): string {
  return entry.args.map((arg) => String(arg)).join(' ')
}
</script>

<template>
  <div>
    <button @click="clearLogs">清空日志</button>
    <div ref="containerRef" style="max-height: 200px; overflow: auto">
      <div v-for="entry in logs" :key="entry.id">
        [{{ entry.type }}] {{ format(entry) }}
      </div>
    </div>
  </div>
</template>
```

父组件把 `active` 置为 `true` 后，页面内 `console.log('count =', 1)` 被收集为一条 `type: 'log'` 的 `LogEntry`，同时仍出现在浏览器控制台。

### 拖拽调整面板高度

```vue
<!-- components/SizePanel.vue -->
<script setup lang="ts">
import { useDraggable } from '@cat-kit/vitepress-theme'

// 与主题 DemoContainer 控制台面板相同的取值
const { value: height, isDragging, onDragStart } = useDraggable({
  initial: 280,
  min: 80,
  max: 500
})
</script>

<template>
  <div :style="{ height: `${height}px`, overflow: 'auto' }">面板内容</div>
  <!-- 把手：按住向上拖增大高度（reverse 默认 true） -->
  <button @mousedown="onDragStart">
    {{ isDragging ? '拖拽中' : `当前高度 ${height}px` }}
  </button>
</template>
```

### 样式级全屏容器

```vue
<!-- components/Stage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useFullscreen } from '@cat-kit/vitepress-theme'

const { isFullscreen, enter, exit } = useFullscreen()
const frames = ref([1, 2, 3])
</script>

<template>
  <div :class="{ fullscreen: isFullscreen }">
    <ul>
      <li v-for="frame in frames" :key="frame">帧 {{ frame }}</li>
    </ul>
    <button @click="isFullscreen ? exit() : enter()">
      {{ isFullscreen ? '退出全屏（Escape 同效）' : '进入全屏' }}
    </button>
  </div>
</template>

<!-- useFullscreen 只管理状态与 body 滚动锁定，全屏外观由使用方定义 -->
<style scoped>
.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow: auto;
  background: var(--vp-c-bg);
}
</style>
```

## 注意事项

> [!WARNING]
> - 本库 `useFullscreen` 是样式级全屏（锁 `body` 滚动 + 组件加 `fullscreen` 类），不是浏览器 Fullscreen API；不会调用 `requestFullscreen`，地址栏不消失。
> - 本库 `useDraggable` 只监听 `document` 的 `mousemove` / `mouseup`，不支持触屏拖拽。
> - `useConsoleInterceptor` 不吞输出：日志在收集的同时透传到浏览器控制台；原始 console 方法缓存于 `window.__catkit_original_console__`，多实例共享，重复激活不会层层包裹。
> - `DemoContainer` 与 `Mermaid` 是 `enhanceApp` 注册的全局组件，不从包根导出；包 exports 只开放 `.`、`./config`、`./style.css`、`./styles/theme.css`，不使用默认主题入口时没有公开途径注册，页面告警 `Failed to resolve component: DemoContainer`（`Mermaid` 同理）。
> - 主题样式由默认导出自动加载；`style.css` 与 `styles/theme.css` 是同一份 CSS 的两个导出名，禁止同时引入。
> - `CatKitLayout` 的装饰组件只渲染在首页：`frontmatter.layout` 为 `'home'` 时显示祥云、印章与笔触，其余页面不渲染。

## 常见问题

### `logs` 一直为空

原因：`active` 为 `false`，拦截未激活。修复：传入受控的 `Ref<boolean>` 并置为 `true`。

```ts
import { ref } from 'vue'
import { useConsoleInterceptor } from '@cat-kit/vitepress-theme'

const active = ref(true)
const { logs } = useConsoleInterceptor({ active })
```

### 页面告警 `Failed to resolve component: Mermaid`

原因：主题入口没有使用包根默认导出，`Mermaid` 与 `DemoContainer` 未被注册。包 exports 只开放 `.`、`./config`、`./style.css`、`./styles/theme.css` 四个子路径，这两个组件没有公开导出，手动注册无公开途径。修复：主题入口改用默认导出，注册由 `enhanceApp` 自动完成。

```ts
// .vitepress/theme/index.ts
import theme from '@cat-kit/vitepress-theme'

export default theme
```
