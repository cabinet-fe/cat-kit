import { TreeNode, createNode } from './tree'

export class ForestNode<
  Data extends Record<string, any> = Record<string, any>
> extends TreeNode<Data> {
  readonly forest: Forest<Data, ForestNode<Data>>

  constructor(data: Data, forest: Forest<Data, ForestNode<Data>>) {
    super(data)
    this.forest = forest
  }

  override remove() {
    const { parent, index, forest } = this
    if (parent) {
      parent.children!.splice(index, 1)
    } else {
      const { roots } = forest
      roots.splice(index, 1)
      for (let i = index; i < roots.length; i++) {
        roots[i]!.index = i
      }
    }
  }
}

export class Forest<
  Data extends Record<string, any>,
  Node extends ForestNode<Data>
> {
  roots: Node[] = []

  constructor(options: {
    data: Data[]
    ForestNode: new (data: Data, forest: Forest<Data, any>) => Node
    childrenKey?: string
  }) {
    const { data, ForestNode, childrenKey = 'children' } = options

    this.roots = data.map((item, index) => {
      return createNode({
        data: item,
        childrenKey,
        index,
        getNode: data => {
          return new ForestNode(data, this)
        }
      })
    })
  }

  dfs(cb: (node: Node) => void | boolean) {
    this.roots.forEach(root => root.dfs(cb))
  }
}
