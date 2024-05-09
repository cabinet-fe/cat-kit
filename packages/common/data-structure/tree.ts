import { TreeNode } from './tree/tree-node'

export class Tree<Node extends TreeNode> {
  readonly root: Node

  constructor(root: Node) {
    this.root = root
  }

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
    config?: {
      /**
       * 子节点的键名
       * @default 'children'
       */
      childrenKey?: string
      /** 节点创建后的回调 */
      onNodeCreated?: (node: Node) => void
    }
  ): Tree<Node> {
    const { childrenKey = 'children', onNodeCreated } = config || {}

    function generate(data: any, index: number, parent?: any) {
      const node = new Node(data, index)
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
  static dft<T extends Record<string, any>>(
    data: T,
    cb: (item: T) => boolean | void,
    childrenKey = 'children'
  ): false | undefined {
    if (cb(data) === false) return false

    let children = data[childrenKey]
    if (children) {
      let i = 0
      while (i < children.length) {
        if (Tree.dft(children[i], cb, childrenKey) === false) break
        i++
      }
    }
  }

  /**
   * 广度优先遍历树结构
   * @param root - 根节点
   * @param cb - 遍历回调函数，返回值为false时中断遍历
   * @param childrenKey - 子节点属性名，默认为'children'
   */
  static bft<T extends Record<string, any>>(
    root: T,
    cb: (item: T) => void | boolean,
    childrenKey = 'children'
  ): void {
    let queue: T[] = []

    queue.push(root)

    while (queue.length > 0) {
      const node = queue.shift()!
      if (cb(node) === false) break

      let children = node[childrenKey]
      if (!!children) {
        queue = queue.concat(children)
      }
    }
  }

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
  append(creator: (index: number) => Node) {
    return this.root.append(creator)
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

  constructor(node: Node) {
    this.virtualRoot = node
  }

  /**
   * 创建树结构
   * @param data - 树结构的根节点数据
   * @param Node - 节点类
   * @param config - 配置项
   */
  static create<Data extends any[], Node extends TreeNode<Data[number]>>(
    data: Data,
    Node: {
      new (val: Data[number], index: number): Node
    },
    config?: {
      /**
       * 子节点的key
       * @default 'children'
       */
      childrenKey?: string,
      onNodeCreated?: (node: Node) => void
    }
  ): Forest<Node> {
    const { childrenKey = 'children', onNodeCreated } = config || {}
    function generate(data: any, index: number, parent?: any) {
      const node = new Node(data, index)
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

    const virtualRoot = new Node({}, 0)
    const nodes = data.map((item, index) => generate(item, index, virtualRoot))
    virtualRoot.children = nodes
    return new Forest(virtualRoot)
  }

  /** 追加节点 */
  append(creator: (index: number) => Node) {
    return this.virtualRoot.append(creator)
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
      const result = Tree.dft(node, cb, childrenKey)
      if (result === false) {
        failed = true
      }
    })
    return failed ? false : undefined
  }
}

export { TreeNode }
