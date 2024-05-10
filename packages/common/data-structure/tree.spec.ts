import { Forest, Tree, TreeNode } from './tree'

class Node<Val extends Record<string, any>> extends TreeNode<Val> {
  parent: Node<Val> | null = null

  override children?: Node<Val>[]

  disabled = false
}

type ChildData = { id: number; children?: ChildData[] }

describe('树', () => {
  const treeData: ChildData = {
    id: 1,
    children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }, { id: 5 }]
  } as {
    id: number
  }
  const tree = Tree.create(treeData, Node, {
    onNodeCreated(node) {
      node.disabled = true
    }
  })

  test('节点创建回调', () => {
    expect(tree.root.disabled).toBeTruthy()
  })

  test('数量', () => {
    expect(tree.size).toBe(5)
    expect(tree.root.children![1].size).toBe(2)
  })

  test('深度', () => {
    expect(tree.root.children![0]!.depth).toBe(1)
  })

  test('是否是叶子节点', () => {
    expect(tree.root.children![0]!.isLeaf).toBeTruthy()
    expect(tree.root.isLeaf).toBeFalsy()
  })

  test('深度优先遍历', () => {
    let arr: number[] = []
    Tree.dft(tree.root, v => {
      arr.push(v.value.id)
    })

    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  test('广度优先遍历', () => {
    let arr: number[] = []
    Tree.bft(tree.root, v => {
      arr.push(v.value.id)
    })

    expect(arr).toEqual([1, 2, 3, 5, 4])
  })

  test('追加节点', () => {
    tree.root.append({ id: 6 })

    expect(tree.root.children![3]!.value.id).toEqual(6)
  })

  test('当前位置下个位置插入', () => {
    tree.root.children![0]!.addToNext({ id: 7 })

    expect(tree.root.children![1]!.value.id).toEqual(7)
  })

  test('当前位置上个位置插入', () => {
    tree.root.children![0]!.addToPrev({ id: 8 })

    expect(tree.root.children![0]!.value.id).toEqual(8)
  })

  test('删除节点', () => {
    Tree.bft(tree.root, v => {
      if ([6, 7, 8].includes(v.value.id)) {
        v.remove()
      }
    })

    expect(tree.root.children![3]).toBeUndefined()
  })

  test('获取单个子节点', () => {
    const child = Tree.getChild(tree.root, v => v.value.id === 3)
    expect(child?.value.id).toBe(3)
  })

  test('获取多个', () => {
    const children = Tree.getChildren(tree.root, v => v.value.id < 4)
    expect(children.length).toBe(3)
  })

  const forest = Forest.create(
    [
      { id: 1, children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }] },
      { id: 5 }
    ],
    Node
  )
  test('森林', () => {
    const bftQueue: number[] = []
    const dftQueue: number[] = []

    forest.bft(node => {
      bftQueue.push(node.value.id)
    })

    forest.dft(node => {
      dftQueue.push(node.value.id)
    })

    expect(bftQueue).toEqual([1, 5, 2, 3, 4])
    expect(dftQueue).toEqual([1, 2, 3, 4, 5])
  })
})
