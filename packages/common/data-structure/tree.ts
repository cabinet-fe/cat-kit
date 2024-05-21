import { TreeNode } from './tree/tree-node'
import { bft, dft } from './tree/helper'

export interface TreeCreateByClassConfig<Node extends TreeNode> {
  /**
   * 子节点的键名
   * @default 'children'
   */
  childrenKey?: string

  /** 节点创建后的回调 */
  onNodeCreated?: (node: Node) => void
}

export interface TreeCreateByFunctionConfig<
  Val extends any,
  Node extends TreeNode
> extends TreeCreateByClassConfig<Node> {
  /** 节点创建方法 */
  createNode: (val: Val, index: number) => Node
}

export class Tree<Node extends TreeNode> {
  readonly root: Node

  /** 节点数量 */
  get size(): number {
    return this.root.size
  }

  constructor(root: Node) {
    this.root = root
  }

  /**
   * 生成树形结构数据
   *
   * @param val - 原始数据
   * @param config - 配置项
   * @returns 生成的树形结构数据
   */
  static create<Val extends Record<string, any>, Node extends TreeNode<Val>>(
    val: Val,
    config: TreeCreateByFunctionConfig<Val, Node>
  ): Tree<Node>

  /**
   * 生成树形结构数据
   *
   * @param val - 原始数据
   * @param Node - 节点类
   * @param config - 配置项
   * @returns 生成的树形结构数据
   */
  static create<Val extends Record<string, any>, Node extends TreeNode<Val>>(
    val: Val,
    Node: {
      new (val: Val, index: number): Node
    },
    config: TreeCreateByClassConfig<Node>
  ): Tree<Node>
  static create<Val extends Record<string, any>, Node extends TreeNode<Val>>(
    val: Val,
    Node:
      | {
          new (val: Val, index: number): Node
        }
      | TreeCreateByFunctionConfig<Val, Node>,
    config?: TreeCreateByClassConfig<Node>
  ): Tree<Node> {
    const { childrenKey = 'children', onNodeCreated } =
      typeof Node === 'function' ? config || {} : Node

    let createNode: (data: Val, index: number) => Node
    if (typeof Node === 'function') {
      createNode = (data, index) => new Node(data, index)
    } else if (typeof Node === 'object') {
      createNode = Node.createNode
    }

    function generate(data: any, index: number, parent?: any) {
      const node = createNode(data, index)
      onNodeCreated?.(node)
      if (parent) {
        node.parent = parent
      }
      const children = data[childrenKey]
      if (Array.isArray(children) && children.length) {
        node.children = children.map((item, index) =>
          generate(item, index, node)
        )
      }

      return node
    }

    return new Tree(generate(val, 0))
  }

  /**
   * 深度优先遍历树结构，并对每个节点执行回调函数。
   * @param data - 树结构的根节点。
   * @param cb - 回调函数，接收当前节点作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   * @returns 返回布尔值，表示是否遇到了回调函数返回 `false` 的节点。
   */
  static dft = dft

  /**
   * 广度优先遍历树结构
   * @param root - 根节点
   * @param cb - 遍历回调函数，返回值为false时中断遍历
   * @param childrenKey - 子节点属性名，默认为'children'
   */
  static bft = bft

  /**
   * 获取节点的子节点
   * @param node 节点
   * @param matcher 匹配函数，用于判断节点是否符合条件
   * @param childrenKey 子节点键名，默认为'children'
   * @returns 符合条件的子节点数组
   */
  static getChildren<Node extends Record<string, any>>(
    node: Node,
    matcher: (node: Node) => boolean,
    childrenKey = 'children'
  ): Node[] {
    let ret: Node[] = []
    Tree.dft(
      node,
      node => {
        matcher(node) && ret.push(node)
      },
      childrenKey
    )
    return ret
  }

  /**
   * 获取满足条件的第一个子节点。
   *
   * @param node - 父节点。
   * @param matcher - 匹配子节点的条件。
   * @param childrenKey - 访问父节点中子节点的键。
   * @returns 第一个满足条件的子节点，如果没有匹配项则返回 null。
   */
  static getChild<Node extends Record<string, any>>(
    node: Node,
    matcher: (node: Node) => boolean,
    childrenKey = 'children'
  ): Node | null {
    let ret: Node | null = null

    Tree.bft(
      node,
      node => {
        if (matcher(node)) {
          ret = node
          return false
        }

        return true
      },
      childrenKey
    )
    return ret
  }

  /** 追加节点 */
  append(val: Node['value']): void {
    return this.root.append(val)
  }

  /**
   * 广度优先遍历树结构，并对每个节点执行回调函数。
   * @param cb - 回调函数，接收当前节点作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   * @returns 返回布尔值，表示是否遇到了回调函数返回 `false` 的节点。
   */
  bft(cb: (item: Node) => boolean | void, childrenKey?: string): void {
    return Tree.bft(this.root, cb, childrenKey)
  }

  /**
   * 深度优先遍历树结构，并对每个节点执行回调函数。
   * @param cb - 回调函数，接收当前节点作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   * @returns 返回布尔值，表示是否遇到了回调函数返回 `false` 的节点。
   */
  dft(
    cb: (item: Node) => boolean | void,
    childrenKey?: string
  ): false | undefined {
    return Tree.dft(this.root, cb, childrenKey)
  }
}

export class Forest<Node extends TreeNode> {
  private virtualRoot!: Node

  get nodes(): Node[] {
    return this.virtualRoot.children! as Node[]
  }

  /** 节点数量 */
  get size(): number {
    let sum = 0
    this.nodes?.forEach(node => {
      sum += node.size
    })
    return sum
  }

  constructor(node: Node) {
    this.virtualRoot = node
  }

  /**
   * 生成树形结构数据
   *
   * @param val - 原始数据
   * @param config - 配置项
   * @returns 生成的树形结构数据
   */
  static create<
    Data extends Record<string, any>[],
    Node extends TreeNode<Data[number]>
  >(
    data: Data,
    config: TreeCreateByFunctionConfig<Data[number], Node>
  ): Forest<Node>
  /**
   * 生成树形结构数据
   *
   * @param val - 原始数据
   * @param Node - 节点类
   * @param config - 配置项
   * @returns 生成的树形结构数据
   */
  static create<
    Data extends Record<string, any>[],
    Node extends TreeNode<Data[number]>
  >(
    data: Data,
    Node: {
      new (val: Data[number], index: number): Node
    },
    config?: TreeCreateByClassConfig<Node>
  ): Forest<Node>
  static create<Data extends any[], Node extends TreeNode<Data[number]>>(
    data: Data,
    Node:
      | {
          new (val: Data[number], index: number): Node
        }
      | TreeCreateByFunctionConfig<Data[number], Node>,
    config?: TreeCreateByClassConfig<Node>
  ): Forest<Node> {
    const { childrenKey = 'children', onNodeCreated } =
      typeof Node === 'function' ? config || {} : Node

    let createNode: (data: Data[number], index: number) => Node
    if (typeof Node === 'function') {
      createNode = (data, index) => new Node(data, index)
    } else {
      createNode = Node.createNode
    }

    function generate(data: any, index: number, parent?: any) {
      const node = createNode(data, index)
      onNodeCreated?.(node)
      if (parent) {
        node.parent = parent
      }
      const children = data[childrenKey]
      if (Array.isArray(children) && children.length) {
        node.children = children.map((item, index) =>
          generate(item, index, node)
        )
      }

      return node
    }

    const virtualRoot = createNode({}, 0)
    const nodes = data.map((item, index) => generate(item, index, virtualRoot))
    virtualRoot.children = nodes
    return new Forest(virtualRoot)
  }

  /** 追加节点 */
  append(data: Node['value']): void {
    return this.virtualRoot.append(data)
  }

  /**
   * 广度优先遍历树结构，并对每个节点执行回调函数。
   * @param cb - 回调函数，接收当前节点作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   * @returns 返回布尔值，表示是否遇到了回调函数返回 `false` 的节点。
   */
  bft(cb: (item: Node) => boolean | void, childrenKey = 'children'): void {
    let queue = [...this.nodes]
    while (queue.length) {
      const node = queue.shift()!
      const result = cb(node)
      if (result === false) return
      const children = node[childrenKey]
      if (!!children) {
        queue = queue.concat(children)
      }
    }
  }

  /**
   * 深度优先遍历树结构，并对每个节点执行回调函数。
   * @param cb - 回调函数，接收当前节点作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   * @returns 返回布尔值，表示是否遇到了回调函数返回 `false` 的节点。
   */
  dft(
    cb: (item: Node) => boolean | void,
    childrenKey?: string
  ): false | undefined {
    let failed = false
    this.nodes.forEach(node => {
      const result = dft(node, cb, childrenKey)
      if (result === false) {
        failed = true
      }
    })
    return failed ? false : undefined
  }
}

export { TreeNode }
