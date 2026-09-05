---
title: "数组与对象工具"
description: "@cat-kit/core 数组去重合并、尾元素、右遍历、索引剔除与对象挑选/忽略/深浅合并/取值赋值"
---

# 数组与对象工具

`@cat-kit/core` 的数组与对象工具覆盖多数组合并去重、按字段去重、尾元素读取、自右向左遍历、索引剔除，以及对象的挑选/忽略字段、深浅合并与按路径取值赋值。函数式入口为 `union`、`unionBy`、`last`、`eachRight`、`omitArr`，链式入口为 `arr()` 与 `o()`。

## 适用场景

- 多数组合并去重、按字段去重、读尾元素、删索引或从右遍历
- 对对象挑选/忽略字段，或按既定形状更新配置

## 推荐公开 API

- 函数：`union`、`unionBy`、`last`、`eachRight`、`omitArr`
- `arr(value)`：`eachRight`、`omit`、`find`、`last`、`move`、`groupBy`
- `o(value)`：`keys`、`each`、`pick`、`omit`、`extend`、`deepExtend`、`merge`、`get`、`set`

仅需尾元素且不依赖元组尾项推断时可用原生 `array.at(-1)`；简单去重可用 `Set`。

## 约束

- `union` 按引用/`Set` 去重；`unionBy` 保留同 key 首次出现
- `arr()` 非持续链式：方法直接返回数组或对象
- `pick`/`omit` 返回新对象；`extend`/`deepExtend`/`merge`/`set` 修改原对象
- `extend`/`deepExtend` 只更新目标已有键，忽略 `null`/`undefined`；`merge` 可增键
- `o().get` 找不到返回 `undefined`；`isEmpty` 仅指 `null`/`undefined`（见 string-type）

## 类型声明

- [packages/core/dist/data/array.d.ts](../../../../packages/core/dist/data/array.d.ts)
- [packages/core/dist/data/object.d.ts](../../../../packages/core/dist/data/object.d.ts)

## 更多

- API：[数组与对象工具 API](apis.md)
- 示例：[数组与对象工具示例](examples.md)
