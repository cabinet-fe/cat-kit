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
  const queue = [data]

  while (queue.length) {
    const item = queue.shift()!
    const index = queue.length
    const result = callback(item, index)
    if (result === false) return result
    const children = o(item).get(childrenKey)
    if (Array.isArray(children)) {
      children.forEach(child => queue.push(child))
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
  index: number

  constructor(public data: T) {}

  dfs(cb: Callback<this>): boolean | void {
    return dfs(this, cb)
  }

  bfs(cb: Callback<this>): boolean | void {
    return bfs(this, cb)
  }

  /** 移除当前节点 */
  remove() {
    const { parent, index } = this
    if (!parent) return
    const children = parent.children!
    children.splice(index, 1)
    for (let i = index; i < children.length; i++) {
      children[i]!.index = i
    }
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
  if (parent) {
    node.parent = parent
    parent.children?.push(node)
  }
  const childrenData = o(data).get(childrenKey)
  if (Array.isArray(childrenData) && childrenData.length) {
    const nodes = childrenData.map((data, index) => {
      return createNode({ data, getNode, childrenKey, parent: node, index })
    })
    node.children = nodes
  }
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
    const { data, TreeNode, childrenKey = 'children' } = options

    this.root = createNode({
      data,
      childrenKey,
      getNode: (data: Data) => {
        return new TreeNode(data)
      }
    })
  }

  dfs(cb: Callback<Node>) {
    this.root.dfs(cb)
  }

  bfs(cb: Callback<Node>) {
    this.root.bfs(cb)
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
