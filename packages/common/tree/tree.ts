interface TreeVal {
  [key: string]: any
  children?: TreeVal[]
}

class TreeNode<Val extends TreeVal> {
  /** 值 */
  val: Val

  /** 父节点 */
  parent?: TreeNode<Val>

  /** 子节点 */
  children?: TreeNode<Val>[]

  /** 深度 */
  depth = 1

  constructor(val: Val, parent?: TreeNode<Val>) {
    this.val = val
    if (val.children) {
      this.children = val.children.map(child => new TreeNode(child, this))
    }

    if (parent) {
      this.parent = parent
    }
  }

  /**
   * 从当前节点开始深度优先遍历
   * @param cb 回调
   */
  dfs(cb: (tree: TreeNode<Val>) => void) {
    cb(this)
    this.children?.forEach(child => child.dfs(cb))
  }

  /**
   * 从当前节点开始广度优先遍历
   * @param cb 回调
   */
  bfs(cb: (tree: TreeNode<Val>) => void) {
    const queue: TreeNode<Val>[] = [this]
    while (queue.length > 0) {
      const node = queue.shift()!
      cb(node)
      if (node.children?.length) {
        queue.push(...node.children)
      }
    }
  }
}

class Tree<V extends TreeVal> {
  root: TreeNode<V>

  leafs = new Set<Tree<V>>()

  constructor(root: TreeNode<V>) {
    this.root = root
  }

  insert(node: TreeNode<V>, val: V) {
    const child = new TreeNode(val, node)

    if (node.children) return child
  }

  /**
   * 从当前节点开始遍历
   * @param cb 回调
   * @param type 遍历类型 dfs深度优先 bfs广度优先
   */
  walk(cb: (node: TreeNode<V>) => void, type: 'dfs' | 'bfs' = 'dfs') {
    this.root[type](cb)
  }

  /**
   * 移除某个节点, 传入数据时进行搜索, 不穿则移除自身
   * @param target 要删除的目标节点
   */
  remove(target: TreeNode<V>) {
    const { parent } = target
    if (parent?.children) {
      parent.children.splice(parent.children.indexOf(target), 1)
    }
  }
}

function createTree<
  D extends TreeVal[] | TreeVal,
  V extends TreeVal = D extends Array<any> ? D[number] : D
>(data: D): Tree<V> {
  const root = new TreeNode(Array.isArray(data) ? { children: data } : data)

  const tree = new Tree(root)

  return tree as any
}

const tree = createTree([{ name: '' }])

tree.walk(node => {
  node.val.name
})

export default createTree
