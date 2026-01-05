import { describe, it, expect } from 'vitest'
import { TreeNode, TreeManager } from '@cat-kit/core/src'

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

    it('深度优先遍历应提供正确的 index 与 parent', () => {
      const root = new TreeNode({ id: 1, name: 'root' })
      const child1 = new TreeNode({ id: 2, name: 'child1' })
      const child2 = new TreeNode({ id: 3, name: 'child2' })

      root.children = [child1, child2]
      child1.parent = root
      child2.parent = root

      root.dfs((node, index, parent) => {
        if (node === root) {
          expect(index).toBe(0)
          expect(parent).toBeUndefined()
        }
        if (node === child1) {
          expect(index).toBe(0)
          expect(parent).toBe(root)
        }
        if (node === child2) {
          expect(index).toBe(1)
          expect(parent).toBe(root)
        }
      })
    })

    it('应该广度优先遍历', () => {
      const root = new TreeNode({ id: 1, name: 'root' })
      const child1 = new TreeNode({ id: 2, name: 'child1' })
      const child2 = new TreeNode({ id: 3, name: 'child2' })

      root.children = [child1, child2]

      const visited: number[] = []
      root.bfs((node, index, parent) => {
        visited.push(node.data.id)
        if (node === root) {
          expect(index).toBe(0)
          expect(parent).toBeUndefined()
        }
        if (node === child1) {
          expect(index).toBe(0)
          expect(parent).toBe(root)
        }
        if (node === child2) {
          expect(index).toBe(1)
          expect(parent).toBe(root)
        }
      })

      expect(visited).toEqual([1, 2, 3])
    })

    it('应该支持遍历中断', () => {
      const root = new TreeNode({ id: 1 })
      const child1 = new TreeNode({ id: 2 })
      const child2 = new TreeNode({ id: 3 })

      root.children = [child1, child2]

      const visited: number[] = []
      root.dfs(node => {
        visited.push(node.data.id)
        if (node.data.id === 2) return true // 返回 true 终止 dfs
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
      expect(child1.parent).toBeUndefined()
    })

    it('应该插入子节点到末尾', () => {
      const root = new TreeNode({ id: 1 })
      const child1 = new TreeNode({ id: 2 })
      const child2 = new TreeNode({ id: 3 })

      root.insert(child1)
      root.insert(child2)

      expect(root.children).toHaveLength(2)
      expect(root.children![0]).toBe(child1)
      expect(root.children![1]).toBe(child2)
      expect(child1.index).toBe(0)
      expect(child2.index).toBe(1)
      expect(child1.parent).toBe(root)
      expect(child2.parent).toBe(root)
      expect(child1.depth).toBe(1)
      expect(root.isLeaf).toBe(false)
    })

    it('应该插入子节点到指定位置', () => {
      const root = new TreeNode({ id: 1 })
      const child1 = new TreeNode({ id: 2 })
      const child2 = new TreeNode({ id: 3 })
      const child3 = new TreeNode({ id: 4 })

      root.insert(child1)
      root.insert(child3)
      root.insert(child2, 1) // 插入到中间

      expect(root.children).toHaveLength(3)
      expect(root.children![0]).toBe(child1)
      expect(root.children![1]).toBe(child2)
      expect(root.children![2]).toBe(child3)
      expect(child1.index).toBe(0)
      expect(child2.index).toBe(1)
      expect(child3.index).toBe(2)
    })

    it('插入已有父节点的节点时应先移除', () => {
      const root1 = new TreeNode({ id: 1 })
      const root2 = new TreeNode({ id: 2 })
      const child = new TreeNode({ id: 3 })

      root1.insert(child)
      expect(root1.children).toHaveLength(1)

      root2.insert(child)
      expect(root1.children).toHaveLength(0)
      expect(root2.children).toHaveLength(1)
      expect(child.parent).toBe(root2)
    })
  })

  describe('TreeManager', () => {
    it('应该直接使用原始数据创建树（不传 createNode）', () => {
      const data = {
        id: 1,
        name: 'root',
        children: [
          { id: 2, name: 'child1' },
          { id: 3, name: 'child2' }
        ]
      }

      const tree = new TreeManager(data)

      expect(tree.root).toBe(data) // 直接使用原始数据
      expect(tree.root.id).toBe(1)
    })

    it('应该使用 createNode 构建自定义节点树', () => {
      const data = {
        id: 1,
        name: 'root',
        children: [
          { id: 2, name: 'child1' },
          { id: 3, name: 'child2' }
        ]
      }

      const tree = new TreeManager(data, {
        createNode: (d, i) => new TreeNode(d)
      })

      expect(tree.root).toBeInstanceOf(TreeNode)
      expect(tree.root.data.id).toBe(1)
      expect(tree.root.children).toHaveLength(2)
      expect(tree.root.children![0]!.data.id).toBe(2)
      expect(tree.root.children![1]!.data.id).toBe(3)
    })

    it('应该查找节点', () => {
      const data = {
        id: 1,
        children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }]
      }

      const tree = new TreeManager(data, {
        createNode: (d, i) => new TreeNode(d)
      })
      const found = tree.find(node => node.data.id === 4)

      expect(found).not.toBeNull()
      expect(found?.data.id).toBe(4)
    })

    it('应该返回 null 当未找到节点', () => {
      const data = { id: 1, children: [{ id: 2 }] }
      const tree = new TreeManager(data, {
        createNode: (d, i) => new TreeNode(d)
      })
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

      const tree = new TreeManager(data, {
        createNode: (d, i) => new TreeNode(d)
      })
      const files = tree.findAll(node => node.data.type === 'file')

      expect(files).toHaveLength(2)
      expect(files.map(n => n.data.id)).toEqual([2, 3])
    })

    it('应该支持自定义 childrenKey', () => {
      const data = {
        id: 1,
        items: [{ id: 2 }, { id: 3 }]
      }

      const tree = new TreeManager(data, {
        createNode: (d, i) => new TreeNode(d),
        childrenKey: 'items'
      })

      expect(tree.root.children).toHaveLength(2)
    })

    it('应该碾平节点', () => {
      const data = {
        id: 1,
        children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }]
      }

      const tree = new TreeManager(data, {
        createNode: (d, i) => new TreeNode(d)
      })
      const flattened = tree.flatten()

      expect(flattened).toHaveLength(4)
      expect(flattened.map(n => n.data.id)).toEqual([1, 2, 3, 4])
    })

    it('应该支持碾平时过滤', () => {
      const data = {
        id: 1,
        type: 'folder',
        children: [
          { id: 2, type: 'file' },
          { id: 3, type: 'folder', children: [{ id: 4, type: 'file' }] }
        ]
      }

      const tree = new TreeManager(data, {
        createNode: (d, i) => new TreeNode(d)
      })
      const files = tree.flatten(node => node.data.type === 'file')

      expect(files).toHaveLength(2)
      expect(files.map(n => n.data.id)).toEqual([2, 4])
    })
  })
})
