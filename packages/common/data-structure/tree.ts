import { TreeNode } from './tree/tree-node'
import { bft, dft, dftWithPath } from './tree/helper'

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
  Data extends any,
  Node extends TreeNode
> extends TreeCreateByClassConfig<Node> {
  /** 节点创建方法 */
  createNode: (data: Data, index: number) => Node
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
   * @param data - 原始数据
   * @param config - 配置项
   * @returns 生成的树形结构数据
   */
  static create<Data extends Record<string, any>, Node extends TreeNode<Data>>(
    data: Data,
    config: TreeCreateByFunctionConfig<Data, Node>
  ): Tree<Node>

  /**
   * 生成树形结构数据
   *
   * @param data - 原始数据
   * @param Node - 节点类
   * @param config - 配置项
   * @returns 生成的树形结构数据
   */
  static create<Data extends Record<string, any>, Node extends TreeNode<Data>>(
    data: Data,
    Node: {
      new (data: Data, index: number): Node
    },
    config: TreeCreateByClassConfig<Node>
  ): Tree<Node>
  static create<Data extends Record<string, any>, Node extends TreeNode<Data>>(
    data: Data,
    Node:
      | {
          new (data: Data, index: number): Node
        }
      | TreeCreateByFunctionConfig<Data, Node>,
    config?: TreeCreateByClassConfig<Node>
  ): Tree<Node> {
    const { childrenKey = 'children', onNodeCreated } =
      typeof Node === 'function' ? config || {} : Node

    let createNode: (data: Data, index: number) => Node
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

      if (children === undefined || Array.isArray(children)) {
        node.children = children?.map((item, index) =>
          generate(item, index, node)
        )
      }

      return node
    }

    return new Tree(generate(data, 0))
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
   * 深度优先遍历树结构，并对每个节点执行回调函数。
   * @param data - 树结构的根节点。
   * @param cb - 回调函数，接收当前节点和当前节点路径作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   * @param nodePath - 当前节点路径。
   */
  static dftWithPath = dftWithPath

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

  /**
   * 通过索引路径访问子节点节点
   * @param node 树形节点
   * @param indexPath 索引路径。
   * @param childrenKey 子节点key名
   */
  static visit(
    node: Record<string, any>,
    indexPath: number[],
    childrenKey = 'children'
  ) {
    let result = node
    for (let i = 0; i < indexPath.length; i++) {
      const index = indexPath[i]!
      if (!result) {
        console.warn('访问的路径内容不存在')
        return undefined
      }
      result = result[childrenKey]?.[index]
    }
    return result
  }

  /** 追加节点 */
  append(data: Node['data']): void {
    return this.root.append(data)
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
  dft(cb: (node: Node) => boolean | void, childrenKey?: string) {
    return Tree.dft(this.root, cb, childrenKey)
  }

  /**
   * 深度优先遍历树结构，并对每个节点执行回调函数。
   * @param cb - 回调函数，接收当前节点和当前节点路径作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   */
  dftWithPath(
    cb: (node: Node, nodePath: Node[]) => boolean | void,
    childrenKey?: string
  ) {
    return Tree.dftWithPath(this.root, cb, childrenKey, [])
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

  leafs: Node[] = []

  constructor(node: Node) {
    this.virtualRoot = node
  }

  /**
   * 生成树形结构数据
   *
   * @param data - 原始数据
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
   * @param data - 原始数据
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
      new (data: Data[number], index: number): Node
    },
    config?: TreeCreateByClassConfig<Node>
  ): Forest<Node>
  static create<Data extends any[], Node extends TreeNode<Data[number]>>(
    data: Data,
    Node:
      | {
          new (data: Data[number], index: number): Node
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
      if (Array.isArray(children)) {
        node.children = children.map((item, index) =>
          generate(item, index, node)
        )
      }

      return node
    }

    const virtualRoot = createNode(undefined, 0)
    const nodes = data.map((item, index) => generate(item, index, virtualRoot))
    virtualRoot.children = nodes

    return new Forest(virtualRoot)
  }

  /**
   * 通过索引路径访问子节点节点
   * @param nodes 森林节点
   * @param indexPath 索引路径。
   * @param childrenKey 子节点key名
   */
  static visit(
    nodes: Record<string, any>,
    indexPath: number[],
    childrenKey = 'children'
  ) {
    let currentNodes = nodes
    let result: Record<string, any> | undefined
    for (let i = 0; i < indexPath.length; i++) {
      const index = indexPath[i]!
      if (!currentNodes) {
        return undefined
      }
      result = currentNodes[index]
      currentNodes = result?.[childrenKey]
    }
    return result
  }

  /** 追加节点 */
  append(data: Node['data']): void {
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
   */
  dft(cb: (item: Node) => boolean | void, childrenKey?: string) {
    this.nodes.forEach(node => dft(node, cb, childrenKey))
  }

  /**
   * 深度优先遍历树结构，并对每个节点执行回调函数。
   * @param cb - 回调函数，接收当前节点和当前节点路径作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   */
  dftWithPath(
    cb: (item: Node, nodePath: Node[]) => boolean | void,
    childrenKey?: string
  ) {
    this.nodes.forEach(node => {
      dftWithPath(node, cb, childrenKey, [])
    })
  }
}

export { TreeNode }
