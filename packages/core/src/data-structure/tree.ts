type Obj = Record<string, unknown>

type Callback<Node extends Obj> = (node: Node, index: number, parent?: Node) => void | boolean

/**
 * 深度优先遍历
 * @param data - 根节点
 * @param cb - 回调函数，返回 true 时提前终止遍历
 * @param childrenKey - 子节点属性名
 * @returns 如果提前终止返回 true
 */
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

/**
 * 广度优先遍历
 * @param data - 根节点
 * @param cb - 回调函数，返回 true 时提前终止遍历
 * @param childrenKey - 子节点属性名
 * @returns 如果提前终止返回 true
 */
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
    if (result === true) return true

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

/**
 * 树节点接口
 * @template T - 原始数据类型
 * @template Self - 节点自身类型，用于 parent/children 的递归类型定义
 *
 * @example
 * // 简单使用
 * type Node = ITreeNode<DataItem>
 *
 * // 扩展使用 - 让 parent/children 类型与扩展后的接口一致
 * interface MyNode extends ITreeNode<DataItem, MyNode> {
 *   extra: string
 * }
 */
export interface ITreeNode<T extends Obj = Obj, Self = ITreeNode<T, unknown>> {
  data: T
  depth: number
  index: number
  isLeaf: boolean
  parent?: Self
  children?: Self[]
}

/**
 * 树节点类 - 提供节点操作方法
 * @template T - 原始数据类型
 * @template Self - 节点自身类型，用于继承时的类型推导
 *
 * @example
 * // 直接使用
 * const node = new TreeNode(data, 0, 0)
 *
 * // 继承扩展
 * class MyTreeNode<T extends Obj> extends TreeNode<T, MyTreeNode<T>> {
 *   extra: string = ''
 * }
 */
export class TreeNode<
  T extends Obj = Obj,
  Self extends TreeNode<T, Self> = TreeNode<T, any>
> implements ITreeNode<T, Self> {
  data: T
  /** 父节点 */
  parent?: Self
  /** 子节点 */
  children?: Self[]
  /** 在树中的深度，从零开始 */
  depth: number
  /** 在树中的索引 */
  index: number

  get isLeaf(): boolean {
    return !this.children?.length
  }

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

    // index 可能过期，做一次兜底校验，避免删错节点
    let removeIndex = index
    if (parent.children[removeIndex] !== (this as unknown as Self)) {
      removeIndex = parent.children.indexOf(this as unknown as Self)
      if (removeIndex === -1) return
    }

    parent.children.splice(removeIndex, 1)
    for (let i = removeIndex; i < parent.children.length; i++) {
      parent.children[i]!.index = i
    }
    this.parent = undefined
  }

  /**
   * 插入子节点
   * @param node - 要插入的节点
   * @param index - 插入位置，默认追加到末尾
   */
  insert(node: Self, index?: number): void {
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
  }

  /**
   * 获取从根节点到当前节点的路径
   * @returns 路径数组，从根节点到当前节点
   */
  getPath(): Self[] {
    const path: Self[] = []
    let current: Self | undefined = this as unknown as Self
    while (current) {
      path.unshift(current)
      current = current.parent
    }
    return path
  }

  /**
   * 获取所有祖先节点
   * @returns 祖先节点数组，从父节点到根节点
   */
  getAncestors(): Self[] {
    const ancestors: Self[] = []
    let current = this.parent
    while (current) {
      ancestors.push(current)
      current = current.parent
    }
    return ancestors
  }

  /**
   * 检查是否为指定节点的祖先
   */
  isAncestorOf(node: Self): boolean {
    let current: Self | undefined = node.parent
    while (current) {
      if (current === (this as unknown as Self)) return true
      current = current.parent
    }
    return false
  }

  /**
   * 检查是否为指定节点的后代
   */
  isDescendantOf(node: Self): boolean {
    let current: Self | undefined = this.parent
    while (current) {
      if (current === node) return true
      current = current.parent
    }
    return false
  }

  /**
   * 获取可见后代节点（用于虚拟滚动的增量更新）
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数组（深度优先顺序）
   *
   * @example
   * // 展开节点时，获取需要插入的节点
   * const descendants = node.getVisibleDescendants(n => n.expanded)
   * flatList.splice(nodeIndex + 1, 0, ...descendants)
   */
  getVisibleDescendants(isExpanded: (node: Self) => boolean): Self[] {
    const result: Self[] = []
    if (!this.children?.length) return result

    const stack: Self[] = []
    // 倒序压栈
    for (let i = this.children.length - 1; i >= 0; i--) {
      stack.push(this.children[i]!)
    }

    while (stack.length) {
      const node = stack.pop()!
      result.push(node)

      // 只有展开的节点才继续遍历其子节点
      if (node.children?.length && isExpanded(node)) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i]!)
        }
      }
    }

    return result
  }

  /**
   * 计算可见后代节点数量（用于虚拟滚动的增量更新）
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数量
   *
   * @example
   * // 折叠节点时，计算需要移除的节点数量
   * const count = node.getVisibleDescendantCount(n => n.expanded)
   * flatList.splice(nodeIndex + 1, count)
   */
  getVisibleDescendantCount(isExpanded: (node: Self) => boolean): number {
    let count = 0
    if (!this.children?.length) return count

    const stack: Self[] = [...this.children]

    while (stack.length) {
      const node = stack.pop()!
      count++

      if (node.children?.length && isExpanded(node)) {
        stack.push(...node.children)
      }
    }

    return count
  }
}

/**
 * 节点创建函数类型
 * @template T - 原始数据类型
 * @template Node - 创建的节点类型
 */
export type NodeCreator<T extends Obj, Node> = (
  data: T,
  index: number,
  depth: number,
  parent: Node | undefined
) => Node

/**
 * TreeManager 配置选项（不带 createNode）
 */
export interface TreeManagerOptionsBase {
  childrenKey?: string
}

/**
 * TreeManager 配置选项（带 createNode）
 */
export interface TreeManagerOptionsWithCreator<T extends Obj, Node> extends TreeManagerOptionsBase {
  createNode: NodeCreator<T, Node>
}

/**
 * 树管理器 - 用于构建和管理树结构
 * @template T - 原始数据类型
 * @template Node - 节点类型
 *
 * @example
 * // 不使用 createNode，直接使用原始数据
 * const tree = new TreeManager(data)
 *
 * // 使用 createNode 创建自定义节点
 * const tree = new TreeManager(data, {
 *   createNode: (data, index, depth, parent) => ({
 *     data,
 *     index,
 *     depth,
 *     get isLeaf() { return !data.children?.length },
 *     parent
 *   })
 * })
 */
export class TreeManager<T extends Obj, Node extends Obj = T> {
  protected _root: Node

  get root(): Node {
    return this._root
  }

  protected nodeCreator?: NodeCreator<T, Node>
  protected childrenKey = 'children'

  /**
   * 构造函数 - 不使用 createNode
   */
  constructor(data: T, options?: TreeManagerOptionsBase)
  /**
   * 构造函数 - 使用 createNode
   */
  constructor(data: T, options: TreeManagerOptionsWithCreator<T, Node>)
  constructor(data: T, options?: TreeManagerOptionsBase | TreeManagerOptionsWithCreator<T, Node>) {
    if (options?.childrenKey) {
      this.childrenKey = options.childrenKey
    }

    if (options && 'createNode' in options) {
      this.nodeCreator = options.createNode
      this._root = this.buildTree(data)
    } else {
      this._root = data as unknown as Node
    }
  }

  /**
   * 从原始数据构建节点树
   */
  protected buildTree(data: T): Node {
    const { nodeCreator, childrenKey } = this
    if (!nodeCreator) {
      return data as unknown as Node
    }

    const root = nodeCreator(data, 0, 0, undefined)

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
        const depth = (curNode as { depth?: number }).depth ?? 0
        const childrenNodes = Array.from<Node>({ length: dataChildren.length })
        ;(curNode as Record<string, unknown>).children = childrenNodes

        // 倒序压栈，保证遍历顺序与数组顺序一致
        for (let i = dataChildren.length - 1; i >= 0; i--) {
          const childData = dataChildren[i] as T
          const childNode = nodeCreator(childData, i, depth + 1, curNode)
          childrenNodes[i] = childNode

          dataStack[sp] = childData
          nodeStack[sp] = childNode
          sp++
        }
      }
    }

    return root
  }

  /**
   * 深度优先遍历
   * @param callback - 回调函数，返回 true 时提前终止
   */
  dfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void {
    dfs(this.root, callback, this.childrenKey)
  }

  /**
   * 广度优先遍历
   * @param callback - 回调函数，返回 true 时提前终止
   */
  bfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void {
    bfs(this.root, callback, this.childrenKey)
  }

  /**
   * 扁平化树为数组
   * @param filter - 可选的过滤函数
   * @returns 节点数组
   */
  flatten(filter?: (node: Node) => boolean): Node[] {
    const result: Node[] = []

    dfs(
      this.root,
      (node) => {
        if (!filter || filter(node)) {
          result.push(node)
        }
      },
      this.childrenKey
    )

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
      (node) => {
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
      (node) => {
        if (predicate(node)) {
          result.push(node)
        }
      },
      this.childrenKey
    )
    return result
  }

  /**
   * 获取所有叶子节点
   */
  getLeaves(): Node[] {
    return this.findAll((node) => {
      const children = (node as Record<string, unknown>)[this.childrenKey]
      return !Array.isArray(children) || children.length === 0
    })
  }

  /**
   * 获取指定深度的所有节点
   * @param depth - 目标深度
   */
  getNodesAtDepth(depth: number): Node[] {
    return this.findAll((node) => (node as { depth?: number }).depth === depth)
  }

  /**
   * 计算树的最大深度
   */
  getMaxDepth(): number {
    let maxDepth = 0
    dfs(
      this.root,
      (node) => {
        const nodeDepth = (node as { depth?: number }).depth ?? 0
        if (nodeDepth > maxDepth) {
          maxDepth = nodeDepth
        }
      },
      this.childrenKey
    )
    return maxDepth
  }

  /**
   * 获取节点的可见后代（用于虚拟滚动的增量更新）
   *
   * @param node - 目标节点
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数组（深度优先顺序）
   *
   * @example
   * // 展开节点时，获取需要插入的节点
   * const descendants = tree.getVisibleDescendants(node, n => n.expanded)
   * flatList.splice(nodeIndex + 1, 0, ...descendants)
   */
  getVisibleDescendants(node: Node, isExpanded: (node: Node) => boolean): Node[] {
    const { childrenKey } = this
    const result: Node[] = []
    const children = (node as Record<string, unknown>)[childrenKey] as Node[] | undefined

    if (!Array.isArray(children) || !children.length) return result

    const stack: Node[] = []
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]!)
    }

    while (stack.length) {
      const cur = stack.pop()!
      result.push(cur)

      const curChildren = (cur as Record<string, unknown>)[childrenKey] as Node[] | undefined
      if (Array.isArray(curChildren) && curChildren.length && isExpanded(cur)) {
        for (let i = curChildren.length - 1; i >= 0; i--) {
          stack.push(curChildren[i]!)
        }
      }
    }

    return result
  }

  /**
   * 计算节点的可见后代数量（用于虚拟滚动的增量更新）
   *
   * @param node - 目标节点
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数量
   *
   * @example
   * // 折叠节点时，计算需要移除的节点数量
   * const count = tree.getVisibleDescendantCount(node, n => n.expanded)
   * flatList.splice(nodeIndex + 1, count)
   */
  getVisibleDescendantCount(node: Node, isExpanded: (node: Node) => boolean): number {
    const { childrenKey } = this
    let count = 0
    const children = (node as Record<string, unknown>)[childrenKey] as Node[] | undefined

    if (!Array.isArray(children) || !children.length) return count

    const stack: Node[] = [...children]

    while (stack.length) {
      const cur = stack.pop()!
      count++

      const curChildren = (cur as Record<string, unknown>)[childrenKey] as Node[] | undefined
      if (Array.isArray(curChildren) && curChildren.length && isExpanded(cur)) {
        stack.push(...curChildren)
      }
    }

    return count
  }

  /**
   * 扁平化树为数组（仅包含可见节点，用于虚拟滚动）
   *
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见节点数组（深度优先顺序）
   *
   * @example
   * // 初始化时获取可见节点列表
   * const flatList = tree.flattenVisible(n => n.expanded)
   */
  flattenVisible(isExpanded: (node: Node) => boolean): Node[] {
    const { childrenKey } = this
    const result: Node[] = []

    const stack: Node[] = [this.root]

    while (stack.length) {
      const node = stack.pop()!
      result.push(node)

      const children = (node as Record<string, unknown>)[childrenKey] as Node[] | undefined
      if (Array.isArray(children) && children.length && isExpanded(node)) {
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push(children[i]!)
        }
      }
    }

    return result
  }
}
