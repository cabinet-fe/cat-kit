import { omitArr } from '../data/array'

export class BaseNode<D = any> {
  /** 当前节点的索引路径, 路径的数量和树的深度相等 */
  readonly indexes: number[] = []
  /** 节点数据 */
  readonly data: D
  /** 父节点 */
  // readonly parent: TreeNode<D> | null = null

  // /** 在当前深度下的索引 */
  // index: number

  constructor(data: D) {
    this.data = data
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

class TreeNode<D> extends BaseNode<D> {
  /** 父节点 */
  parent: TreeNode<D> | null = null
  /** 子节点 */
  children?: TreeNode<D>[]

  /** 树深 */
  get depth(): number {
    let depth = 0
    let node: BaseNode<D> | null = this
    while (node?.parent) {
      depth++
      node = node.parent
    }
    return depth
  }

  /** 是否是叶子节点 */
  get isLeaf(): boolean {
    return !this.children || this.children.length === 0
  }

  constructor(options: TreeNodeOptions) {
    this.root
  }
}

/** 树的根节点 */
class RootTreeNode<D, ChildData> extends BaseNode<D> {
  parent = null

  children?: TreeNode<ChildData>[]

  constructor(data: D) {
    super(data, 0)
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
    ? RootTreeNode<null, DataItem>
    : RootTreeNode<DataItem, DataItem>
> {
  readonly root!: Root

  private childrenKey = 'children'

  constructor(data: Data, options?: TreeOptions) {
    if (options?.childrenKey) {
      this.childrenKey = options.childrenKey
    }

    const root = new RootTreeNode(Array.isArray(data) ? null : data)

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

  getNode(
    matcher: (node: TreeNode<DataItem>) => boolean
  ): TreeNode<DataItem> | null {
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

  getNodeList(
    matcher: (node: TreeNode<DataItem>) => boolean
  ): TreeNode<DataItem>[] {
    let ret: TreeNode<DataItem>[] = []
    if (!this.root) {
      return ret
    }
    Tree.bft(
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

  flat() {}

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

  /**
   * 深度优先遍历
   * @param data 一个可以被描述为树形的数据结构
   * @param cb 遍历时的回调
   * @param childrenKey 子节点的key
   */
  static dft<T extends Record<string, any>>(
    data: T,
    cb: (item: T) => boolean | void,
    childrenKey: string
  ) {
    if (cb(data) === false) return false

    let children = data[childrenKey]
    if (children) {
      let i = 0
      while (i < children.length) {
        if (Tree.dft(children[i], cb, childrenKey)) break
        i++
      }
    }
  }

  /**
   * 广度优先遍历
   * @param data 一个可以被描述为树形的数据结构
   * @param cb 遍历时的回调, 当回调返回一个false时跳出当前循环
   * @param childrenKey 子节点的key
   */
  static bft<T extends Record<string, any>>(
    root: T,
    cb: (item: T) => void | boolean,
    childrenKey = 'children'
  ) {
    const queue: T[] = []

    queue.push(root)

    while (queue.length > 0) {
      const node = queue.shift()!
      if (cb(node) === false) break

      let children = node[childrenKey]
      if (!!children) {
        let i = 0
        while (i < children.length) {
          queue.push(children[i])
          i++
        }
      }
    }
  }
}
