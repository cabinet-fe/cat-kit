

class Tree<D> {
  data!: D

  parent?: Tree<D>

  leafs = new Set<Tree<D>>()

  depth: number = 1

  children?: Tree<D>[]

  constructor(data: D, parent?: Tree<D>) {
    this.data = data
    if (parent) {
      this.parent = parent
    }
    if (Array.isArray(data)) {

    }
  }

  /**
   * 移除某个节点, 传入数据时进行搜索, 不穿则移除自身
   * @param data 数据
   */
  remove(data?: D) {
    if (data) {
      return this.walk((node) => {
        if (node.data === data) node.remove()
      })
    }

    if (!this.parent) return

    this.parent.children = this.parent.children!.filter(child => child !== this)
  }

  /**
   * 从当前节点开始遍历
   * @param cb 回调
   * @param type 遍历类型 df深度优先 bf广度优先 back回朔
   */
  walk(cb: (tree: Tree<D>) => void, type: 'df' | 'bf' | 'back' = 'df') {

  }

  /**
   * 往当前树的子树中插入一条数据
   * @param data 数据
   */
  insert(data: D) {
    const node = new Tree(data, this)
    if (this.children) {
      this.children.push(node)
    } else {
      this.children = [node]
    }
  }

}



export default Tree