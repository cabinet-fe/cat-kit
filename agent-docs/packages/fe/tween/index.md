---
title: "@cat-kit/fe 补间动画"
description: 回调驱动的数值补间，支持缓动、暂停恢复与进度跳转
---

# fe — 补间动画

`@cat-kit/fe` 的补间模块提供 `Tween` 类：用回调驱动数值从 `from` 到 `to` 的时间轴动画，内置缓动函数集 `tweenEasings`，支持暂停、恢复、取消、重置与按进度跳转。

## 何时使用

用回调驱动数值动画或可控时间轴（如进度条、数值滚动）。

## 推荐公开 API

`Tween`、`tweenEasings`

```ts
import { Tween, tweenEasings } from '@cat-kit/fe'

new Tween({
  from: 0,
  to: 100,
  duration: 400,
  easing: tweenEasings.easeOutQuad,
  onUpdate: ({ value }) => {
    void value
  }
}).play()
```

完整签名见 [apis.md](apis.md)。

## 约束

- 控制：`play`、`pause`、`resume`、`cancel`、`reset`、`seek`、`setOptions`
- 状态：`getState`、`getValue`、`getProgress`
- 状态机：`idle` → `running` → `paused` / `finished` / `cancelled`

## 类型声明

[tween.d.ts](../../../../packages/fe/dist/tween.d.ts)
