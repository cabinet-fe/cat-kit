---
title: "arr 与 o 数组对象工具 API"
description: "@cat-kit/core 数组与对象工具 API：union/unionBy/last/eachRight/omitArr 函数与 arr()、o() 链式包装的完整签名、参数约束与可变性说明。"
aliases: [数组工具 API, 对象工具 API, union 去重, 链式包装 API]
keywords: [union, unionBy, last, eachRight, omitArr, arr, o, groupBy, move, pick, omit, merge, deepExtend, extend, 数组去重, 按字段去重, 路径取值]
---

# arr 与 o 数组对象工具 API

`@cat-kit/core` 导出 6 个数组函数（`last`、`union`、`unionBy`、`eachRight`、`omitArr`、`arr`）与 1 个对象入口 `o`。`arr()` 返回 `Arr<T>`、`o()` 返回 `CatObject<O>`；两个包装类本身不可作为命名导入。除注明外，函数均不修改入参数组或对象。

## 快速上手

```ts
import { arr, o, unionBy } from '@cat-kit/core'

const users = unionBy(
  'id',
  [{ id: 1, name: '旧名称' }],
  [{ id: 1, name: '新名称' }, { id: 2, name: '第二位' }]
)
console.log(users[0]!.name) // => '旧名称'（unionBy 保留同字段值的首次出现）

const moved = arr(['a', 'b', 'c']).move(0, 2)
console.log(moved) // => ['b', 'c', 'a']

const cfg = o({ a: 1, b: { c: 2 } })
cfg.set('b.c', 9)
console.log(cfg.get('b.c')) // => 9
```

## API 签名

```ts
/** 返回数组最后一个元素；空数组返回 undefined */
export function last<T extends any[]>(arr: [...T]): Last<T>

/** 合并多个数组并用 Set 去重，保留首次出现 */
export function union<T>(...arrList: T[][]): T[]

/** 合并多个对象数组并按 key 字段去重，保留首次出现；非对象元素原样保留 */
export function unionBy<T extends Record<string, any>>(key: string, ...arrList: T[][]): T[]

/** 从右向左遍历，cb 收到 (元素, 索引, 数组)；不支持提前终止 */
export function eachRight<T>(arr: T[], cb: (v: T, i: number, arr: T[]) => void): void

/** 丢弃指定索引的元素，返回新数组；indexes 为索引或索引数组 */
export function omitArr<T>(arr: T[], indexes: number | number[]): T[]

/** 包装数组为 Arr 实例 */
export function arr<T>(arr: T[]): Arr<T>

/** 包装对象为 CatObject 实例 */
export function o<O extends Record<string, any>>(object: O): CatObject<O>

interface Arr<T> {
  eachRight(cb: (v: T, i: number, arr: T[]) => void): void
  omit(index: number | number[]): T[]
  /** 所有指定字段的值都严格等于 condition 对应值的首个元素 */
  find(condition: Record<string, any>): T | undefined
  get last(): T | undefined
  move(from: number, to: number): T[]
  groupBy<K extends string | number>(cb: (item: T) => K): Record<K, T[]>
}

interface CatObject<O extends Record<string, any>> {
  readonly raw: O
  keys(): string[]
  each(callback: (key: string, value: any) => void): CatObject<O>
  pick<KK extends keyof O>(keys: KK[]): Pick<O, KK>
  omit<KK extends keyof O>(keys: KK[]): Omit<O, KK>
  extend(source: Record<string, any> | Record<string, any>[]): O
  deepExtend(source: Record<string, any> | Record<string, any>[]): O
  merge(source: Record<string, any> | Record<string, any>[]): O
  get<T = any>(prop: string | string[]): T | undefined
  set(prop: string, value: any): Record<string, any>
}
```

## 参数说明

### 函数参数

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `arr`（`last` / `eachRight` / `omitArr` / `arr`） | `T[]` | — | 是 | 不被修改 |
| `arrList`（`union` / `unionBy`） | `T[][]` | — | 是 | 数量不限；`union` 去重按 `Set` 同值语义 |
| `key`（`unionBy`） | `string` | — | 是 | 取 `item[key]` 作去重键；值为 `undefined` 的元素按该值参与去重 |
| `indexes`（`omitArr`） | `number \| number[]` | — | 是 | 索引越界时静默跳过；数组形式长度超过 10 时内部改用 `Set` |
| `cb`（`eachRight`） | `(v, i, arr) => void` | — | 是 | 返回值被忽略，无法提前终止 |

### Arr 方法参数

| 方法 | 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | --- | :---: | --- |
| `omit` | `index` | `number \| number[]` | — | 是 | 同 `omitArr` |
| `find` | `condition` | `Record<string, any>` | — | 是 | 所有键都 `===` 匹配才算命中 |
| `move` | `from` / `to` | `number` | — | 是 | `from` 越界时移动的是 `undefined` 占位元素；`to` 超出末尾时按末尾处理 |
| `groupBy` | `cb` | `(item) => K` | — | 是 | `K` 为 `string \| number`；同名键的元素进入同一数组 |

### CatObject 方法参数

| 方法 | 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | --- | :---: | --- |
| `each` | `callback` | `(key, value) => void` | — | 是 | 含继承的可枚举属性（`for...in` 语义） |
| `pick` / `omit` | `keys` | `(keyof O)[]` | — | 是 | 返回新对象，原对象不变 |
| `extend` / `deepExtend` / `merge` | `source` | `Record<string, any>` 或其数组 | — | 是 | 修改原对象并返回 `raw`；数组形式按顺序逐个应用 |
| `get` | `prop` | `string \| string[]` | — | 是 | 字符串按 `.` 拆分；中间节点为 `null` / `undefined` 时 `console.warn` 并返回 `undefined` |
| `set` | `prop` / `value` | `string` / `any` | — | 是 | 中间节点不存在时创建 `{}`；返回最内层容器对象，不是 `raw` |

## 方法与事件

- `extend(source)`：仅更新目标已存在的键。source 对应值为 `null` / `undefined` 时跳过；目标值为 `null` / `undefined` 时直接赋值；双方 `typeof` 不一致时 `console.warn('xxx类型不一致')` 并跳过。同步、不抛错。
- `deepExtend(source)`：在 `extend` 规则基础上，双方都是普通对象时递归合并；只为已存在的嵌套键更新值，不在嵌套层新增键。同步、不抛错。
- `merge(source)`：目标缺少的键直接新增；双方都是对象时递归合并；类型不一致时直接覆盖；其余覆盖。同步、不抛错。
- `set`：沿 `.` 路径逐层创建缺失的中间对象，在最内层写入 `value`，返回该层对象。
- 以上方法全部同步执行，均不抛出异常。

## 典型示例

### 多表按字段去重合并

```ts
import { unionBy } from '@cat-kit/core'

const local = [{ id: 1, name: '本地' }]
const remote = [{ id: 1, name: '远端' }, { id: 2, name: '新增' }]
const merged = unionBy('id', local, remote)
console.log(merged.map((u) => u.name)) // => ['本地', '新增']
```

### 分组与移动元素

```ts
import { arr } from '@cat-kit/core'

interface Task { done: boolean; title: string }
const tasks: Task[] = [
  { done: true, title: 'a' },
  { done: false, title: 'b' },
  { done: true, title: 'c' }
]

const grouped = arr(tasks).groupBy((t) => (t.done ? 'done' : 'todo'))
console.log(grouped.done.length) // => 2

const first = arr(tasks).find({ done: true })
console.log(first!.title) // => 'a'
```

### 对象合并三件套的差异

```ts
import { o } from '@cat-kit/core'

const base = { a: 1, nested: { x: 1 } }
console.log(o(base).merge({ b: 2 })) // => { a: 1, nested: { x: 1 }, b: 2 }（新增键）

const conf = { host: '', port: 0, nested: { x: 1 } }
o(conf).extend({ host: 'h', extra: 1, port: 'bad' } as any)
// host 被赋为 'h'；extra 不在目标中，跳过；port 类型不一致 console.warn 后跳过

const deep = { nested: { x: 1, y: 2 } }
o(deep).deepExtend({ nested: { y: 9, z: 3 } })
console.log(deep.nested) // => { x: 1, y: 9 }（z 不新增）
```

## 注意事项

> [!WARNING]
> - 本库 `arr()` / `o()` 的方法直接返回数组、对象或值，不是持续链式包装（每步返回的仍是 `Arr` / `CatObject` 之外的原生类型）；这不是 lodash 的 `_.chain`。
> - `extend` / `deepExtend` 只更新目标已有键、跳过 `null` / `undefined` 源值；`merge` 才会新增键。三者都修改并返回原对象，`pick` / `omit` 才返回新对象。
> - `union` 按 `Set` 同值语义去重（对象按引用），对象数组按字段去重必须用 `unionBy`。
> - `o().set` 的返回值是最内层容器对象，不是被包装对象；继续链式调用请用 `o()` 重新包装。
> - `o().get` 在中间节点为空时 `console.warn` 后返回 `undefined`，不抛错。
> - `isEmpty`（string-type 模块）仅指 `null` / `undefined`，空字符串与 `0` 不是空值。
