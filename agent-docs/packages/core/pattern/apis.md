---
title: "可观察状态 Observable API"
description: "@cat-kit/core Observable 类完整签名与 ObserveOptions 选项"
---

# 可观察状态 Observable API

本篇列出 `Observable` 的完整类签名与订阅选项 `ObserveOptions`，以及 `PropHandler` 等类型导出。

```ts
interface ObserveOptions {
  immediate?: boolean
  once?: boolean
  sync?: boolean
}

declare class Observable<S extends object, K extends keyof S = keyof S> {
  readonly state: S
  constructor(data: S)
  trigger(prop: string | symbol): void
  observe<const P extends K[]>(
    props: P,
    callback: (values: { [key in keyof P]: S[P[key]] }) => void,
    options?: ObserveOptions
  ): () => void
  getState(): S
  setState(state: Partial<S>): Observable<S, K>
  unobserveHandler(handler: PropHandler): void
  unobserve<const P extends K[]>(props: P, handler?: PropHandler): void
  destroyAll(): void
}
```

类型导出：`ObserveOptions`、`PropHandler`。

完整声明：[packages/core/dist/pattern/observer.d.ts](../../../../packages/core/dist/pattern/observer.d.ts)
