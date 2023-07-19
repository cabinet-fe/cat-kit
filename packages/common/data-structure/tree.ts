import { TreeNode } from './tree/tree-node'

export const Tree = {
  /**
   * 生成树形结构数据
   *
   * @param val - 原始数据
   * @param createNode - 创建节点的回调函数
   * @param childrenKey - 子节点的键名，默认为 'children'
   * @returns 生成的树形结构数据
   */
  create<Val extends Record<string, any>, Node extends Record<string, any>>(
    val: Val,
    createNode: (data: Val, index: number, parent?: any) => Node,
    childrenKey = 'children'
  ): Node {
    function generate(data: any, index: number, parent?: any) {
      const node = createNode(data, index, parent)
      const children = data[childrenKey]
      if (Array.isArray(children) && children.length) {
        ;(node as any).children = children.map((item, index) =>
          generate(item, index, node)
        )
      }

      return node
    }

    return generate(val, 0)
  },

  /**
   * 深度优先遍历树结构，并对每个节点执行回调函数。
   * @param data - 树结构的根节点。
   * @param cb - 回调函数，接收当前节点作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
   * @param childrenKey - 子节点的键名。
   * @returns 返回布尔值，表示是否遇到了回调函数返回 `false` 的节点。
   */
  dft<T extends Record<string, any>>(
    data: T,
    cb: (item: T) => boolean | void,
    childrenKey = 'children'
  ) {
    if (cb(data) === false) return false

    let children = data[childrenKey]
    if (children) {
      let i = 0
      while (i < children.length) {
        if (Tree.dft(children[i], cb, childrenKey) === false) break
        i++
      }
    }
  },

  /**
   * 广度优先遍历树结构
   * @param root - 根节点
   * @param cb - 遍历回调函数，返回值为false时中断遍历
   * @param childrenKey - 子节点属性名，默认为'children'
   */
  bft<T extends Record<string, any>>(
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
  },

  /**
   * 获取节点的子节点
   * @param node 节点
   * @param matcher 匹配函数，用于判断节点是否符合条件
   * @param childrenKey 子节点键名，默认为'children'
   * @returns 符合条件的子节点数组
   */
  getChildren<Node extends Record<string, any>>(
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
  },

  /**
   * 获取满足条件的第一个子节点。
   *
   * @param node - 父节点。
   * @param matcher - 匹配子节点的条件。
   * @param childrenKey - 访问父节点中子节点的键。
   * @returns 第一个满足条件的子节点，如果没有匹配项则返回 null。
   */
  getChild<Node extends Record<string, any>>(
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
  },

  flat() {}
}

export { TreeNode }
