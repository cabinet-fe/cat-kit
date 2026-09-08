---
title: "copy 深拷贝快照场景"
description: "用 @cat-kit/core 的 copy 在编辑表单、撤销恢复与响应式状态三个场景里生成可写数据快照，原始数据保持只读。"
aliases: [深拷贝场景, 表单快照, 撤销恢复]
keywords: [copy, 深拷贝, 快照, 表单回显, 撤销恢复, structuredClone, 响应式转普通对象, 数据快照, 工作副本]
---

# copy 深拷贝快照场景

用 `@cat-kit/core` 的 `copy` 实现「原始数据只读、工作副本可写」：编辑前拷贝快照、取消时还原、提交时对比差异，全程不引入额外依赖。

## 场景

- 何时用本方案：编辑详情、表单回显、撤销恢复——需要对一段数据「随便改，改坏就还原」。
- 何时不用：只需要浅层字段覆盖时用展开运算符 `{ ...obj }`；嵌套对象要隔离时才需要 `copy`。Vue 组件内把响应式对象传给纯函数前，也用 `copy` 脱掉 Proxy。

## 完整示例

```ts
import { copy } from '@cat-kit/core'

interface Draft {
  id: string
  title: string
  tags: string[]
  meta: { updatedAt: string }
}

// 只读的原始数据（来自接口或 store）
const saved: Draft = {
  id: 'doc_1',
  title: '初稿',
  tags: ['a'],
  meta: { updatedAt: '2024-01-01' }
}

// 编辑前拷贝工作副本；copy 不抛错，无需 try/catch
let working = copy(saved)

// 随便改嵌套字段，原始数据不受影响
working.tags.push('b')
working.meta.updatedAt = '2024-02-02'
console.log(saved.tags.length) // => 1
console.log(saved.meta.updatedAt) // => '2024-01-01'

// 提交：对比工作副本与原始快照是否有变更
const dirty =
  working.title !== saved.title ||
  working.tags.join(',') !== saved.tags.join(',') ||
  working.meta.updatedAt !== saved.meta.updatedAt
console.log(dirty) // => true

// 简易撤销栈：每次编辑前压入干净快照，撤销时弹出
const history: Draft[] = []
function edit(mutate: (draft: Draft) => void) {
  history.push(copy(working)) // 压栈的是快照，不然后续修改会连带污染栈内记录
  mutate(working)
}
function undo() {
  const prev = history.pop()
  if (prev) working = prev
}

edit((draft) => {
  draft.title = '二稿'
})
console.log(working.title) // => '二稿'
undo()
console.log(working.title) // => '初稿'

// 取消编辑：用干净快照整体还原
const discard = copy(saved)
working = discard
console.log(working.tags) // => ['a']

// 含 Date / Map / Set 的数据同样隔离
const rich = {
  at: new Date('2024-01-01'),
  ids: new Set([1]),
  lookup: new Map([['k', { v: 1 }]])
}
const richCopy = copy(rich)
richCopy.at.setFullYear(2025)
richCopy.ids.add(2)
console.log(rich.at.getFullYear()) // => 2024（Date 是新对象）
console.log(rich.ids.size) // => 1（Set 是新对象）
console.log(richCopy.lookup.get('k') === rich.lookup.get('k')) // => false（Map 深拷贝）
```

## 要点说明

- `copy(saved)`：每次还原都要重新拷贝一份干净快照；直接把 `saved` 赋给 `working` 会让两处引用同一对象，编辑即污染原始数据。
- 嵌套隔离：`copy` 对嵌套数组、对象、`Date`、`Map`、`Set`、`Uint8Array` 都生成新对象，`working.tags.push` 不影响 `saved.tags`。
- 撤销栈 `history.push(copy(working))`：入栈必须拷贝当前工作副本；直接压 `working` 引用的话，后续编辑会改掉栈内记录，撤销失效。
- `Date` / `Map` / `Set` / `Uint8Array` 字段由 `copy` 生成新实例：对快照里这些字段的修改不回渗到原对象，可直接用于「改了再比」的流程。
- 对比用序列化字段（`join(',')`）而不是引用比较：`copy` 产生的新数组与原数组引用不同，`===` 恒为 `false`。
- Proxy 输入（Vue 3 `reactive` / `ref` 的 `.value` 为对象时）同样可用 `copy`：得到的是脱掉 Proxy 的普通对象快照。

## 注意事项

> [!WARNING]
> - `copy` 不拷贝函数与 `Promise`：快照里这两个字段与原对象是同一引用，不要在快照上调用并期望行为隔离。
> - class 实例经 `copy` 后是普通对象，方法丢失；需要保留类行为时手动重建实例，而不是依赖 `copy`。
> - 本库是「整树深拷贝」，不是 `Object.assign` / 展开运算符的浅合并：一层展开对嵌套对象只复制引用。
> - 撤销栈深度不受 `copy` 限制：长会话高频编辑时自行限制 `history.length`，弹出超限的旧快照，避免内存膨胀。
