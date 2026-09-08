---
title: "数组与对象操作模块（arr / o）"
description: "@cat-kit/core 的 array-object 模块：数组合并去重、尾元素、右遍历、索引剔除与链式操作 arr()，对象挑选、忽略、合并、路径取值赋值与链式操作 o()。"
aliases: [数组工具模块, 对象工具模块, array object 模块]
keywords: [arr, o, union, unionBy, last, eachRight, omitArr, 数组去重, 对象合并, 链式操作, pick, omit, merge, deepExtend]
---

# 数组与对象操作模块（arr / o）

`array-object` 模块从 `@cat-kit/core` 导出数组工具 `last` / `union` / `unionBy` / `eachRight` / `omitArr` 与链式入口 `arr()`、对象链式入口 `o()`：覆盖多数组合并去重、按字段去重、尾元素读取、自右向左遍历、按索引剔除、元素移动、分组，以及对象挑选/忽略字段、浅层与深度合并、链式路径取值赋值。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

全部函数从包根导入：

```ts
import { arr, eachRight, last, o, omitArr, union, unionBy } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `last` | 返回数组最后一个元素 | `packages/core/array-object/apis.md` |
| `union` | 合并多个数组并用 `Set` 去重 | `packages/core/array-object/apis.md` |
| `unionBy` | 合并多个对象数组并按指定字段去重，保留首次出现 | `packages/core/array-object/apis.md` |
| `eachRight` | 从右向左遍历数组 | `packages/core/array-object/apis.md` |
| `omitArr` | 丢弃数组中指定索引的元素，不改原数组 | `packages/core/array-object/apis.md` |
| `arr` | 包装数组为 `Arr`：`eachRight`、`omit`、`find`、`last`、`move`、`groupBy` | `packages/core/array-object/apis.md` |
| `o` | 包装对象为 `CatObject`：`keys`、`each`、`pick`、`omit`、`extend`、`deepExtend`、`merge`、`get`、`set` | `packages/core/array-object/apis.md` |

`Arr` 与 `CatObject` 类本身未导出，仅能通过 `arr()` / `o()` 获得。与字符串、类型守卫相关的工具见 `packages/core/string-type/index.md`。
