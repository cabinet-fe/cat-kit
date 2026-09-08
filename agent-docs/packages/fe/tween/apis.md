---
title: "Tween 补间动画类 API"
description: "@cat-kit/fe Tween 类完整 API：TweenOptions 全部默认值（from 0 / to 1 / duration 300 / easing linear）、TweenFrame 帧数据、tweenEasings 缓动公式、play/pause/resume/cancel/reset/seek/setOptions 行为与状态机迁移。"
aliases: [Tween api, tweenEasings, 补间签名, easing functions, 动画类]
keywords: [Tween, TweenOptions, TweenFrame, TweenState, TweenEasing, TweenScheduler, tweenEasings, autoplay, duration, delay, easing, onUpdate, onFinish, onCancel, play, pause, resume, cancel, reset, seek]
---

# Tween 补间动画类 API

`@cat-kit/fe` 从包根导出 `Tween` 类、`tweenEasings` 缓动函数集及配套类型。`Tween` 是回调驱动的数值补间：按 `duration`（毫秒）把数值从 `from` 插值到 `to`，每帧把 `TweenFrame` 交给 `onUpdate`。

## 快速上手

```ts
import { Tween, tweenEasings } from '@cat-kit/fe'

const tween = new Tween({
  from: 0,
  to: 100,
  duration: 400,
  easing: tweenEasings.easeOutQuad,
  autoplay: true, // 构造后立即播放；不传则停在 idle
  onUpdate: ({ value }) => console.log(Math.round(value)) // 每帧输出当前值
})

console.log(tween.getState()) // => 'running'
```

## API 签名

```ts
export type TweenState = 'idle' | 'running' | 'paused' | 'finished' | 'cancelled'

/** 缓动函数：入参线性进度 0~1，返回缓动后的进度 */
export type TweenEasing = (progress: number) => number

/** 自定义调度器：脱离 requestAnimationFrame 环境（测试、Node）时注入 */
export interface TweenScheduler {
  /** 当前时间（毫秒），语义对齐 performance.now() */
  now(): number
  /** 请求下一帧，返回句柄 */
  requestFrame(callback: FrameRequestCallback): number
  /** 取消一帧 */
  cancelFrame(handle: number): void
}

export interface TweenFrame {
  /** 已流逝毫秒数（不含 delay 前的时间，clamp 到 >= 0） */
  elapsed: number
  /** 线性进度 0~1 */
  progress: number
  /** 经 easing 处理后的进度 */
  easedProgress: number
  /** 当前插值：from + (to - from) * easedProgress */
  value: number
  /** 触发回调时的状态 */
  state: TweenState
}

export interface TweenOptions {
  /** 起始值，默认 0 */
  from?: number
  /** 结束值，默认 1 */
  to?: number
  /** 时长（毫秒），默认 300；负数按 0 处理；0 表示首帧直接到达 to */
  duration?: number
  /** 延迟（毫秒），默认 0；负数按 0 处理 */
  delay?: number
  /** 缓动函数，默认 tweenEasings.linear */
  easing?: TweenEasing
  /** 仅传 true 时构造后自动播放；false 与缺省都停在 idle */
  autoplay?: boolean
  /** 自定义调度器，默认 performance.now() + requestAnimationFrame（无 rAF 时回退 setTimeout 16ms） */
  scheduler?: TweenScheduler
  /** 每帧回调；seek / reset / setOptions / cancel / pause 也会触发 */
  onUpdate?: (frame: TweenFrame) => void
  /** 播放到 to 时触发一次 */
  onFinish?: (frame: TweenFrame) => void
  /** cancel 时触发一次（finished 后 cancel 为 no-op，不触发） */
  onCancel?: (frame: TweenFrame) => void
}

export declare const tweenEasings: {
  /** p => p */
  linear: TweenEasing
  /** p => p * p */
  easeInQuad: TweenEasing
  /** p => p * (2 - p) */
  easeOutQuad: TweenEasing
  /** p < 0.5 ? 2p² : -1 + (4 - 2p)p */
  easeInOutQuad: TweenEasing
}

export declare class Tween {
  constructor(options?: TweenOptions)
  /** 当前状态 */
  getState(): TweenState
  /** 当前插值 */
  getValue(): number
  /** 当前线性进度 0~1 */
  getProgress(): number
  /** 合并更新选项（未传字段保持原值）并触发一次 onUpdate，返回 this */
  setOptions(options: TweenOptions): this
  /** 播放；从未 pause 过（含 finished/cancelled 后）时从头开始，paused 后从暂停点继续 */
  play(): this
  /** 暂停；仅 running 状态生效，其他状态 no-op */
  pause(): this
  /** 从暂停点继续；仅 paused 状态生效，其他状态 no-op */
  resume(): this
  /** 取消；cancelled/finished 后 no-op；触发 onCancel 与 onUpdate 各一次 */
  cancel(): this
  /** 回到初始：进度 0、value = from、状态 idle，触发一次 onUpdate */
  reset(): this
  /** 跳到指定进度（0~1，越界 clamp），立即更新 value 并触发 onUpdate，返回 this */
  seek(progress: number): this
}
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `from` | `number` | `0` | 否 | 任意数值 |
| `to` | `number` | `1` | 否 | 任意数值；可与 `from` 相等（动画恒为 `from` 值） |
| `duration` | `number` | `300` | 否 | 毫秒；负数按 `0` 处理；`0` 时首帧直接 `finished` 且 `value = to` |
| `delay` | `number` | `0` | 否 | 毫秒；负数按 `0` 处理；延迟期内不产出帧 |
| `easing` | `TweenEasing` | `tweenEasings.linear` | 否 | 入参 0~1，返回值决定 `value` 与 `easedProgress` |
| `autoplay` | `boolean` | — | 否 | 仅 `true` 触发自动播放；`false` 与缺省均为 `idle` |
| `scheduler` | `TweenScheduler` | 内置 rAF 调度器 | 否 | 三方法需自行实现；测试中常用假时钟注入 |
| `onUpdate` | `(frame: TweenFrame) => void` | — | 否 | 每帧与 `seek` / `reset` / `setOptions` / `cancel` / `pause` 时触发 |
| `onFinish` | `(frame: TweenFrame) => void` | — | 否 | `progress >= 1` 时触发一次 |
| `onCancel` | `(frame: TweenFrame) => void` | — | 否 | 仅 `cancel()` 主动取消时触发一次 |

`seek(progress)` 的 `progress`：`number`，必填，取值 0~1，越界值 clamp 到边界（`seek(2)` 等价 `seek(1)`，`seek(-1)` 等价 `seek(0)`）。

## 方法与事件

全部方法同步；除四个读取方法外都返回 `this` 支持链式调用；不抛错。

- `play()`：取消当前帧，`state = 'running'`，从 `pausedElapsed`（暂停时已累计的进度时间）继续排帧。未经历 `pause()` 时 `pausedElapsed` 为 0，所以 `finished` 或 `cancelled` 后调用 `play()` 等价**从头重播**
- `pause()`：仅 `running` 生效；记录已流逝时间、停帧、触发一次 `onUpdate`（`state: 'paused'`）。`idle` / `paused` / `finished` / `cancelled` 下调用为 no-op
- `resume()`：仅 `paused` 生效；用暂停点恢复排帧。其余状态 no-op
- `cancel()`：`cancelled` / `finished` 状态下 no-op；否则置 `cancelled`、停帧，按当前进度构造帧依次触发 `onCancel` 与 `onUpdate`
- `reset()`：停帧，进度归 0、`value = from`、清除暂停累计、`state = 'idle'`，触发一次 `onUpdate`。不清空 `setOptions` 传入的配置
- `seek(progress)`：clamp 后更新 `progress` 与 `value`、把计时起点重置为当前时间并触发一次 `onUpdate`；`running` 中调用会以新的进度为基准继续播放
- `setOptions(options)`：合并更新（未传字段不变），立即触发一次 `onUpdate`，返回 `this`。运行中修改 `duration` / `delay` / `easing` 按剩余时间重新计算

状态机迁移：`idle --play--> running --完成--> finished`；`running --pause--> paused --resume/play--> running`；`idle/running/paused --cancel--> cancelled`；`任意 --reset--> idle`。

## 典型示例

### 数值滚动显示

```ts
import { Tween, tweenEasings } from '@cat-kit/fe'

const el = document.querySelector('#counter') as HTMLElement

const tween = new Tween({
  from: 0,
  to: 1024,
  duration: 600,
  easing: tweenEasings.easeOutQuad,
  autoplay: true,
  onUpdate: ({ value }) => {
    el.textContent = String(Math.round(value))
  },
  onFinish: () => console.log('done', tween.getState()) // => 'done finished'
})
```

### 暂停、恢复与按进度跳转

```ts
import { Tween } from '@cat-kit/fe'

const tween = new Tween({ from: 0, to: 10, duration: 1000 })

tween.play()
tween.seek(0.5) // 直接跳到中点
console.log(tween.getValue()) // => 5
console.log(tween.getProgress()) // => 0.5

tween.pause()
console.log(tween.getState()) // => 'paused'
tween.resume() // 从 0.5 处继续播完
```

### 注入假时钟调度器（测试 / Node）

```ts
import { Tween, type TweenScheduler } from '@cat-kit/fe'

let now = 0
let frame: FrameRequestCallback | null = null
const scheduler: TweenScheduler = {
  now: () => now,
  requestFrame: (cb) => {
    frame = cb
    return 1
  },
  cancelFrame: () => {
    frame = null
  }
}

const values: number[] = []
const tween = new Tween({
  from: 0,
  to: 100,
  duration: 100,
  scheduler,
  onUpdate: ({ value }) => values.push(Math.round(value))
})

tween.play()
now = 50
frame!(50) // 手动推进一帧
now = 100
frame!(100)
console.log(values) // => [50, 100]
console.log(tween.getState()) // => 'finished'
```

## 注意事项

> [!WARNING]
> - `autoplay` 仅在传 `true` 时自动播放；`autoplay: false` 与缺省都停在 `idle`，必须再调 `play()`。不是「构造即播放」。
> - `play()` 在 `finished` / `cancelled` 后调用会**从头重播**，不是从结束位置继续；要续播用 `pause()` + `resume()`。
> - `seek(progress)` 的参数是 0~1 的**进度**，不是毫秒时间；与部分动画库的 `seek(ms)` 语义不同。
> - `onUpdate` 不只在新动画帧触发：`seek` / `reset` / `setOptions` / `cancel` / `pause` 都会立即触发一次；依赖「每帧只调一次」的逻辑需自行按 `state` 过滤。
> - `cancel()` 会连带触发一次 `onUpdate`（`state: 'cancelled'`）；`onFinish` 只在自然播完时触发，`cancel` 不触发 `onFinish`。
> - 默认值是 `from: 0, to: 1, duration: 300`；不带参数 `new Tween()` 播放的是 0 到 1 的 300ms 补间。
