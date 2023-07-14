import { BaseTreeNode } from './base-tree-node'

export class TreeNode<Data> extends BaseTreeNode<Data> {
  children?: TreeNode<Data>[]

  parent: TreeNode<Data> | RootTreeNode<null, Data> | null = null

  /** 树深 */
  get depth(): number {
    let depth = 0
    let node: TreeNode<Data> | RootTreeNode<Data | null, Data> | null = this
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

  constructor(data: Data, parent?: TreeNode<Data>) {
    super(data)
  }

  /** 从当前父节点中移除自身 */
  remove(): boolean {
    if (!this.parent) {
      console.warn('父节点不存在')
      return false
    }
    this.parent.children!.splice(this.index, 1)
    return true
  }
}

export class RootTreeNode<Data, ChildData> extends BaseTreeNode<Data> {
  children?: TreeNode<ChildData>[]

  parent = null

  isRoot = true

  /** 树深 */
  readonly depth = 0

  /** 是否是叶子节点 */
  get isLeaf(): boolean {
    return !this.children || this.children.length === 0
  }

  constructor(data: Data) {
    super(data)
  }

  /** 从当前父节点中移除自身 */
  remove(): boolean {
    if (!this.parent) {
      console.warn('父节点不存在')
      return false
    }
    this.parent.children!.splice(this.index, 1)
    return true
  }
}


