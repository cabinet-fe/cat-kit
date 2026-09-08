---
title: "数组与对象操作场景：表单选项与配置更新"
description: "用 @cat-kit/core 的 unionBy 合并本地远端选项、arr 分组与排序、o 按既定形状更新配置对象，覆盖数组和对象操作的高频组合场景。"
aliases: [数组对象示例, 选项合并场景, 配置更新场景]
keywords: [unionBy, 选项合并, arr, groupBy, move, o, extend, pick, set, 路径取值, 表单选项, 配置回填]
---

# 数组与对象操作场景：表单选项与配置更新

用 `@cat-kit/core` 的 `unionBy`、`arr()`、`o()` 完成「合并本地与远端下拉选项 → 分组渲染 → 拖拽排序 → 按既有配置形状回填用户设置」的组合流程。

## 场景

- 何时用本方案：本地缓存一份选项列表，拉取远端后合并去重；界面需要分组展示与位置调整；用户设置需要按「服务端已有配置」的形状更新，不引入新键。
- 何时不用：只做一次普通数组拼接去重用原生 `Set` 就够；对象键完全未知、需要全量新增键的合并用 `o().merge()` 而不是 `extend`。

## 完整示例

```ts
import { arr, last, o, unionBy } from '@cat-kit/core'

interface Option {
  id: number
  label: string
  group: 'hot' | 'normal'
}

// 本地缓存与远端拉取的选项，按 id 去重合并，本地优先
const localOptions: Option[] = [{ id: 1, label: '本地项', group: 'hot' }]
const remoteOptions: Option[] = [
  { id: 1, label: '远端项', group: 'normal' },
  { id: 2, label: '远端新增', group: 'normal' }
]
const options = unionBy('id', localOptions, remoteOptions)
console.log(options.map((op) => op.label)) // => ['本地项', '远端新增']

// 分组渲染：group 字段作为分组键
const grouped = arr(options).groupBy((op) => op.group)
console.log(Object.keys(grouped)) // => ['hot']

// 用户把第 0 项拖到第 1 项后面：生成新数组，不改动 options
const reordered = arr(options).move(0, 1)
console.log(reordered.map((op) => op.label)) // => ['远端新增', '本地项']

// 回填用户设置：只更新服务端配置已有的键，未知键被忽略
interface ServerConfig {
  theme: string
  pageSize: number
  nested: { compact: boolean }
}
const serverConfig: ServerConfig = {
  theme: 'light',
  pageSize: 20,
  nested: { compact: false }
}
const userInput: Record<string, any> = {
  theme: 'dark',
  hackKey: 'x' // 服务端没有的键，不会被写入
}
o(serverConfig).extend(userInput)
console.log(serverConfig.theme) // => 'dark'
console.log((serverConfig as any).hackKey) // => undefined

// 嵌套对象按形状逐键更新：extend 会把同类型值整体替换，嵌套层用 deepExtend
o(serverConfig).deepExtend({ nested: { compact: true } } as any)
console.log(serverConfig.nested.compact) // => true
console.log(Object.keys(serverConfig.nested)) // => ['compact']（deepExtend 不新增嵌套键）

// 输出给接口前只挑选白名单字段
const payload = o({ theme: serverConfig.theme, pageSize: serverConfig.pageSize, secret: 'x' }).pick([
  'theme',
  'pageSize'
])
console.log(payload) // => { theme: 'dark', pageSize: 20 }

// 删除已卸载的选项：按索引剔除，不改原数组；从右往左遍历做逐项清理
const mounted = arr([0, 1, 2, 3]).omit([1, 3])
console.log(mounted) // => [0, 2]

const cleanupLog: number[] = []
arr([10, 20, 30]).eachRight((v) => cleanupLog.push(v)) // 自右向左：30、20、10
console.log(cleanupLog) // => [30, 20, 10]

// 读取最后一项作为「最近选项」
const lastOption = last(options)
console.log(lastOption!.label) // => '远端新增'
```

## 要点说明

- `unionBy('id', local, remote)`：同 `id` 保留首次出现（本地在前即本地优先）；非对象元素原样保留，不会报错。
- `arr().groupBy((op) => op.group)`：返回 `Record<分组键, 元素数组>`；回调返回 `'hot'` / `'normal'` 这类字符串或数字。
- `arr().move(0, 1)`：返回新数组；`options` 保持原顺序，撤销操作只需丢弃 `reordered`。
- `o(serverConfig).extend(userInput)`：仅更新目标已有键，`userInput` 多出的键被忽略，防止任意键写入；值为 `null` / `undefined` 的源字段被跳过，保留原值。
- `nested` 层：`extend` 遇到同为对象的值会整体替换，不做递归合并；嵌套层按形状更新用 `deepExtend`（同样不新增嵌套键）。
- `o().pick(['theme', 'pageSize'])`：返回新对象，输出白名单字段，避免把内部字段带给接口；`o().omit(keys)` 是反向操作，同样返回新对象。
- `arr().omit([1, 3])`：按索引丢弃并返回新数组；`eachRight` 自右向左遍历，适合「从尾部开始删」的清理逻辑。
- `last(options)`：读取尾元素；空数组返回 `undefined`，调用方自行判空。

## 注意事项

> [!WARNING]
> - `extend` / `deepExtend` / `merge` 会修改并返回原对象；需要保留原值时先 `copy`（见 `packages/core/any/apis.md`）再操作。
> - `deepExtend` 不在嵌套层新增键：目标没有的嵌套字段被丢弃；需要新增嵌套键用 `merge`。
> - `o().set('a.b', v)` 沿路径创建缺失的中间对象，并返回最内层容器；不要把返回值当被包装对象继续调用。
> - `arr().find({ done: true })` 是按字段相等查询；回调式查找请直接用数组原生 `find`。
> - `union` 对对象数组按引用去重：两次构建的字面量对象即使字段全等也会都保留；对象数组必须用 `unionBy`。
