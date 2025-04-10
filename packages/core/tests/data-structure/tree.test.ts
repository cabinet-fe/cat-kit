import { describe, expect, test, beforeEach } from 'bun:test'
import { Tree, TreeNode, createTree } from '../../src/data-structure/tree'

describe('树数据结构测试', () => {
  describe('Tree基本操作', () => {
    test('应该能创建一个空树', () => {
      const tree = new Tree<number>()
      expect(tree.getRoot()).toBeNull()
    })

    test('应该能用数据创建树', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()

      expect(root).not.toBeNull()
      expect(root?.data).toBe(1)
      expect(root?.children).toEqual([])
    })

    test('应该能用节点创建树', () => {
      const node: TreeNode<string> = {
        data: 'root',
        children: []
      }
      const tree = new Tree<string>(node)

      expect(tree.getRoot()).toBe(node)
    })

    test('createTree工厂函数应该正确创建树', () => {
      const tree = createTree<number>(1)
      expect(tree.getRoot()?.data).toBe(1)
    })
  })

  describe('节点操作', () => {
    test('addChild应该正确添加子节点', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!

      const child = tree.addChild(root, 2)

      expect(child.data).toBe(2)
      expect(root.children).toContain(child)
      expect(child.parent).toBe(root)
    })

    test('removeChild应该正确移除子节点', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!

      const child1 = tree.addChild(root, 2)
      const child2 = tree.addChild(root, 3)

      expect(root.children?.length).toBe(2)

      const removed = tree.removeChild(root, child1)

      expect(removed).toBe(child1)
      expect(root.children?.length).toBe(1)
      expect(root.children?.[0]).toBe(child2)
    })

    test('removeChild应该能通过索引移除子节点', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!

      tree.addChild(root, 2)
      tree.addChild(root, 3)

      const removed = tree.removeChild(root, 0)

      expect(removed?.data).toBe(2)
      expect(root.children?.length).toBe(1)
      expect(root.children?.[0].data).toBe(3)
    })
  })

  describe('树遍历', () => {
    let tree: Tree<number>
    let root: TreeNode<number>
    let child1: TreeNode<number>
    let child2: TreeNode<number>
    let grandchild1: TreeNode<number>

    beforeEach(() => {
      tree = new Tree<number>(1)
      root = tree.getRoot()!
      child1 = tree.addChild(root, 2)
      child2 = tree.addChild(root, 3)
      grandchild1 = tree.addChild(child1, 4)
    })

    test('preOrderTraverse应该按前序遍历顺序访问节点', () => {
      const visited: number[] = []

      tree.preOrderTraverse(node => {
        visited.push(node.data)
      })

      expect(visited).toEqual([1, 2, 4, 3])
    })

    test('postOrderTraverse应该按后序遍历顺序访问节点', () => {
      const visited: number[] = []

      tree.postOrderTraverse(node => {
        visited.push(node.data)
      })

      expect(visited).toEqual([4, 2, 3, 1])
    })

    test('levelOrderTraverse应该按层序遍历顺序访问节点', () => {
      const visited: number[] = []

      tree.levelOrderTraverse(node => {
        visited.push(node.data)
      })

      expect(visited).toEqual([1, 2, 3, 4])
    })

    test('findNode应该能找到满足条件的节点', () => {
      const found = tree.findNode(node => node.data === 4)

      expect(found).toBe(grandchild1)
    })
  })

  describe('树属性', () => {
    test('getNodeDepth应该正确计算节点深度', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!
      const child = tree.addChild(root, 2)
      const grandchild = tree.addChild(child, 3)

      expect(tree.getNodeDepth(root)).toBe(0)
      expect(tree.getNodeDepth(child)).toBe(1)
      expect(tree.getNodeDepth(grandchild)).toBe(2)
    })

    test('getNodeHeight应该正确计算节点高度', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!
      const child = tree.addChild(root, 2)
      tree.addChild(child, 3)

      expect(tree.getNodeHeight(root)).toBe(2)
      expect(tree.getNodeHeight(child)).toBe(1)
    })

    test('getSize应该正确计算树的节点数量', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!
      const child = tree.addChild(root, 2)
      tree.addChild(root, 3)
      tree.addChild(child, 4)

      expect(tree.getSize()).toBe(4)
    })
  })

  describe('其他方法', () => {
    test('clear应该清空树', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!
      tree.addChild(root, 2)

      tree.clear()

      expect(tree.getRoot()).toBeNull()
    })

    test('toArray应该返回所有节点数组', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!
      const child1 = tree.addChild(root, 2)
      const child2 = tree.addChild(root, 3)

      const array = tree.toArray()

      expect(array).toHaveLength(3)
      expect(array).toContain(root)
      expect(array).toContain(child1)
      expect(array).toContain(child2)
    })

    test('toFlatArray应该转换节点并返回数组', () => {
      const tree = new Tree<number>(1)
      const root = tree.getRoot()!
      tree.addChild(root, 2)
      tree.addChild(root, 3)

      const flatArray = tree.toFlatArray((node, depth) => ({
        value: node.data,
        depth
      }))

      expect(flatArray).toHaveLength(3)
      expect(flatArray[0]).toEqual({ value: 1, depth: 0 })
      expect(flatArray[1]).toEqual({ value: 2, depth: 1 })
      expect(flatArray[2]).toEqual({ value: 3, depth: 1 })
    })
  })
})
