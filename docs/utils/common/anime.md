# 动画

本章节描述动画的概念以及cat-kit提供的动画API的使用方法

## 概述

给出状态的起始到结束, 然后自动补出起始到结束中间状态的动画叫做补间动画.

定义一个补间动画我们使用以下最简单的代码来描述

```ts
// 下述代码描述了从起始状态0到结束状态100并且持续时间为300的补间动画
tween({
  start: 0,
  end: 100,
  duration: 300
})
```

一般一个流畅的动画具备的要素有如下几点:

- 保持较高且稳定的帧率, 一般至少要30帧, 60帧是一个较流畅的标准帧数. 现代计算机的显示器帧率普遍达到60, 120的刷新率在手机和电脑上逐渐普及.
- 由于动画是在短时间内进行大量渲染的一个过程, 因此动画应尽可能的减少渲染范围, 遵循局部渲染原则即只渲染可动的物体.
- 动画执行API应尽可能的轻量以减少CPU的负担

cat-kit提供了一套简洁流畅可扩展的补间动画API, 助力开发者以最少的成本来实现更多的动画效果.

<!-- ## 贝塞尔曲线 -->

## Tween API

Tween是一个类用来新建一个补间动画实例, 以下是该类的使用方式

```ts
interface AnimeConfig<State> {
  /** 动画持续时间, 单位毫秒 */
  duration?: number
  /** 缓动函数 */
  easingFunction?: (progress: number) => number
  /** 动画完成后的回调 */
  onComplete?(state: State): void
}

interface TweenConfig<State> {
  /** 动画持续时间, 单位毫秒 */
  duration?: number
  /** 每一帧状态更新时的回调 */
  onUpdate?(state: State): void
  /** 动画完成后的回调 */
  onComplete?(state: State): void
  /** 缓动函数 */
  easingFunction?: (progress: number) => number
}

interface Tween<State> {
  new (
    state: State,
    config?: TweenConfig<State>
  ): {
    state: State
    to(state: State, config?: AnimeConfig<State>): Promise<state>
  }

  /** 提供的默认缓动函数 */
  easing: {
    linear: (progress: number) => number
    easeInQuad: (progress: number) => number
    easeOutQuad: (progress: number) => number
    easeInOutQuad: (progress: number) => number
    easeInBack: (progress: number) => number
    easeOutBack: (progress: number) => number
    easeInOutBack: (progress: number) => number
  }
}

// 新建Tween实例
// tween状态可以传入多个状态
const tween = new Tween(
  { x: 0, y: 0 },
  {
    // 动画持续1000毫秒
    duration: 1000,
    // 定义一个缓动函数, 默认为linear线性匀速
    easingFunction: Tween.easing.easeInQuad
  }
)

// 开始运动
tween.to({ x: 100, y: 100 })
```

### 示例

::: demo
render(utils/common/anime/tween)
:::

## 拓展Tween API

Tween API提供了极少的方法, 这是故意为之的, 一方面, 更少的API意味着更易用, 更小的体积. 另一方面, 在补间动画领域, 已经有很强大的库[GSAP](https://greensock.com/), 如果你对动画的需求比较多, 比较复杂那么可以试试该库.

当然,这不是本节的核心. 当Tween API不能满足你的需求并且你也不想使用非常复杂的库时. 你可以像下面这样扩展

```ts
import { Tween, type TweenConfig } from '@cat-kit/fe'

class CustomTween<State extends Record<string, number>> extends Tween<State> {
  constructor(state: State, config: TweenConfig<State>) {
    super(state, config)
  }

  myTo(state: State) {
    this.raf({
      tick: p => {
        // 在这里实现每一帧的算法
      },
      onComplete: () => {},
      duration: this.duration
    })
  }
}

const myTween = new Tween({ x: 0 })

myTween.myTo({ x: 100 })
```

或者你也可以自己实现缓动函数, 你可以在这个[网站](https://easings.net/zh-cn)去查询各种缓动函数.

```ts

/** 抖动缓动函数 */
const easeOutBounce = (progress: number) => {
  const n1 = 7.5625
  const d1 = 2.75

  if (progress < 1 / d1) {
    return n1 * progress * progress
  } else if (progress < 2 / d1) {
    return n1 * (progress -= 1.5 / d1) * progress + 0.75
  } else if (progress < 2.5 / d1) {
    return n1 * (progress -= 2.25 / d1) * progress + 0.9375
  } else {
    return n1 * (progress -= 2.625 / d1) * progress + 0.984375
  }
}

const tween = new Tween({ x: 0 }, {
  easingFunction: easeOutBounce
})

```
