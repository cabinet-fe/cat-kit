---
title: "@cat-kit/fe 补间动画 API"
description: Tween 类与 tweenEasings 缓动函数的类型签名
---

# 补间 — API

本篇列出 `@cat-kit/fe` 补间模块的公共类型签名。完整声明见 [tween.d.ts](../../../../packages/fe/dist/tween.d.ts)。

```ts
declare class Tween {
  constructor(options?: TweenOptions)
  getState(): TweenState
  getValue(): number
  getProgress(): number
  setOptions(options: TweenOptions): this
  play(): this
  pause(): this
  resume(): this
  cancel(): this
  reset(): this
  seek(progress: number): this
}

type TweenState = 'idle' | 'running' | 'paused' | 'finished' | 'cancelled'

type TweenEasing = (progress: number) => number

declare const tweenEasings: {
  linear: (progress: number) => number
  easeInQuad: (progress: number) => number
  easeOutQuad: (progress: number) => number
  easeInOutQuad: (progress: number) => number
}
```

## TweenOptions

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `from` | `number` | 起始值 |
| `to` | `number` | 结束值 |
| `duration` | `number` | 时长（ms） |
| `delay` | `number` | 延迟（ms） |
| `easing` | `TweenEasing` | 缓动函数 |
| `autoplay` | `boolean` | 是否构造后自动播放 |
| `scheduler` | `TweenScheduler` | 自定义调度器（`now`/`requestFrame`/`cancelFrame`），便于测试或脱离 rAF 环境 |
| `onUpdate` | `(frame: TweenFrame) => void` | 每帧回调 |
| `onFinish` | `(frame: TweenFrame) => void` | 完成回调 |
| `onCancel` | `(frame: TweenFrame) => void` | 取消回调 |

## TweenFrame

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `elapsed` | `number` | 已流逝时间（ms） |
| `progress` | `number` | 线性进度 0~1 |
| `easedProgress` | `number` | 经缓动函数处理后的进度 |
| `value` | `number` | 当前插值 |
| `state` | `TweenState` | 当前状态 |
