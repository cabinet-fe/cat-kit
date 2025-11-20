import { describe, it, expect } from 'vitest'
import { TreeNode, Tree } from '@cat-kit/core/src'

describe('树结构', () => {
  describe('TreeNode', () => {
    it('应该创建树节点', () => {
      const data = { id: 1, name: 'root' }
      const node = new TreeNode(data)

      expect(node.data).toBe(data)
      expect(node.depth).toBe(0)
      expect(node.index).toBe(0)
      expect(node.isLeaf).toBe(false)
    })

    it('应该深度优先遍历', () => {
      const root = new TreeNode({ id: 1, name: 'root' })
      const child1 = new TreeNode({ id: 2, name: 'child1' })
      const child2 = new TreeNode({ id: 3, name: 'child2' })

      root.children = [child1, child2]
      child1.parent = root
      child2.parent = root

      const visited: number[] = []
      root.dfs(node => {
        visited.push(node.data.id)
      })

      expect(visited).toEqual([1, 2, 3])
    })

    it('应该广度优先遍历', () => {
      const root = new TreeNode({ id: 1, name: 'root' })
      const child1 = new TreeNode({ id: 2, name: 'child1' })
      const child2 = new TreeNode({ id: 3, name: 'child2' })

      root.children = [child1, child2]

      const visited: number[] = []
      root.bfs(node => {
        visited.push(node.data.id)
      })

      expect(visited).toContain(1)
      expect(visited).toContain(2)
      expect(visited).toContain(3)
    })

    it('应该支持遍历中断', () => {
      const root = new TreeNode({ id: 1 })
      const child1 = new TreeNode({ id: 2 })
      const child2 = new TreeNode({ id: 3 })

      root.children = [child1, child2]

      const visited: number[] = []
      root.dfs(node => {
        visited.push(node.data.id)
        if (node.data.id === 2) return false
      })

      expect(visited).toEqual([1, 2])
    })

    it('应该移除节点', () => {
      const root = new TreeNode({ id: 1 })
      const child1 = new TreeNode({ id: 2 })
      const child2 = new TreeNode({ id: 3 })

      child1.index = 0
      child2.index = 1
      child1.parent = root
      child2.parent = root
      root.children = [child1, child2]

      child1.remove()

      expect(root.children).toHaveLength(1)
      expect(root.children![0]).toBe(child2)
      expect(child2.index).toBe(0)
    })
  })


  describe('Tree', () => {
    it('应该创建树', () => {
      const data = {
        id: 1,
        name: 'root',
        children: [
          { id: 2, name: 'child1' },
          { id: 3, name: 'child2' }
        ]
      }

      const tree = new Tree({ data, TreeNode })

      expect(tree.root.data.id).toBe(1)
      expect(tree.root.children).toHaveLength(2)
    })

    it('应该查找节点', () => {
      const data = {
        id: 1,
        children: [
          { id: 2 },
          { id: 3, children: [{ id: 4 }] }
        ]
      }

      const tree = new Tree({ data, TreeNode })
      const found = tree.find(node => node.data.id === 4)

      expect(found).not.toBeNull()
      expect(found?.data.id).toBe(4)
    })

    it('应该返回 null 当未找到节点', () => {
      const data = { id: 1, children: [{ id: 2 }] }
      const tree = new Tree({ data, TreeNode })
      const found = tree.find(node => node.data.id === 999)

      expect(found).toBeNull()
    })

    it('应该查找所有符合条件的节点', () => {
      const data = {
        id: 1,
        type: 'folder',
        children: [
          { id: 2, type: 'file' },
          { id: 3, type: 'file' },
          { id: 4, type: 'folder' }
        ]
      }

      const tree = new Tree({ data, TreeNode })
      const files = tree.findAll(node => node.data.type === 'file')

      expect(files).toHaveLength(2)
      expect(files.map(n => n.data.id)).toEqual([2, 3])
    })

    it('应该支持自定义 childrenKey', () => {
      const data = {
        id: 1,
        items: [{ id: 2 }, { id: 3 }]
      }

      const tree = new Tree({
        data,
        TreeNode,
        childrenKey: 'items'
      })

      expect(tree.root.children).toHaveLength(2)
    })
  })
})

