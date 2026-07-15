# @cat-kit/core 示例

仅在任务需要组合多个主题时读取；单一能力优先回到对应主题文档。

## 解析并校验查询参数

```ts
import { object, query2obj, vArray, vNumber, vString } from '@cat-kit/core'

const searchSchema = object({
  page: vNumber(),
  keyword: vString(),
  tags: vArray(vString())
})

const input = query2obj('?page=2&keyword=%22cat%22&tags=%5B%22tool%22%5D')
const search = searchSchema.parse(input)
console.log(search)
```

这里要求查询串遵循 `obj2query` / `query2obj` 的 JSON 值约定；普通表单查询串不一定能通过该 schema。

## 扁平化树后限并发加载

```ts
import { TreeManager, parallel } from '@cat-kit/core'

const tree = new TreeManager({
  id: 'root',
  children: [{ id: 'a' }, { id: 'b' }]
})

const tasks = tree
  .flatten((node) => node.id !== 'root')
  .map((node) => async () => ({ id: node.id, loaded: true }))

const nodes = await parallel(tasks, { concurrency: 2 })
console.log(nodes)
```

结果顺序与扁平化后的节点顺序一致；任一任务拒绝时整体拒绝，已开始的任务不会自动中断。
