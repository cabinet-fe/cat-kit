import { TreeNode } from './tree/tree-node'
import { dft, bft } from './tree/helper'
interface TreeOptions {
  /** 数据中用于访问子节点的key */
  childrenKey?: string
}

export class Tree<
  Data extends Record<string, any> | Record<string, any>[],
  DataItem extends Record<string, any> = Data extends Array<any>
    ? Data[number]
    : Data
> {
  readonly root!: TreeNode<DataItem>

  private childrenKey = 'children'

  private flattedData: DataItem[] = []

  constructor(data: Data, options?: TreeOptions) {
    if (options?.childrenKey) {
      this.childrenKey = options.childrenKey
    }

    const root = new TreeNode(Array.isArray(data) ? null : data, 0)

    // @ts-ignore
    this.root = root
  }

  /**
   * 遍历
   * @param cb 回调, 如果在该回调中返回一个false则立即终止当前遍历
   * @param type
   */
  traverse(
    cb: (node: TreeNode<DataItem>) => boolean | void,
    type: 'bfs' | 'dfs' = 'dfs'
  ) {
    if (type === 'dfs') {
      return Tree.dft(this.root, cb, this.childrenKey)
    }
    if (type === 'bfs') {
      return Tree.bft(this.root, cb, this.childrenKey)
    }
  }

  getNode(
    matcher: (node: TreeNode<DataItem>) => boolean
  ): TreeNode<DataItem> | null {
    if (!this.root) {
      return null
    }
    return this.root.getChild(matcher)
  }

  getNodeList(
    matcher: (node: TreeNode<DataItem>) => boolean
  ): TreeNode<DataItem>[] {
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

    Tree.dft(this.root, (item) => {

    }, this.childrenKey)
  }

  static create(data: any[], key: string) {
    const nodes = data.map((item, i) => {
      const node = new TreeNode(item, i, parent)

      if (item[key]) {
        if (Array.isArray(item[key])) {
          node.children = Tree.create(item[key], key, root, node)
        } else {
          throw new Error(`${key}属性的值必须是个数组`)
        }
      }

      return node
    })

    return nodes
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
