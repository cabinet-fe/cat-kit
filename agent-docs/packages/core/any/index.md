---
title: "任意值拷贝 copy"
description: "@cat-kit/core 的 copy 深拷贝：structuredClone 优先，Proxy 与不支持环境图遍历回退"
---

# 任意值拷贝 copy

`copy` 用于深拷贝任意值，可替代 `lodash.cloneDeep` 或裸 `structuredClone`，尤其适合需要把 Vue 响应式对象转成普通数据快照的场景。

## 适用场景

深拷贝任意值、替代 `lodash.cloneDeep` 或裸 `structuredClone`，尤其是 Vue 响应式对象需要普通数据快照时。

## 推荐公开 API

`copy`

```ts
import { copy } from '@cat-kit/core'

const snapshot = copy({ a: 1, nested: { b: 2 } })
```

## 约束

- 优先委托 native `structuredClone`；失败、不支持或根对象是 Proxy（Vue 3 响应式也是 Proxy）时图遍历回退，不抛错
- 回退时函数保留同一引用；不保留 class 原型方法
- 产出普通数据快照，不保留 Vue 响应式
- 旧 `o().copy()`（JSON 语义）已移除，不要再调用

## 类型声明

[packages/core/dist/data/any.d.ts](../../../../packages/core/dist/data/any.d.ts)

## 更多

- API：[任意值拷贝 copy API](apis.md)
- 示例：[任意值拷贝 copy 示例](examples.md)
