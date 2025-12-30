import { o } from '../data'

type Callback<Node extends TreeNode<any>> = (
  node: Node,
  index: number,
  parent?: Node
) => void | boolean

function dfs<Data extends Record<string, any>>(
  data: Data,
  cb: (item: Data, index: number, parent?: Data) => boolean | void,
  childrenKey = 'children',
  index = 0,
  parent?: Data
): boolean | void {
  const result = cb(data, index, parent)
  if (result === false) return result
  const children = o(data).get(childrenKey)
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const result = dfs(child, cb, childrenKey, i, data)
      if (result === false) return result
    }
  }
}

function bfs<Data extends Record<string, any>>(
  data: Data,
  callback: (item: Data, index: number, parent?: Data) => boolean | void,
  childrenKey = 'children'
): boolean | void {
  // 用 head 指针模拟队列，避免 Array#shift 带来的 O(n^2) 退化
  const queue: Array<{ item: Data; index: number; parent?: Data }> = [
    { item: data, index: 0 }
  ]
  let head = 0

  while (head < queue.length) {
    const { item, index, parent } = queue[head++]!
    const result = callback(item, index, parent)
    if (result === false) return result
    const children = o(item).get(childrenKey)
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        queue.push({ item: children[i]!, index: i, parent: item })
      }
    }
  }
}

export class TreeNode<T extends Record<string, any> = Record<string, any>> {
  /** 父节点 */
  parent?: this
  /** 子节点 */
  children?: this[]
  /** 在树中的深度 */
  depth = 0
  /** 是否叶子节点 */
  isLeaf = false
  /** 在树中的索引 */
  index: number = 0

  constructor(public data: T) {}

  dfs(cb: Callback<this>): boolean | void {
    return dfs(this, cb)
  }

  bfs(cb: Callback<this>): boolean | void {
    return bfs(this, cb)
  }

  /** 移除当前节点 */
  remove(): void {
    const parent = this.parent
    if (!parent?.children?.length) return

    // index 可能因外部对 children 的插入/排序而过期；这里做一次兜底校验
    let index = this.index
    if (parent.children[index] !== this) {
      index = parent.children.indexOf(this)
      if (index === -1) return
    }

    parent.children.splice(index, 1)
    for (let i = index; i < parent.children.length; i++) {
      parent.children[i]!.index = i
    }
    parent.isLeaf = parent.children.length === 0
    this.parent = undefined
  }
}

export function createNode<
  Data extends Record<string, any>,
  Node extends TreeNode<Data>
>(options: {
  data: Data
  getNode: (data: Data) => Node
  childrenKey: string
  index?: number
  parent?: Node
}): Node {
  const { data, getNode, childrenKey, parent, index = 0 } = options
  const node = getNode(data)
  node.index = index
  node.parent = parent
  node.depth = parent ? parent.depth + 1 : 0

  const childrenData = o(data).get(childrenKey) as unknown
  if (Array.isArray(childrenData) && childrenData.length) {
    node.children = []
    for (let i = 0; i < childrenData.length; i++) {
      const childData = childrenData[i] as Data
      const child = createNode({
        data: childData,
        getNode,
        childrenKey,
        parent: node,
        index: i
      })
      node.children.push(child)
    }
  }
  node.isLeaf = !node.children?.length
  return node
}

export interface TreeOptions<
  Data extends Record<string, any>,
  Node extends TreeNode<Data>
> {
  data: Data
  TreeNode: new (data: Data) => Node
  childrenKey?: string
}

export class Tree<
  Data extends Record<string, any>,
  Node extends TreeNode<Data>
> {
  readonly root: Node

  constructor(options: TreeOptions<Data, Node>) {
    const { data, TreeNode: TreeNodeCtor, childrenKey = 'children' } = options

    this.root = createNode({
      data,
      childrenKey,
      getNode: (data: Data) => {
        return new TreeNodeCtor(data)
      }
    })
  }

  dfs(cb: Callback<Node>): boolean | void {
    return this.root.dfs(cb)
  }

  bfs(cb: Callback<Node>): boolean | void {
    return this.root.bfs(cb)
  }

  /**
   * 查找第一个满足条件的节点
   * @param predicate 条件
   * @returns 满足条件的节点或 null
   */
  find(predicate: (node: Node) => boolean): Node | null {
    let result: Node | null = null

    this.root.bfs(node => {
      if (predicate(node)) {
        result = node
        return false
      }
    })

    return result
  }

  /**
   * 查找所有满足条件的节点
   * @param predicate 条件
   * @returns 满足条件的节点数组
   */
  findAll(predicate: (node: Node) => boolean): Node[] {
    const result: Node[] = []

    this.root.dfs(node => {
      if (predicate(node)) {
        result.push(node)
      }
    })

    return result
  }
}
