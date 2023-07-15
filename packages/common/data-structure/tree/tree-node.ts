import { omitArr } from '../../data/array'
import { dft, bft } from './helper'
export class TreeNode<Data> {
  children?: TreeNode<Data>[]

  data: Data

  parent: TreeNode<Data> | null = null

  index: number

  /** 树深 */
  get depth(): number {
    let depth = 0
    let node: TreeNode<Data> = this
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

  constructor(data: Data, index: number, parent?: TreeNode<Data>) {
    this.data = data
    this.index = index

    if (parent) {
      this.parent = parent
    }
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

  removeChild(childNode: TreeNode<Data>) {
    if (childNode.parent === this || !this.children?.length) {
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

  getChild(matcher: (node: TreeNode<Data>) => boolean): TreeNode<Data> | null {
    let ret: TreeNode<Data> | null = null
    if (!this.children?.length) {
      return ret
    }
    bft(
      this,
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

  getChildren(matcher: (node: TreeNode<Data>) => boolean): TreeNode<Data>[] {
    let ret: TreeNode<Data>[] = []
    if (!this.children?.length) {
      return ret
    }
    dft(
      this,
      node => {
        matcher(node) && ret.push(node)
      },
      'children'
    )

    return ret
  }

  append(node: TreeNode<Data>) {
    if (this.children) {
      this.children.push(node)
    } else {
      this.children = [node]
    }
  }

  insert(node: TreeNode<Data>) {
    if (this.children) {
      this.children.push(node)
    } else {
      this.children = [node]
    }
  }
}
