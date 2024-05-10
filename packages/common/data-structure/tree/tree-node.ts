import { omitArr } from '../../data/array'
import { bft, dft } from './helper'

interface TreeNodeCtor<Val> {
  new (val: Val, index: number): any
}

/**
 * 树节点
 * @example 继承 TreeNode 示例
 * ```
 * class CustomTreeNode<Val extends Record<string, any>> extends TreeNode<Val> {
 *    override children?: CustomTreeNode<Val>[] = undefined
 *
 *    override parent: CustomTreeNode<Val> | null = null
 *
 *    expanded = true
 *
 *    constructor(value: Val, index: number, parent?: CustomTreeNode<Val>) {
 *      super(value, index)
 *
 *      if (parent) {
 *        this.parent = parent
 *      }
 *    }
 *  }
 * ```
 */
export abstract class TreeNode<
  Val extends Record<string, any> = Record<string, any>
> {
  /** 节点数据 */
  value: Val

  /** 父节点 */
  abstract parent: any

  /** 子节点 */
  abstract children?: any[]

  /** 当前节点的索引 */
  index: number

  /** 树深 */
  get depth(): number {
    let depth = 0
    let node: TreeNode<Val> = this
    while (node?.parent) {
      depth++
      node = node.parent
    }

    return depth
  }

  /** 节点数量 */
  get size(): number {
    let s = 0
    this.dft(() => {
      s++
    })
    return s
  }

  /** 是否是叶子节点 */
  get isLeaf(): boolean {
    return !this.children || this.children.length === 0
  }

  constructor(val: Val, index: number) {
    if (index < 0 || !Number.isInteger(index)) {
      throw new Error(`节点的索引应当是正整数, 传入的索引为${index}`)
    }
    this.value = val
    this.index = index
  }

  /**
   * 从给定的起始索引开始，减小数组中元素的索引属性。
   * @param arr - 需要重新排序的元素数组。
   * @param startIndex - 开始重新排序的索引。
   */
  private static resort<Item extends { index: number }>(
    arr: Item[],
    startIndex: number
  ) {
    let i = 0
    while (i < arr.length) {
      arr[i]!.index = i + startIndex
      i++
    }
  }

  /**
   * 深度优先遍历
   * @param cb 递归回调
   * @param childrenKey 子节点key
   * @returns
   */
  dft(
    cb: (item: this) => boolean | void,
    childrenKey = 'children'
  ): false | undefined {
    return dft(this, cb, childrenKey)
  }

  /**
   * 广度优先遍历
   * @param cb 递归回调
   * @param childrenKey 子节点key
   * @returns
   */
  bft(cb: (item: this) => boolean | void, childrenKey = 'children') {
    return bft(this, cb, childrenKey)
  }

  /**
   * 从父节点中移除当前节点
   * @returns 移除成功返回true，否则返回false
   */
  remove(): boolean {
    if (!this.parent) {
      return false
    }
    this.parent.removeChild(this)

    return true
  }

  /**
   * 从当前节点中移除子节点
   * @param childNode 要移除的子节点
   */
  removeChild<Node extends TreeNode<any>>(childNode: Node) {
    if (childNode.parent !== this || !this.children?.length) {
      throw new Error('要移除的子节点不存在于当前节点中')
    }

    if (this.children?.[childNode.index] !== childNode) {
      return
    }

    const result = omitArr(this.children!, childNode.index)

    if (!result.length) {
      this.children = undefined
    } else {
      TreeNode.resort(result.slice(childNode.index), childNode.index)
      this.children = result
    }
  }

  /**
   * 在当前节点的子节点最后添加一个子节点。
   * @param val 节点数据
   */
  append(val: Val): void {
    const len = this.children?.length ?? 0
    const node = new (this.constructor as TreeNodeCtor<Val>)(val, len)
    node.parent = this
    this.children = [...(this.children || []), node]
  }

  /**
   * 插入节点到当前节点的子节点列表中。
   * 如果节点的索引大于当前节点子节点的长度，抛出错误。
   * 如果当前节点没有子节点，则将节点作为唯一子节点。
   * 如果当前节点有子节点，则将节点插入到指定索引的位置，并重新排序子节点列表。
   *
   * @param val 要插入的节点的数据
   * @param index 插入索引
   */
  insert(val: Val, index: number): void {
    const { children } = this
    const len = children?.length ?? 0
    // 检查节点的索引是否有效
    if (index > len) {
      throw new Error(`节点的索引不能大于当前节点子节点的长度${len}`)
    }

    const node = new (this.constructor as TreeNodeCtor<Val>)(val, index)

    // 指定父级
    node.parent = this
    if (!children) {
      this.children = [node]
    } else {
      const pre = children!.slice(0, node.index)
      const post = children!.slice(node.index)
      TreeNode.resort(post, node.index + 1)

      this.children = [...pre, node, ...post]
    }
  }

  /**
   * 在当前节点的下一个位置添加一个新节点。
   * @param val 节点数据
   */
  addToNext(val: Val): void {
    this.parent?.insert(val, this.index + 1)
  }

  /**
   * 在当前节点的上一个位置添加一个新节点。
   * @param val 节点数据
   */
  addToPrev(val: Val): void {
    this.parent?.insert(val, this.index)
  }
}
