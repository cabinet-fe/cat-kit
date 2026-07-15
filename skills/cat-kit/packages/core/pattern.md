# core — 可观察状态

## 何时使用

需要观察普通对象顶层属性赋值，并以很小的 API 管理订阅时使用 `Observable`。需要深层响应式、派生状态或框架级事务时，优先使用宿主框架的状态方案。

## 推荐公开 API

- `new Observable(initialState)`：创建状态容器。
- `.state`、`.getState()`：读取状态；给 `.state` 顶层属性赋值会触发订阅。
- `.observe(props, callback, options?)`：订阅属性并返回取消函数。
- `.setState(partial)`：更新一个或多个顶层属性。
- `.unobserve(props)`、`.destroyAll()`：移除订阅。
- 选项：`immediate` 立即调用，`once` 首次变化后移除，`sync` 同步通知。

## 最小示例

```ts
import { Observable } from '@cat-kit/core'

const store = new Observable({ count: 0, loading: false })

const stop = store.observe(['count', 'loading'], ([count, loading]) => {
  console.log(count, loading)
})

store.state.count = 1
stop()
```

## 约束与边界

- 回调参数是按 `props` 顺序排列的值元组，不是以属性名为键的对象。
- 默认通知异步发生；`sync: true` 才在赋值过程中同步调用。
- 只观察顶层属性赋值。直接修改嵌套对象内部字段不会触发顶层属性订阅，除非重新赋值该顶层属性。
- 新旧值严格相等时不触发。
- `setState` 对每个发生变化的属性分别触发；同时订阅多个被更新属性时，同一回调可能执行多次，不承诺批量去重。
- `immediate` 在注册时直接调用一次；`once` 控制的是首次后续变化，不会因这次立即调用自动取消。
- 调用返回的取消函数最安全；`unobserve(props)` 不传具体 handler 时会移除这些属性上的所有订阅。
- `destroyAll` 会清空订阅和尚未执行的异步通知。

## 精确类型入口

[可观察状态声明](../../generated/core/pattern/observer.d.ts)
