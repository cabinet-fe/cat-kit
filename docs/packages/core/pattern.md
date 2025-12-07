# 设计模式

当前提供观察者模式实现 `Observable`，用于轻量级可观察状态。

## 快速上手

```ts
import { Observable } from '@cat-kit/core'

const counter = new Observable({ count: 0 })
const stop = counter.observe(['count'], ([c]) => console.log('count:', c))

counter.state.count = 1 // 触发
stop() // 取消观察
```

## 常用能力

- 观察：`observe(keys, cb, options?)`，返回取消函数；`options` 支持 `immediate`、`sync`、`once`。
- 状态：`state` 为可变代理；`getState()` 返回浅拷贝。
- 更新：`setState(partial)` 批量更新；`trigger(key)` 手动触发。
- 清理：`destroyAll()` 一次性移除全部观察者。

## 后端示例：任务队列状态

```ts
import { Observable } from '@cat-kit/core'

type QueueState = {
  pending: number
  running: number
  failed: number
}

const queue = new Observable<QueueState, keyof QueueState>({
  pending: 0,
  running: 0,
  failed: 0
})

// 记录状态变更，写入日志/指标
const stop = queue.observe(['pending', 'running', 'failed'], ([p, r, f]) => {
  console.log(`[queue] pending=${p} running=${r} failed=${f}`)
})

// 更新状态
queue.setState({ pending: 5, running: 2 })
queue.state.failed += 1 // 手动修改也会触发

stop()
queue.destroyAll()
```

## 小贴士

- 只订阅必要字段，避免过度观察。
- 有生命周期的场景记得调用取消函数或 `destroyAll()`。
- 批量修改优先用 `setState`，减少重复触发。
- `sync` 会阻塞主线程，仅在需要严格时序时启用。

