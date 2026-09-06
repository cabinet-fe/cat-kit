---
title: "可观察状态 Observable"
description: "@cat-kit/core 的 Observable：普通对象浅层属性订阅，微任务批量回调"
keywords:
  - Observable
  - 浅层属性订阅
  - observe
  - 状态同步
  - 微任务批量回调
  - 属性变化监听
aliases:
  - observer 模式
  - 发布订阅
  - pub/sub
  - watch 属性变化
  - 轻量状态管理
---

# 可观察状态 Observable

`Observable` 对普通对象做浅层属性订阅：监听指定顶层属性的变化并在回调中拿到新值，适合不引入响应式框架的轻量状态同步场景。

## 适用场景

对普通对象做浅层属性订阅（非深层 Proxy 框架）。

## 推荐 API

`Observable`

```ts
import { Observable } from '@cat-kit/core'

const store = new Observable({ count: 0 })
const stop = store.observe(['count'], ([count]) => console.log(count))
store.state.count = 1
stop()
```

## 注意事项

- 仅观察顶层赋值
- 默认回调进微任务；`sync: true` 同步执行
- 回调参数为被观察属性值的位置元组
- `immediate` 同步触发一次，且不消耗 `once`

## 更多

- API：[可观察状态 Observable API](apis.md)
