---
title: "任意值拷贝 copy API"
description: "@cat-kit/core 的 copy 函数签名与完整类型定义"
keywords:
  - 深拷贝
  - 浅拷贝对比
  - 结构化克隆
  - structuredClone
  - 响应式快照
  - 循环引用
  - 函数引用保持
aliases:
  - cloneDeep
  - lodash.cloneDeep
  - structuredClone 替代
  - 拷贝对象
---

# 任意值拷贝 copy API

`copy` 是 `@cat-kit/core` 提供的唯一深拷贝入口，从包根导入，对任意输入值返回深拷贝快照。

## API 签名

```ts
/**
 * 深拷贝任意值。
 *
 * 优先 native `structuredClone`。Proxy（Vue 3 响应式也是 Proxy）不能结构化克隆：
 * 能探测到则直接图遍历，否则捕获抛错再回退。不向外抛错。
 *
 * @param value 任意值
 * @returns 拷贝后的快照（原始值与函数原样返回）
 */
declare function copy<T>(value: T): T
```
