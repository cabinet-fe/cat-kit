---
title: "Tween 数值补间动画"
description: "@cat-kit/fe 的补间模块：Tween 类用回调驱动数值从 from 到 to 的时间轴动画，支持缓动函数、暂停恢复、取消重置与按进度跳转，内置 tweenEasings 四个缓动函数，可注入自定义调度器。"
aliases: [tween, 补间动画, 数值动画, easing, GSAP]
keywords: [Tween, TweenOptions, TweenFrame, TweenState, TweenEasing, TweenScheduler, tweenEasings, easeInQuad, easeOutQuad, easeInOutQuad, linear, onUpdate, onFinish, seek, 数值补间, 缓动函数, 进度条动画, 暂停恢复]
---

# Tween 数值补间动画

`@cat-kit/fe` 的补间模块导出 `Tween` 类与缓动函数集 `tweenEasings`。`Tween` 用 `requestAnimationFrame` 驱动一个数值从 `from` 到 `to` 按时长插值，每帧通过 `onUpdate` 回调产出 `{ elapsed, progress, easedProgress, value, state }`；支持 `play` / `pause` / `resume` / `cancel` / `reset` / `seek` / `setOptions` 全套控制，可注入自定义 `TweenScheduler` 以脱离 rAF 环境（测试、Node）。

## 安装

```bash
npm install @cat-kit/fe
```

全部导出仅从包根提供：`import { Tween, tweenEasings } from '@cat-kit/fe'`。

运行前提：默认调度器使用 `performance.now()` 与 `requestAnimationFrame`（缺失时回退 `setTimeout(fn, 16)`），浏览器与支持这两个 API 的运行时均可使用；传入自定义 `scheduler` 后不依赖任何浏览器 API。

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `Tween` | 数值补间动画类：状态机 `idle → running → paused / finished / cancelled` | `packages/fe/tween/apis.md` |
| `tweenEasings` | 缓动函数集：`linear` / `easeInQuad` / `easeOutQuad` / `easeInOutQuad` | `packages/fe/tween/apis.md` |
| `TweenOptions` | 构造参数：`from` / `to` / `duration` / `delay` / `easing` / `autoplay` / `scheduler` / 三个回调（类型） | `packages/fe/tween/apis.md` |
| `TweenFrame` | 每帧数据：`elapsed` / `progress` / `easedProgress` / `value` / `state`（类型） | `packages/fe/tween/apis.md` |
| `TweenState` | `'idle' \| 'running' \| 'paused' \| 'finished' \| 'cancelled'`（类型） | `packages/fe/tween/apis.md` |
| `TweenEasing` | 缓动函数签名 `(progress: number) => number`（类型） | `packages/fe/tween/apis.md` |
| `TweenScheduler` | 自定义调度器：`now` / `requestFrame` / `cancelFrame`（类型） | `packages/fe/tween/apis.md` |
