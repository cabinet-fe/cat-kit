import { bfs, dfs, TreeNode } from './tree'
import type { ITreeNode } from './tree'

type Obj = Record<string, unknown>

/**
 * 森林节点接口
 * @template T - 原始数据类型
 * @template Self - 节点自身类型
 */
export interface IForestNode<T extends Obj = Obj, Self = IForestNode<T, unknown>>
  extends ITreeNode<T, Self> {
  /** 所属森林实例 */
  forest: Forest<T, Self extends Obj ? Self : Obj>
}

/**
 * 森林节点类 - 支持根节点级别的移除操作
 * @template T - 原始数据类型
 * @template Self - 节点自身类型，用于继承时的类型推导
 *
 * @example
 * class MyForestNode<T extends Obj> extends ForestNode<T, MyForestNode<T>> {
 *   selected = false
 * }
 */
export class ForestNode<
  T extends Obj = Obj,
  Self extends ForestNode<T, Self> = ForestNode<T, any>
> extends TreeNode<T, Self> {
  /** 索引签名，支持动态属性访问 */
  [key: string]: unknown
  readonly forest: Forest<T, Self>

  constructor(
    data: T,
    index: number,
    depth: number,
    forest: Forest<T, Self>,
    parent?: Self
  ) {
    super(data, index, depth, parent)
    this.forest = forest
  }

  override remove(): void {
    if (this.parent) {
      super.remove()
    } else {
      // 根节点：从 forest.roots 中移除
      const { roots } = this.forest
      let removeIndex = this.index
      if (roots[removeIndex] !== (this as unknown as Self)) {
        removeIndex = roots.indexOf(this as unknown as Self)
        if (removeIndex === -1) return
      }
      roots.splice(removeIndex, 1)
      for (let i = removeIndex; i < roots.length; i++) {
        roots[i]!.index = i
      }
    }
  }
}

/**
 * 节点创建函数类型
 */
export type ForestNodeCreator<T extends Obj, Node extends Obj> = (
  data: T,
  index: number,
  depth: number,
  forest: Forest<T, Node>,
  parent: Node | undefined
) => Node

/**
 * Forest 配置选项（基础）
 */
export interface ForestOptionsBase<T extends Obj> {
  data: T[]
  childrenKey?: string
}

/**
 * Forest 配置选项（带 createNode）
 */
export interface ForestOptionsWithCreator<T extends Obj, Node extends Obj>
  extends ForestOptionsBase<T> {
  createNode: ForestNodeCreator<T, Node>
}

/**
 * 森林管理器 - 管理多棵树
 * @template T - 原始数据类型
 * @template Node - 节点类型
 *
 * @example
 * // 使用自定义节点
 * const forest = new Forest({
 *   data: [{ id: 1 }, { id: 2, children: [{ id: 3 }] }],
 *   createNode: (data, index, depth, forest, parent) => ({
 *     data,
 *     index,
 *     depth,
 *     forest,
 *     parent,
 *     get isLeaf() { return !data.children?.length }
 *   })
 * })
 */
export class Forest<T extends Obj, Node extends Obj = T> {
  roots: Node[] = []
  protected childrenKey: string
  protected nodeCreator?: ForestNodeCreator<T, Node>

  constructor(options: ForestOptionsBase<T>)
  constructor(options: ForestOptionsWithCreator<T, Node>)
  constructor(
    options: ForestOptionsBase<T> | ForestOptionsWithCreator<T, Node>
  ) {
    const { data, childrenKey = 'children' } = options
    this.childrenKey = childrenKey

    if ('createNode' in options) {
      this.nodeCreator = options.createNode
      this.roots = data.map((item, index) => {
        return this.buildTree(item, index)
      })
    } else {
      // 无 createNode 时，直接使用原始数据
      this.roots = data as unknown as Node[]
    }
  }

  /**
   * 构建单棵树
   */
  protected buildTree(data: T, rootIndex: number): Node {
    const { childrenKey, nodeCreator } = this
    if (!nodeCreator) {
      return data as unknown as Node
    }

    const root = nodeCreator(data, rootIndex, 0, this, undefined)

    // 使用显式栈实现迭代构建
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
        const childrenNodes = new Array<Node>(dataChildren.length)
          ; (curNode as Record<string, unknown>).children = childrenNodes

        // 倒序压栈，保证遍历顺序与数组顺序一致
        for (let i = dataChildren.length - 1; i >= 0; i--) {
          const childData = dataChildren[i] as T
          const childNode = nodeCreator(childData, i, depth + 1, this, curNode)
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
   * 深度优先遍历所有树
   * @param callback - 回调函数，返回 true 时提前终止当前树的遍历
   */
  dfs(
    callback: (node: Node, index: number, parent?: Node) => void | boolean
  ): void {
    for (const root of this.roots) {
      dfs(root, callback, this.childrenKey)
    }
  }

  /**
   * 广度优先遍历所有树
   * @param callback - 回调函数，返回 true 时提前终止当前树的遍历
   */
  bfs(
    callback: (node: Node, index: number, parent?: Node) => void | boolean
  ): void {
    for (const root of this.roots) {
      bfs(root, callback, this.childrenKey)
    }
  }

  /**
   * 扁平化所有树为数组
   * @param filter - 可选的过滤函数
   */
  flatten(filter?: (node: Node) => boolean): Node[] {
    const result: Node[] = []
    this.dfs(node => {
      if (!filter || filter(node)) {
        result.push(node)
      }
    })
    return result
  }

  /**
   * 查找单个节点
   * @param predicate - 匹配函数
   * @returns 第一个符合条件的节点，未找到返回 null
   */
  find(predicate: (node: Node) => boolean): Node | null {
    for (const root of this.roots) {
      let found: Node | null = null
      dfs(
        root,
        node => {
          if (predicate(node)) {
            found = node
            return true
          }
        },
        this.childrenKey
      )
      if (found) return found
    }
    return null
  }

  /**
   * 查找所有符合条件的节点
   * @param predicate - 匹配函数
   */
  findAll(predicate: (node: Node) => boolean): Node[] {
    const result: Node[] = []
    this.dfs(node => {
      if (predicate(node)) {
        result.push(node)
      }
    })
    return result
  }

  /**
   * 获取所有叶子节点
   */
  getLeaves(): Node[] {
    return this.findAll(node => {
      const children = (node as Record<string, unknown>)[this.childrenKey]
      return !Array.isArray(children) || children.length === 0
    })
  }

  /**
   * 获取节点总数
   */
  get size(): number {
    let count = 0
    this.dfs(() => {
      count++
    })
    return count
  }

  /**
   * 计算所有树的最大深度
   */
  getMaxDepth(): number {
    let maxDepth = 0
    this.dfs(node => {
      const nodeDepth = (node as { depth?: number }).depth ?? 0
      if (nodeDepth > maxDepth) {
        maxDepth = nodeDepth
      }
    })
    return maxDepth
  }

  /**
   * 获取节点的可见后代（用于虚拟滚动的增量更新）
   *
   * @param node - 目标节点
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数组（深度优先顺序）
   */
  getVisibleDescendants(
    node: Node,
    isExpanded: (node: Node) => boolean
  ): Node[] {
    const { childrenKey } = this
    const result: Node[] = []
    const children = (node as Record<string, unknown>)[childrenKey] as
      | Node[]
      | undefined

    if (!Array.isArray(children) || !children.length) return result

    const stack: Node[] = []
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]!)
    }

    while (stack.length) {
      const cur = stack.pop()!
      result.push(cur)

      const curChildren = (cur as Record<string, unknown>)[childrenKey] as
        | Node[]
        | undefined
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
   */
  getVisibleDescendantCount(
    node: Node,
    isExpanded: (node: Node) => boolean
  ): number {
    const { childrenKey } = this
    let count = 0
    const children = (node as Record<string, unknown>)[childrenKey] as
      | Node[]
      | undefined

    if (!Array.isArray(children) || !children.length) return count

    const stack: Node[] = []
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]!)
    }

    while (stack.length) {
      const cur = stack.pop()!
      count++

      const curChildren = (cur as Record<string, unknown>)[childrenKey] as
        | Node[]
        | undefined
      if (Array.isArray(curChildren) && curChildren.length && isExpanded(cur)) {
        for (let i = curChildren.length - 1; i >= 0; i--) {
          stack.push(curChildren[i]!)
        }
      }
    }

    return count
  }

  /**
   * 扁平化森林为数组（仅包含可见节点，用于虚拟滚动）
   *
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见节点数组（深度优先顺序）
   */
  flattenVisible(isExpanded: (node: Node) => boolean): Node[] {
    const { childrenKey, roots } = this
    const result: Node[] = []

    for (const root of roots) {
      const stack: Node[] = [root]

      while (stack.length) {
        const node = stack.pop()!
        result.push(node)

        const children = (node as Record<string, unknown>)[childrenKey] as
          | Node[]
          | undefined
        if (Array.isArray(children) && children.length && isExpanded(node)) {
          for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]!)
          }
        }
      }
    }

    return result
  }
}
