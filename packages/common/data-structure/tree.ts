import { TreeNode } from './tree/tree-node'
import { dft, bft } from './tree/helper'

interface TreeOptions<Data, Node> {
  /** 数据中用于访问子节点的key */
  childrenKey?: string

  /** 节点生成 */
  createNode: (data: Data, index: number, parent?: Node) => Node
}

export { TreeNode }

interface BaseNode {
  getChild(matcher: (node: BaseNode) => boolean): BaseNode | null
}

export class Tree<
  Data extends Record<string, any>,
  Node extends BaseNode
> {
  /** 根节点 */
  readonly root: Node

  /** 子节点的key */
  private childrenKey = 'children'

  /** 被碾平的数据 */
  private flattedData: Data[] = []

  private createNode: TreeOptions<Data, Node>['createNode']

  constructor(data: Data, options: TreeOptions<Data, Node>) {
    const { childrenKey, createNode } = options
    if (childrenKey) {
      this.childrenKey = childrenKey
    }
    this.createNode = createNode
    const root = this.createNode(data, 0)

    this.root = root
  }

  /**
   * 遍历
   * @param cb 回调, 如果在该回调中返回一个false则立即终止当前遍历
   * @param type
   */
  traverse(cb: (node: Node) => boolean | void, type: 'bfs' | 'dfs' = 'dfs') {
    if (type === 'dfs') {
      return Tree.dft(this.root, cb, this.childrenKey)
    }
    if (type === 'bfs') {
      return Tree.bft(this.root, cb, this.childrenKey)
    }
  }

  getNode(matcher: (node: Node) => boolean): Node | null {
    if (!this.root) {
      return null
    }
    return this.root.getChild(matcher)
  }

  getNodeList(matcher: (node: Node) => boolean): Node[] {
    if (!this.root) {
      return []
    }
    return this.root.getChildren(matcher)
  }

  flat() {
    if (this.flattedData) {
      return this.flattedData
    }
    this.flattedData

    Tree.dft(this.root, item => {}, this.childrenKey)
  }

  /**
   * 深度优先遍历
   * @param data 一个可以被描述为树形的数据结构
   * @param cb 遍历时的回调
   * @param childrenKey 子节点的key
   */
  static dft = dft

  /**
   * 广度优先遍历
   * @param data 一个可以被描述为树形的数据结构
   * @param cb 遍历时的回调, 当回调返回一个false时跳出当前循环
   * @param childrenKey 子节点的key
   */
  static bft = bft
}
