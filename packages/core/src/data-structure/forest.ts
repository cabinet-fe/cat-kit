import { dfs, TreeNode } from './tree'

export class ForestNode<
  Data extends Record<string, any> = Record<string, any>
> extends TreeNode<Data> {
  readonly forest: Forest<Data, ForestNode<Data>>

  constructor(data: Data, forest: Forest<Data, ForestNode<Data>>) {
    super(data)
    this.forest = forest
  }

  override remove(): void {
    const { parent, index, forest } = this
    if (parent) {
      if (!parent.children?.length) return

      // index 可能过期，做一次兜底校验
      let removeIndex = index
      if (parent.children[removeIndex] !== this) {
        removeIndex = parent.children.indexOf(this)
        if (removeIndex === -1) return
      }

      parent.children.splice(removeIndex, 1)
      for (let i = removeIndex; i < parent.children.length; i++) {
        parent.children[i]!.index = i
      }
      parent.isLeaf = parent.children.length === 0
      this.parent = undefined
    } else {
      const { roots } = forest
      let removeIndex = index
      if (roots[removeIndex] !== this) {
        removeIndex = roots.indexOf(this as any)
        if (removeIndex === -1) return
      }
      roots.splice(removeIndex, 1)
      for (let i = removeIndex; i < roots.length; i++) {
        roots[i]!.index = i
      }
    }
  }
}

export interface ForestOptions<
  Data extends Record<string, any>,
  Node extends ForestNode<Data>
> {
  data: Data[]
  createNode: (data: Data) => Node
  childrenKey?: string
}

export class Forest<
  Data extends Record<string, any>,
  Node extends ForestNode<Data>
> {
  roots: Node[] = []
  protected childrenKey: string

  constructor(options: ForestOptions<Data, Node>) {
    const { data, createNode, childrenKey = 'children' } = options
    this.childrenKey = childrenKey

    this.roots = data.map((item, index) => {
      return this.buildTree(item, index, createNode)
    })
  }

  /**
   * 递归构建单棵树
   */
  private buildTree(
    data: Data,
    rootIndex: number,
    createNode: (data: Data) => Node
  ): Node {
    const { childrenKey } = this
    const root = createNode(data)
    root.index = rootIndex
    root.depth = 0

    // 使用显式栈实现递归构建
    const dataStack: Data[] = [data]
    const nodeStack: Node[] = [root]
    let sp = 1

    while (sp) {
      sp--
      const curData = dataStack[sp]!
      const curNode = nodeStack[sp]!

      const dataChildren = curData[childrenKey]
      if (Array.isArray(dataChildren) && dataChildren.length) {
        const childrenNodes = new Array(dataChildren.length) as Node[]
        curNode.children = childrenNodes
        curNode.isLeaf = false

        // 倒序压栈，保证遍历顺序与数组顺序一致
        for (let i = dataChildren.length - 1; i >= 0; i--) {
          const childData = dataChildren[i]
          const childNode = createNode(childData)
          childNode.parent = curNode
          childNode.depth = curNode.depth + 1
          childNode.index = i
          childrenNodes[i] = childNode

          dataStack[sp] = childData
          nodeStack[sp] = childNode
          sp++
        }
      } else {
        curNode.isLeaf = true
      }
    }

    return root
  }

  /**
   * 深度优先遍历所有树
   */
  dfs(cb: (node: Node) => void | boolean): void {
    for (const root of this.roots) {
      dfs(
        root as unknown as Record<string, unknown>,
        cb as any,
        this.childrenKey
      )
    }
  }
}
