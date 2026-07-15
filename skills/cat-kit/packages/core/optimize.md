# core — 执行控制

## 何时使用

- 控制高频事件调用，延迟异步流程，或限制一组任务的并发数。
- 对可能同步抛错的小段逻辑提供默认值。

## 推荐公开 API

- `debounce(fn, delay?, immediate?)`：防抖，默认延迟 `300ms`、立即模式开启。
- `throttle(fn, delay?, callback?)`：前缘节流，默认窗口 `300ms`。
- `sleep(ms)`：返回延时完成的 Promise。
- `parallel(tasks, { concurrency }?)`：按上限执行任务并保持结果顺序。
- `safeRun(fn, defaultValue?)`：捕获同步异常。

## 最小示例

```ts
import { debounce, parallel } from '@cat-kit/core'

const search = debounce((keyword: string) => {
  console.log(keyword)
}, 300, false)

search('cat')

const tasks = [1, 2, 3].map((value) => async () => value * 2)
const results = await parallel(tasks, { concurrency: 2 })
console.log(results) // [2, 4, 6]
```

## 约束与边界

- `debounce` 的 `immediate: true` 会立即执行首次调用；窗口内再次调用时，最后一组参数会在窗口结束时执行。`false` 为纯后缘调用。
- `debounce` 返回值没有公开的 `cancel` 或 `flush` 方法。
- `throttle` 在窗口开始执行一次，窗口内调用不会安排尾调用；被抑制的调用返回最近一次执行结果。第三个参数只在目标函数实际执行时收到结果。
- `parallel` 默认尽可能并发；`concurrency` 必须是正整数。返回数组顺序与任务输入顺序一致。
- 任一任务拒绝时 `parallel` 会拒绝；已经开始的任务不会被取消。
- `safeRun` 只捕获函数调用当下的同步异常。函数返回的 Promise 后续拒绝不会被它捕获，应使用 `await` 配合 `try/catch`。
- `sleep` 不提供取消能力。

## 精确类型入口

- [定时控制声明](../../generated/core/optimize/timer.d.ts)
- [并发声明](../../generated/core/optimize/parallel.d.ts)
- [安全执行声明](../../generated/core/optimize/safe.d.ts)
