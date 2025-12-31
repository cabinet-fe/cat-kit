type Obj = object

type Callback<Node extends Obj> = (
  node: Node,
  index: number,
  parent?: Node
) => void | boolean

export function dfs<T extends Obj>(
  data: T,
  cb: Callback<T>,
  childrenKey = 'children'
): boolean | void {
  const nodeStack: T[] = [data]
  const indexStack: number[] = [0]
  const parentStack: Array<T | undefined> = [undefined]

  let sp = 1
  while (sp) {
    sp--
    const node = nodeStack[sp]!
    const index = indexStack[sp]!
    const parent = parentStack[sp]

    const result = cb(node, index, parent)
    if (result === true) return true

    const children = node[childrenKey]
    if (Array.isArray(children)) {
      // 倒序压栈，保证弹栈访问顺序与递归版一致（0 -> n-1）
      for (let i = children.length - 1; i >= 0; i--) {
        nodeStack[sp] = children[i] as T
        indexStack[sp] = i
        parentStack[sp] = node
        sp++
      }
    }
  }
}

export function bfs<T extends Record<string, any>>(
  data: T,
  callback: (item: T, index: number, parent?: T) => boolean | void,
  childrenKey = 'children'
): boolean | void {
  // 用 head 指针模拟队列，避免 Array#shift 带来的 O(n^2) 退化
  const queue: Array<{ item: T; index: number; parent?: T }> = [
    { item: data, index: 0 }
  ]
  let head = 0

  while (head < queue.length) {
    const { item, index, parent } = queue[head++]!
    const result = callback(item, index, parent)
    if (result === false) return result
    const children = item[childrenKey]
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

  const childrenData = data[childrenKey] as unknown
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

export interface TreeManagerOptions<
  T extends Record<string, any>,
  Node extends Record<string, any>
> {
  childrenKey?: string
  createNode?: (data: T) => Node
}
export class TreeManager<
  T extends Record<string, any>,
  Node extends Record<string, any> = T
> {
  protected _root: Node

  get root(): Node {
    return this._root
  }

  protected createNode?: (data: T) => Node
  protected childrenKey = 'children'

  constructor(data: T, options?: TreeManagerOptions<T, Node>) {
    if (options) {
      if (options.childrenKey) {
        this.childrenKey = options.childrenKey
      }
      if (options.createNode) {
        this.createNode = options.createNode
      }
    }

    if (!this.createNode) {
      this._root = data as unknown as Node
    } else {
      this._root = this.buildTree(data)
    }
  }

  protected buildTree(data: T): Node {
    const createNode = this.createNode
    if (!createNode) {
      // 构造函数已兜底；这里再做一次保护，避免未来重构引入隐蔽 bug
      return data as unknown as Node
    }

    const childrenKey = this.childrenKey
    const root = createNode(data)

    // 采用显式栈，避免递归（深树会导致调用栈溢出）
    const dataStack: T[] = [data]
    const nodeStack: Node[] = [root]

    while (dataStack.length) {
      const curData = dataStack.pop()!
      const curNode = nodeStack.pop()!

      const childrenData = curData[childrenKey] as unknown
      if (Array.isArray(childrenData) && childrenData.length) {
        const childrenNodes = new Array(childrenData.length) as Node[]
        ;(curNode as Record<string, unknown>)[childrenKey] = childrenNodes

        // 倒序创建并压栈，保证遍历顺序与数组顺序一致
        for (let i = childrenData.length - 1; i >= 0; i--) {
          const childData = childrenData[i] as T
          const childNode = createNode(childData)
          childrenNodes[i] = childNode

          dataStack.push(childData)
          nodeStack.push(childNode)
        }
      }
    }

    return root
  }
}
