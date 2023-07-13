import { omitArr } from '../data/array'

class TreeNode<D = any> {
  root: TreeNode<D> | TreeNode<D>[] | null = null
  /** 当前节点的索引路径, 路径的数量和树的深度相等 */
  readonly indexes: number[] = []
  /** 节点数据 */
  readonly data: D
  /** 父节点 */
  readonly parent: TreeNode<D> | null = null
  /** 子节点 */
  children?: TreeNode<D>[]
  /** 在当前深度下的索引 */
  index: number
  /** 树深 */
  get depth(): number {
    let depth = 0
    let node: TreeNode<D> | null = this
    while (node.parent) {
      depth++
      node = node.parent
    }
    return depth
  }

  /** 是否是叶子节点 */
  get isLeaf(): boolean {
    return !this.children || this.children.length === 0
  }

  constructor(
    data: D,
    index: number,
    root?: TreeNode<D> | TreeNode<D>[],
    parent?: TreeNode<D>
  ) {
    this.data = data
    this.index = index

    if (root) {
      this.root = root
    }

    if (parent) {
      this.parent = parent
    }
  }

  /** 从当前父节点中移除自身 */
  remove() {
    if (!this.parent) {
      if (!this.root || !Array.isArray(this.root)) {
        return
      }
      this.root.splice(this.index, 1)
      // 重新排序
    } else {
      this.parent.children!.splice(this.index, 1)
      // 给其后面的兄弟节点重新排序
    }
  }

  removeChild(childNode: TreeNode<D>) {
    if (childNode.parent === this || !this.children || !this.children.length) {
      throw new Error('要移除的子节点不存在于当前节点中')
    }

    const result = omitArr(this.children!, childNode.index)
    // 需要重新排序
    if (!result.length) {
      delete this.children
    } else {
      this.children = result
    }
  }

  getChild(matcher: (node: TreeNode<D>) => boolean): TreeNode<D> | null {
    let ret: TreeNode<D> | null = null
    if (!this.children?.length) {
      return ret
    }
    Tree.bfs(
      this.children,
      node => {
        if (matcher(node)) {
          ret = node
          return false
        }
      },
      'children'
    )
    return ret
  }

  getChildren(matcher: (node: TreeNode<D>) => boolean): TreeNode<D>[] {
    let ret: TreeNode<D>[] = []
    if (!this.children?.length) {
      return ret
    }
    Tree.bfs(
      this.children,
      node => {
        if (matcher(node)) {
          ret.push(node)
        }
      },
      'children'
    )

    return ret
  }

  append(node: TreeNode<D>) {
    if (this.children) {
      this.children.push(node)
    } else {
      this.children = [node]
    }
  }

  insert(node: TreeNode<D>) {
    if (this.children) {
      this.children.push(node)
    } else {
      this.children = [node]
    }
  }
}

interface TreeOptions {
  /** 数据中用于访问子节点的key */
  childrenKey?: string
}

export class Tree<
  Data extends Record<string, any> | Record<string, any>[],
  DataItem extends Record<string, any> = Data extends Array<any>
    ? Data[number]
    : Data,
  Root = Data extends Array<any>
    ? Array<TreeNode<DataItem>>
    : TreeNode<DataItem>
> {
  readonly root!: Root

  private childrenKey = 'children'

  static create(
    data: any[],
    key: string,
    root?: TreeNode[] | TreeNode,
    parent?: TreeNode
  ) {
    const nodes = data.map((item, i) => {
      const node = new TreeNode(item, i, root, parent)

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

  constructor(data: Data, options?: TreeOptions) {
    if (options?.childrenKey) {
      this.childrenKey = options.childrenKey
    }

    if (Array.isArray(data)) {
      const root = Tree.create(data, this.childrenKey)
      // @ts-ignore
      this.root = root
    } else {
      const root = new TreeNode(data, 0)
      root.children = Tree.create(data[this.childrenKey], this.childrenKey)
      // @ts-ignore
      this.root = root
    }
  }

  /**
   * 遍历
   * @param cb 回调, 如果在该回调中返回一个false则立即终止当前遍历
   * @param type
   */
  traverse(
    cb: (node: TreeNode<DataItem>) => boolean | void,
    type: 'bfs' | 'dfs' = 'dfs'
  ): void {
    const data = Array.isArray(this.root)
      ? this.root
      : ([this.root] as TreeNode<DataItem>[])
    if (type === 'dfs') {
      return Tree.dfs(data, cb, this.childrenKey)
    }
    if (type === 'bfs') {
      return Tree.bfs(data, cb, this.childrenKey)
    }
  }




  getNode(matcher: (node: TreeNode<DataItem>) => boolean): TreeNode<DataItem> | null {
    let ret: TreeNode<DataItem> | null = null
    if (!this.root) {
      return ret
    }
    Tree.bfs(
      Array.isArray(this.root) ? this.root : [this.root],
      node => {
        if (matcher(node)) {
          ret = node
          return false
        }
      },
      'children'
    )
    return ret
  }

  getNodeList(matcher: (node: TreeNode<DataItem>) => boolean): TreeNode<DataItem>[] {
    let ret: TreeNode<DataItem>[] = []
    if (!this.root) {
      return ret
    }
    Tree.bfs(
      Array.isArray(this.root) ? this.root : [this.root],
      node => {
        if (matcher(node)) {
          ret.push(node)
        }
      },
      'children'
    )

    return ret
  }

  /**
   *
   * @param data 一个可以被描述为属性的数据结构
   * @param cb 遍历时的回调
   * @param childrenKey 子节点的key
   */
  static dfs<T extends Record<string, any>>(
    data: T[],
    cb: (item: T) => boolean | void,
    childrenKey: string
  ) {
    let i = 0
    while (i < data.length) {
      let item = data[i]!
      if (cb(item) === false) break
      if (Array.isArray(item[childrenKey])) {
        Tree.dfs(item[childrenKey], cb, childrenKey)
      }
      i++
    }
  }

  static bfs<T extends Record<string, any>>(
    data: T[],
    cb: (item: T) => boolean | void,
    childrenKey: string
  ) {
    let i = 0
    let nextFloor = []
    while (i < data.length) {
      let item = data[i]!
      if (cb(item) === false) break
      if (Array.isArray(item[childrenKey])) {
        nextFloor = nextFloor.concat(item[childrenKey])
      }
      i++
    }
    if (nextFloor.length) {
      Tree.bfs(nextFloor, cb, childrenKey)
    }
  }
}
