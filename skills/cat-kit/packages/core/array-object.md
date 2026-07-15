# core — 数组与对象

## 何时使用

- 多个数组合并去重、按字段去重、读取尾元素、删除指定索引或从右遍历。
- 对现有对象挑选/忽略字段，或按既定对象形状更新配置。

## 推荐公开 API

- 数组函数：`union`、`unionBy`、`last`、`eachRight`、`omitArr`。
- `arr(value)`：提供 `eachRight`、`omit`、`find`、`last`、`move`、`groupBy`。
- `o(value)`：提供 `keys`、`each`、`pick`、`omit`、`extend`、`deepExtend`、`copy`、`merge`、`get`、`set`。

仅需尾元素且不依赖元组尾项类型推断时，也可直接使用原生 `array.at(-1)`；仅需简单数组去重时，原生 `Set` 同样合适。

## 最小示例

```ts
import { o, unionBy } from '@cat-kit/core'

const users = unionBy(
  'id',
  [{ id: 1, name: '旧名称' }],
  [
    { id: 1, name: '新名称' },
    { id: 2, name: '第二位' }
  ]
)

const publicUser = o(users[0]!).pick(['id', 'name'])
console.log(publicUser)
```

`unionBy` 保留同一字段值首次出现的对象，因此示例中的 `id: 1` 使用“旧名称”。

## 约束与边界

- `union` 会合并并去重；对象只按引用判断，不做深比较。
- `arr()` 不是持续链式流水线：`omit`、`move`、`groupBy` 等方法直接返回数组或对象。
- `o().pick`、`omit` 和 `copy` 返回新对象；`extend`、`deepExtend`、`merge`、`set` 会修改传入的原对象。
- `extend` 与 `deepExtend` 只更新目标中已有的键，并忽略 `null`、`undefined`；`merge` 可以增加新键。
- `copy` 使用 JSON 可表示的数据语义，不适合函数、循环引用或需要保留原型的值。
- `o().get` 读取不到路径时返回 `undefined`；`isEmpty` 的“空”仅指 `null` 或 `undefined`。

## 精确类型入口

- [数组声明](../../generated/core/data/array.d.ts)
- [对象声明](../../generated/core/data/object.d.ts)
