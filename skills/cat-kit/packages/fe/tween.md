# fe — Tween

## 适用场景

`Tween` 在一段时间内产生数值和进度，并通过回调交给调用方更新 DOM、Canvas、WebGL 或其他状态。它适合需要暂停、恢复、取消、跳转或可替换调度器的命令式动画。

## 如何选择

| 需求                               | 选择                            |
| ---------------------------------- | ------------------------------- |
| 单个数值从 `from` 过渡到 `to`      | `Tween`                         |
| 只需常规 CSS 属性过渡              | 优先 CSS transition / animation |
| 复杂关键帧与浏览器合成动画         | 优先 Web Animations API         |
| 测试中控制时间，或使用非浏览器帧源 | 提供 `TweenScheduler`           |

## 公共 API

```ts
new Tween(options?: TweenOptions)
```

| `TweenOptions` 字段     | 作用与默认值                         |
| ----------------------- | ------------------------------------ |
| `from` / `to`           | 起止数值，默认 `0` / `1`             |
| `duration`              | 持续毫秒数，默认 `300`               |
| `delay`                 | 延迟毫秒数，默认 `0`                 |
| `easing`                | `(progress) => number`，默认线性     |
| `autoplay`              | 构造后是否立即播放，默认 `false`     |
| `scheduler`             | `{ now, requestFrame, cancelFrame }` |
| `onUpdate`              | 每次值更新时接收 `TweenFrame`        |
| `onFinish` / `onCancel` | 完成或取消回调                       |

`TweenFrame` 包含：

```ts
interface TweenFrame {
  elapsed: number
  progress: number
  easedProgress: number
  value: number
  state: 'idle' | 'running' | 'paused' | 'finished' | 'cancelled'
}
```

控制和读取：

```ts
tween.play(): this
tween.pause(): this
tween.resume(): this
tween.cancel(): this
tween.reset(): this
tween.seek(progress: number): this
tween.setOptions(options: TweenOptions): this

tween.getState(): TweenState
tween.getValue(): number
tween.getProgress(): number
```

内置缓动：`tweenEasings.linear`、`easeInQuad`、`easeOutQuad`、`easeInOutQuad`。

## 最小示例

```ts
import { Tween, tweenEasings } from '@cat-kit/fe'

const element = document.querySelector<HTMLElement>('#box')!
const tween = new Tween({
  from: 0,
  to: 200,
  duration: 500,
  easing: tweenEasings.easeOutQuad,
  onUpdate: ({ value }) => {
    element.style.transform = `translateX(${value}px)`
  }
})

tween.play()
```

## 必要边界

- `Tween` 只计算一个数值，不负责写样式、合成单位、管理多个属性或清理业务资源。
- `duration` 和 `delay` 的负值会按 `0` 处理；`seek` 的进度会限制在 `[0, 1]`。
- `pause()` 只对 `running` 状态生效，`resume()` 只对 `paused` 状态生效。
- `cancel()` 会触发 `onCancel`，随后触发一次 `onUpdate`；已完成或已取消时再次调用无效果。
- `reset()` 回到 `idle`、`from` 和进度 `0`，并触发一次 `onUpdate`；它不会自动重新播放。
- `setOptions()` 是部分更新并立即触发一次 `onUpdate`，不会自动改变当前播放状态。
- 自定义 `TweenScheduler` 的 `now()` 与 `requestFrame` 回调时间必须使用同一时间基准。
- 只有根入口 `@cat-kit/fe` 是公开导入路径。

## 类型入口

[Tween 声明](../../generated/fe/tween.d.ts)
