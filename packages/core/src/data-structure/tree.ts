type Obj = Record<string, unknown>

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

export function bfs<T extends Obj>(
  data: T,
  cb: Callback<T>,
  childrenKey = 'children'
): boolean | void {
  // 三个独立数组代替对象数组，避免对象创建和解构的 GC 开销
  const nodeQueue: T[] = [data]
  const indexQueue: number[] = [0]
  const parentQueue: Array<T | undefined> = [undefined]

  // head: 出队指针，tail: 入队指针
  let head = 0
  let tail = 1

  while (head < tail) {
    const node = nodeQueue[head]!
    const index = indexQueue[head]!
    const parent = parentQueue[head]
    head++

    const result = cb(node, index, parent)
    if (result === false) return result

    const children = node[childrenKey]
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        nodeQueue[tail] = children[i] as T
        indexQueue[tail] = i
        parentQueue[tail] = node
        tail++
      }
    }
  }
}

export interface ITreeNode<T extends Obj = Obj> {
  data?: T
  depth: number
  index: number
  isLeaf: boolean
  parent?: this
  children?: this[]
  [key: string]: any
}

export class TreeNode<
  T extends Obj = Obj,
  Self extends TreeNode<T, Self> = TreeNode<T, any>
> {
  data: T
  /** 父节点 */
  parent?: Self
  /** 子节点 */
  children?: this[]
  /**
   * 在树中的深度，从零开始
   */
  depth: number
  /** 是否叶子节点 */
  isLeaf = false
  /** 在树中的索引 */
  index: number

  constructor(data: T, index: number, depth: number, parent?: Self) {
    this.data = data
    this.index = index
    this.depth = depth
    if (parent) {
      this.parent = parent
    }
  }

  /** 移除当前节点 */
  remove(): void {
    const parent = this.parent
    if (!parent?.children?.length) return

    const { index } = this

    parent.children.splice(index, 1)
    for (let i = index; i < parent.children.length; i++) {
      parent.children[i]!.index = i
    }
    parent.isLeaf = parent.children.length === 0
    this.parent = undefined
  }

  /**
   * 插入子节点
   * @param node - 要插入的节点
   * @param index - 插入位置，默认追加到末尾
   */
  insert(node: this, index?: number): void {
    if (!this.children) {
      this.children = []
    }

    const insertIndex = index ?? this.children.length
    const clampedIndex = Math.min(insertIndex, this.children.length)

    this.children.splice(clampedIndex, 0, node)

    // 更新插入位置及之后节点的 index
    for (let i = clampedIndex; i < this.children.length; i++) {
      this.children[i]!.index = i
    }

    node.parent = this as unknown as Self
    node.depth = this.depth + 1
    this.isLeaf = false
  }
}

export type NodeCreator<T extends Obj, Node extends Obj = T> = (
  data: T,
  index: number,
  depth: number,
  parent?: Node
) => Node

export interface TreeManagerOptions<T extends Obj, Node extends Obj> {
  childrenKey?: string
  createNode?: NodeCreator<T, Node>
}
export class TreeManager<T extends Obj, Node extends Obj = T> {
  protected _root: Node

  get root(): Node {
    return this._root
  }

  protected createNode?: NodeCreator<T, Node>
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

  private buildTree(data: T): Node {
    const { createNode, childrenKey } = this
    if (!createNode) {
      return data as unknown as Node
    }

    const root = createNode(data, 0, 0)

    // 显式栈 + 栈指针，避免 push/pop 开销
    const dataStack: T[] = [data]
    const nodeStack: Node[] = [root]
    let sp = 1

    while (sp) {
      sp--
      const curData = dataStack[sp]!
      const curNode = nodeStack[sp]!

      const dataChildren = curData[childrenKey]
      if (Array.isArray(dataChildren) && dataChildren.length) {
        const childrenNodes = new Array(dataChildren.length) as Node[]
        ;(curNode as Record<string, unknown>).children = childrenNodes

        // 倒序压栈，保证遍历顺序与数组顺序一致
        for (let i = dataChildren.length - 1; i >= 0; i--) {
          const childData = dataChildren[i]
          const childNode = createNode(childData, i, curNode.depth + 1, curNode)
          childrenNodes[i] = childNode

          dataStack[sp] = childData
          nodeStack[sp] = childNode
          sp++
        }
      }
    }

    return root
  }

  flatten(filter?: (node: Node) => boolean): Node[] {
    const childrenKey = this.childrenKey
    const result: Node[] = []

    if (filter) {
      dfs(
        this.root,
        node => {
          if (filter(node)) {
            result.push(node)
          }
        },
        childrenKey
      )
    } else {
      dfs(
        this.root,
        node => {
          result.push(node)
        },
        childrenKey
      )
    }

    return result
  }

  /**
   * 查找单个节点
   * @param predicate - 匹配函数
   * @returns 第一个符合条件的节点，未找到返回 null
   */
  find(predicate: (node: Node) => boolean): Node | null {
    let found: Node | null = null
    dfs(
      this.root,
      node => {
        if (predicate(node)) {
          found = node
          return true // 提前终止
        }
      },
      this.childrenKey
    )
    return found
  }

  /**
   * 查找所有符合条件的节点
   * @param predicate - 匹配函数
   * @returns 所有符合条件的节点数组
   */
  findAll(predicate: (node: Node) => boolean): Node[] {
    const result: Node[] = []
    dfs(
      this.root,
      node => {
        if (predicate(node)) {
          result.push(node)
        }
      },
      this.childrenKey
    )
    return result
  }
}

// 下面的代码仅用作测试，将在稍后移除
type DataItem = {
  id: number
  children?: DataItem[]
}
const data: DataItem = {
  id: 1,
  children: [{ id: 2 }, { id: 3 }]
}
const tree = new TreeManager(data, {
  createNode: (data, index, depth, parent): ITreeNode => {
    return {
      data,
      index,
      depth,
      get isLeaf() {
        return !data.children?.length
      },
      parent
    }
  }
})
