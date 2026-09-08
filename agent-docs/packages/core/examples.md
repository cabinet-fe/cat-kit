---
title: "@cat-kit/core 组合应用场景"
description: 用 @cat-kit/core 的多个模块组合完成一个端到端任务：对接口返回的部门树做快照、schema 校验、树扁平化、高精度预算汇总与统计周期生成。
aliases: [组合示例, 端到端示例, 使用示例, 跨模块用法]
keywords: [copy, object, vString, vNumber, vArray, optional, TreeManager, flatten, $n, plus, date, addDays, format, 部门树, 预算汇总, schema 校验, 树扁平化]
---

# @cat-kit/core 组合应用场景

用 `@cat-kit/core` 的 `copy`、`object` / `vString` / `vNumber` / `vArray` / `optional`、`TreeManager`、`$n` 与 `date` 组合，完成「接口返回部门树 → 数据快照 → schema 校验 → 树扁平化 → 高精度预算汇总 → 生成统计周期」的端到端流程。

## 场景

- 何时用本方案：一段输入数据要经过「拷贝隔离 → 结构校验 → 树形展平 → 汇总计算 → 生成时间区间」多个步骤，且每步都要求不污染原始数据、浮点求和无精度误差。
- 何时不用：只用到单一模块时，直接读对应模块文档——树结构见 `packages/core/data-structure/apis.md`，校验见 `packages/core/transform-validation/apis.md`，数值见 `packages/core/number/apis.md`，日期见 `packages/core/date/apis.md`，深拷贝见 `packages/core/any/apis.md`。

## 完整示例

```ts
import {
  $n,
  TreeManager,
  copy,
  date,
  object,
  optional,
  vArray,
  vNumber,
  vString
} from '@cat-kit/core'

type DeptRaw = {
  id: string
  name: string
  budget: number
  children?: DeptRaw[]
}

// 1. 模拟接口返回的原始响应（只读数据源，先拷贝出可写快照）
const raw = {
  id: 'd0',
  name: '总部',
  budget: 100.1,
  children: [
    { id: 'd1', name: '研发部', budget: 0.2 },
    { id: 'd2', name: '市场部', budget: 19.9, children: [] }
  ]
}
const snapshot = copy(raw) as DeptRaw

// 2. schema 校验：name 与 children 里的 name 必填，remark 可选带缺省
const deptSchema = object({
  id: vString(),
  name: vString(),
  budget: vNumber(),
  remark: optional(vString(), { default: '无' })
})

const check = deptSchema.safeParse(snapshot)
if (!check.success) {
  throw new Error(`数据不合法: ${check.issues.map((i) => `${i.path} ${i.message}`).join('; ')}`)
}

// 3. 树扁平化：按深度优先顺序拿到全部节点，直接读取原始字段
const tree = new TreeManager<DeptRaw>(snapshot)
const flat = tree.flatten()
console.log(flat.map((n) => n.name)) // => ['总部', '研发部', '市场部']

// 4. 预算汇总：$n.plus 基于 Decimal，规避 100.1 + 0.2 + 19.9 的浮点误差
const total = $n.plus(...flat.map((n) => n.budget))
console.log(total) // => 120.2

// 5. 生成统计周期：今天起 7 天，逐日 yyyy-MM-dd
const days: string[] = []
const today = date()
for (let i = 0; i < 7; i++) {
  days.push(today.addDays(i).format('yyyy-MM-dd'))
}
console.log(days[0] === today.format('yyyy-MM-dd')) // => true

// 6. 汇总结果与快照互不影响
snapshot.children![0]!.budget = 999
console.log(raw.children![0]!.budget) // => 0.2（原始响应未被改动）
```

整段脚本可直接用 `bun run` 或在 Node.js ESM 项目中执行；`parallel` 等执行控制工具与本场景的正交用法见 `packages/core/optimize/apis.md`。

## 要点说明

- `copy(raw)`：接口响应保持只读，先拷贝出可写快照再修改；`copy` 对普通对象返回全新的深拷贝，不向外抛错。
- `deptSchema.safeParse(snapshot)`：失败不抛错，`issues` 的 `path` 形如 `children.0.name`；成功时 `data` 是已填充缺省值的新对象。
- `new TreeManager<DeptRaw>(snapshot)`：不传 `createNode` 时节点就是原始数据对象本身，`flatten()` 返回按深度优先顺序的节点数组，可直接读取 `name` / `budget` 字段。
- `$n.plus(...budgets)`：参数支持 `string`；汇总金额来自接口时用 `$n.plus` 而非 `+`，否则 `100.1 + 0.2 + 19.9` 会得到 `120.19999999999999`。
- `today.addDays(i)`：`addDays` 返回新的 `Dater` 实例，不修改 `today`，循环内可重复基于同一起点推算。

## 注意事项

> [!WARNING]
> - 本包只从包根 `@cat-kit/core` 导入，禁止 `@cat-kit/core/src/...` 或相对 `src` 路径。
> - `TreeManager` 不传 `createNode` 时节点上没有 `depth` / `index` 元数据，`getMaxDepth()` 返回 `0`；需要元数据时用 `createNode`，见 `packages/core/data-structure/apis.md`。
> - `optional` 仅把 `undefined` 视为缺省；字段为 `null` 时校验失败，不是取缺省值。
> - `$n.plus` / `$n.mul` 的返回值仍是 JS `number`；超过 `Number.MAX_SAFE_INTEGER` 的精度由入参 `string` 形式保护，结果展示用 `n(x).fixed()` 转字符串。
