import { Tree, TreeNode } from './tree'

describe('树', () => {
  const treeData = {
    id: 1,
    children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }, { id: 5 }]
  }
  const tree = Tree.create(treeData, (v, index, parent) => {
    return new TreeNode(v, index, parent)
  })

  test('深度', () => {
    expect(tree.children![0]!.depth).toBe(1)
  })

  test('是否是叶子节点', () => {
    expect(tree.children![0]!.isLeaf).toBeTruthy()
    expect(tree.isLeaf).toBeFalsy()
  })

  test('深度优先遍历', () => {
    let arr: number[] = []
    Tree.dft(tree, v => {
      arr.push(v.value.id)
    })

    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  test('广度优先遍历', () => {
    let arr: number[] = []
    Tree.bft(tree, v => {
      arr.push(v.value.id)
    })

    expect(arr).toEqual([1, 2, 3, 5, 4])
  })

  test('追加节点', () => {
    tree.append(index => new TreeNode({ id: 6 }, index))

    expect(tree.children![3]!.value.id).toEqual(6)
  })

  test('当前位置下个位置插入', () => {
    tree.children![0]!.addToNext(index => new TreeNode({ id: 7 }, index))

    expect(tree.children![1]!.value.id).toEqual(7)
  })

  test('当前位置上个位置插入', () => {
    tree.children![0]!.addToPrev(index => new TreeNode({ id: 8 }, index))

    expect(tree.children![0]!.value.id).toEqual(8)
  })

  test('删除节点', () => {
    Tree.bft(tree, v => {
      if ([6, 7, 8].includes(v.value.id)) {
        v.remove()
      }
    })

    expect(tree.children![3]).toBeUndefined()
  })

  test('获取单个子节点', () => {
    const child = Tree.getChild(tree, v => v.value.id === 3)
    expect(child?.value.id).toBe(3)
  })

  test('获取多个', () => {
    const children = Tree.getChildren(tree, v => v.value.id < 4)
    expect(children.length).toBe(3)
  })
})
