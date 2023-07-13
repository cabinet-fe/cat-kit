class TreeNode<D = any> {
  /** 当前节点的索引路径, 路径的数量和树的深度相等 */
  indexes: number[] = []
  /** 节点数据 */
  data: D
  /** 父节点 */
  parent: TreeNode<D> | null = null
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

  constructor(data: D, index: number, parent?: TreeNode<D>) {
    this.data = data
    this.index = index

    if (parent) {
      this.parent = parent
    }
  }

  /** 从当前父节点中移除自身 */
  remove() {
    this.parent.children!.splice(this.index, 1)
  }

  removeChild(childNode: TreeNode<D>) {

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

  static create(data: any[], key: string, parent?: TreeNode) {
    const nodes = data.map((item, i) => {
      const node = new TreeNode(item, i, parent)

      if (item[key]) {
        if (Array.isArray(item[key])) {
          node.children = Tree.create(item[key], key, node)
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

  /** 树遍历 */
  traverse(cb: (node: TreeNode<DataItem>) => void) {
    if (Array.isArray(this.root)) {
    }
  }
}
