import { omitArr } from '../../data/array'

/**
 * 树节点
 * @example 继承 TreeNode 示例
 * ```
 * class CustomTreeNode<Val extends Record<string, any>> extends TreeNode<Val> {
 *   override children?: CustomTreeNode<Val>[] = undefined
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
export class TreeNode<Val extends Record<string, any>> {
  /** 节点数据 */
  value: Val

  /** 父节点 */
  parent: TreeNode<Val> | null = null

  /** 当前节点的索引 */
  index: number

  /** 子节点 */
  children?: TreeNode<Val>[]

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

  /** 是否是叶子节点 */
  get isLeaf(): boolean {
    return !this.children || this.children.length === 0
  }

  constructor(value: Val, index: number, parent?: any) {
    if (index < 0 || !Number.isInteger(index)) {
      throw new Error(`节点的索引应当是正整数, 传入的索引为${index}`)
    }
    this.value = value
    this.index = index
    if (parent) {
      this.parent = parent
    }
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
    let i = startIndex
    while (i < arr.length) {
      arr[i]!.index = i
      i++
    }
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

    const result = omitArr(this.children!, childNode.index)

    if (!result.length) {
      this.children = undefined
    } else {
      this.children = result
      TreeNode.resort(this.children!, childNode.index)
    }
  }

  /**
   * 在当前节点的子节点最后添加一个子节点。
   *
   * @param node 要添加的子节点
   */
  append<Node extends TreeNode<any>>(creator: (index: number) => Node) {
    const len = this.children?.length ?? 0
    const node = creator(len)
    if (node.index !== len) {
      throw new Error(`子节点的索引应该等于当前节点的子节点的长度${len}`)
    }
    node.parent = this
    this.children = [...(this.children || []), node]
  }

  /**
   * 插入节点到当前节点的子节点列表中。
   * 如果节点的索引大于当前节点子节点的长度，抛出错误。
   * 如果当前节点没有子节点，则将节点作为唯一子节点。
   * 如果当前节点有子节点，则将节点插入到指定索引的位置，并重新排序子节点列表。
   *
   * @param node 要插入的节点
   */
  insert<Node extends TreeNode<any>>(node: Node) {
    const { children } = this
    const len = children?.length ?? 0

    // 检查节点的索引是否有效
    if (node.index > len) {
      throw new Error(`节点的索引不能大于当前节点子节点的长度${len}`)
    }

    // 指定父级
    node.parent = this
    if (!children) {
      this.children = [node]
    } else {
      const pre = children!.slice(0, node.index)
      const post = children!.slice(node.index)
      this.children = [...pre, node, ...post]
      TreeNode.resort(post, node.index)
    }
  }

  /**
   * 在当前节点的下一个位置添加一个新节点。
   * @param creator 创建新节点的函数，函数的参数为新节点的索引。
   */
  addToNext<Node extends TreeNode<any>>(creator: (index: number) => Node) {
    const node = creator(this.index + 1)
    this.parent?.insert(node)
  }

  /**
   * 在当前节点的上一个位置添加一个新节点。
   * @param creator 创建新节点的函数，函数的参数为新节点的索引。
   */
  addToPrev<Node extends TreeNode<any>>(creator: (index: number) => Node) {
    const node = creator(this.index)
    this.parent?.insert(node)
  }
}
