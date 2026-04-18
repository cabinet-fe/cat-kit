---
title: Tween 动画
description: '@cat-kit/fe Tween：面向浏览器补间动画的轻量类'
sidebarOrder: 3
---

# Tween 动画

## 介绍

`Tween` 用来做数值补间，适合滚动过渡、数值动画和轻量 UI 过场这类“只有一条时间轴”的场景。

它支持：

- 基于 `requestAnimationFrame` 的逐帧推进
- `play / pause / resume / cancel / reset / seek`
- 自定义 easing
- 注入 scheduler，便于测试或宿主接管时间推进

## 快速使用

```typescript
import { Tween, tweenEasings } from '@cat-kit/fe'

const tween = new Tween({
  from: 0,
  to: 100,
  duration: 400,
  easing: tweenEasings.easeOutQuad,
  onUpdate: ({ value }) => {
    console.log(value)
  }
})

tween.play()
```

## API参考

### 构造参数

```typescript
interface TweenOptions {
  from?: number
  to?: number
  duration?: number
  delay?: number
  easing?: (progress: number) => number
  autoplay?: boolean
  scheduler?: TweenScheduler
  onUpdate?: (frame: TweenFrame) => void
  onFinish?: (frame: TweenFrame) => void
  onCancel?: (frame: TweenFrame) => void
}
```

### 常用实例方法

```typescript
tween.play()
tween.pause()
tween.resume()
tween.cancel()
tween.reset()
tween.seek(0.5)
```

### 状态与数值读取

```typescript
tween.getState()
tween.getValue()
tween.getProgress()
```

### 内置 easing

```typescript
tweenEasings.linear
tweenEasings.easeInQuad
tweenEasings.easeOutQuad
tweenEasings.easeInOutQuad
```
