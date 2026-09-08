---
title: "copy 深拷贝模块"
description: "@cat-kit/core 的 any 模块：copy 深拷贝任意值，structuredClone 优先，Proxy（Vue 响应式）与克隆异常时图遍历回退，循环引用安全。"
aliases: [深拷贝模块, clone 模块, any 模块]
keywords: [copy, 深拷贝, structuredClone, 结构化克隆, 循环引用, Proxy, Vue 响应式, 快照]
---

# copy 深拷贝模块

`any` 模块从 `@cat-kit/core` 导出唯一函数 `copy`：深拷贝任意值并返回同类型快照，优先使用原生 `structuredClone`，输入是 Proxy（Vue 3 响应式对象也是 Proxy）或结构化克隆抛错时回退到内置图遍历拷贝，全程不向外抛错。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

`copy` 从包根导入：

```ts
import { copy } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `copy` | 深拷贝任意值，返回同类型快照，不抛错 | `packages/core/any/apis.md` |

模块内其余符号（`cloneGraph`、`keepIdentity` 等）均为源码内部实现，未导出。深拷贝在完整业务流程中的组合用法见包级 [../examples.md](../examples.md)。
