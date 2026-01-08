import { describe, it, expect } from 'vitest'
import { Forest, ForestNode, type IForestNode } from '@cat-kit/core/src'

type DataItem = {
  id: number
  name?: string
  type?: string
  children?: DataItem[]
}

describe('森林结构', () => {
  describe('ForestNode', () => {
    it('应该创建森林节点', () => {
      const forest = new Forest<DataItem, ForestNode<DataItem>>({
        data: [],
        createNode: (data, index, depth, forest, parent) =>
          new ForestNode(data, index, depth, forest, parent)
      })

      const data = { id: 1, name: 'root' }
      const node = new ForestNode(data, 0, 0, forest)

      expect(node.data).toBe(data)
      expect(node.depth).toBe(0)
      expect(node.index).toBe(0)
      expect(node.forest).toBe(forest)
    })

    it('应该从父节点中移除节点', () => {
      const forest = new Forest<DataItem, ForestNode<DataItem>>({
        data: [
          {
            id: 1,
            children: [{ id: 2 }, { id: 3 }]
          }
        ],
        createNode: (data, index, depth, forest, parent) =>
          new ForestNode(data, index, depth, forest, parent)
      })

      const root = forest.roots[0]!
      const child1 = root.children![0]!
      const child2 = root.children![1]!

      child1.remove()

      expect(root.children).toHaveLength(1)
      expect(root.children![0]).toBe(child2)
      expect(child2.index).toBe(0)
    })

    it('应该从森林根节点列表中移除节点', () => {
      const forest = new Forest<DataItem, ForestNode<DataItem>>({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        createNode: (data, index, depth, forest, parent) =>
          new ForestNode(data, index, depth, forest, parent)
      })

      expect(forest.roots).toHaveLength(3)

      const root1 = forest.roots[0]!
      root1.remove()

      expect(forest.roots).toHaveLength(2)
      expect(forest.roots[0]!.data.id).toBe(2)
      expect(forest.roots[0]!.index).toBe(0)
      expect(forest.roots[1]!.data.id).toBe(3)
      expect(forest.roots[1]!.index).toBe(1)
    })
  })

  describe('Forest', () => {
    it('应该直接使用原始数据创建森林（不传 createNode）', () => {
      const data: DataItem[] = [
        { id: 1, children: [{ id: 2 }] },
        { id: 3 }
      ]

      const forest = new Forest({ data })

      expect(forest.roots).toBe(data)
      expect(forest.roots[0]!.id).toBe(1)
    })

    it('应该使用 createNode 构建森林', () => {
      const data: DataItem[] = [
        { id: 1, children: [{ id: 2 }] },
        { id: 3 }
      ]

      const forest = new Forest({
        data,
        createNode: (d, index, depth, forest, parent) =>
          new ForestNode(d, index, depth, forest, parent)
      })

      expect(forest.roots).toHaveLength(2)
      expect(forest.roots[0]).toBeInstanceOf(ForestNode)
      expect(forest.roots[0]!.data.id).toBe(1)
      expect(forest.roots[0]!.children![0]!.data.id).toBe(2)
    })

    it('应该使用 IForestNode 接口创建节点', () => {
      const data: DataItem[] = [
        { id: 1, children: [{ id: 2 }] }
      ]

      const forest = new Forest({
        data,
        createNode: (data, index, depth, forest, parent): IForestNode<DataItem> => ({
          data,
          index,
          depth,
          forest,
          get isLeaf() {
            return !data.children?.length
          },
          parent
        })
      })

      expect(forest.roots[0]!.data.id).toBe(1)
      expect(forest.roots[0]!.isLeaf).toBe(false)
      expect(forest.roots[0]!.children![0]!.isLeaf).toBe(true)
    })

    it('构建的节点应该有正确的 depth 和 index', () => {
      const data: DataItem[] = [
        { id: 1, children: [{ id: 3 }, { id: 4 }] },
        { id: 2 }
      ]

      const forest = new Forest({
        data,
        createNode: (d, index, depth, forest, parent) =>
          new ForestNode(d, index, depth, forest, parent)
      })

      // 根节点
      expect(forest.roots[0]!.index).toBe(0)
      expect(forest.roots[0]!.depth).toBe(0)
      expect(forest.roots[1]!.index).toBe(1)
      expect(forest.roots[1]!.depth).toBe(0)

      // 子节点
      expect(forest.roots[0]!.children![0]!.index).toBe(0)
      expect(forest.roots[0]!.children![0]!.depth).toBe(1)
      expect(forest.roots[0]!.children![1]!.index).toBe(1)
    })

    it('应该支持自定义 childrenKey', () => {
      const data = [
        { id: 1, items: [{ id: 2 }] }
      ]

      const forest = new Forest({
        data,
        createNode: (d, index, depth, forest, parent) =>
          new ForestNode(d as DataItem, index, depth, forest, parent),
        childrenKey: 'items'
      })

      expect(forest.roots[0]!.children).toHaveLength(1)
    })

    describe('dfs 方法', () => {
      it('应该深度优先遍历所有树', () => {
        const data: DataItem[] = [
          { id: 1, children: [{ id: 2 }] },
          { id: 3, children: [{ id: 4 }] }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const visited: number[] = []
        forest.dfs(node => {
          visited.push(node.data.id)
        })

        expect(visited).toEqual([1, 2, 3, 4])
      })
    })

    describe('bfs 方法', () => {
      it('应该广度优先遍历所有树', () => {
        const data: DataItem[] = [
          { id: 1, children: [{ id: 3 }] },
          { id: 2, children: [{ id: 4 }] }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const visited: number[] = []
        forest.bfs(node => {
          visited.push(node.data.id)
        })

        // 每棵树单独做 BFS
        expect(visited).toEqual([1, 3, 2, 4])
      })
    })

    describe('flatten 方法', () => {
      it('应该扁平化所有节点', () => {
        const data: DataItem[] = [
          { id: 1, children: [{ id: 2 }] },
          { id: 3 }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const flattened = forest.flatten()

        expect(flattened).toHaveLength(3)
        expect(flattened.map(n => n.data.id)).toEqual([1, 2, 3])
      })

      it('应该支持过滤', () => {
        const data: DataItem[] = [
          { id: 1, type: 'folder', children: [{ id: 2, type: 'file' }] },
          { id: 3, type: 'file' }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const files = forest.flatten(node => node.data.type === 'file')

        expect(files).toHaveLength(2)
        expect(files.map(n => n.data.id)).toEqual([2, 3])
      })
    })

    describe('find 方法', () => {
      it('应该在所有树中查找节点', () => {
        const data: DataItem[] = [
          { id: 1, children: [{ id: 2 }] },
          { id: 3, children: [{ id: 4 }] }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const found = forest.find(node => node.data.id === 4)

        expect(found).not.toBeNull()
        expect(found?.data.id).toBe(4)
      })

      it('未找到时应返回 null', () => {
        const data: DataItem[] = [{ id: 1 }]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const found = forest.find(node => node.data.id === 999)

        expect(found).toBeNull()
      })
    })

    describe('findAll 方法', () => {
      it('应该查找所有符合条件的节点', () => {
        const data: DataItem[] = [
          { id: 1, type: 'folder', children: [{ id: 2, type: 'file' }] },
          { id: 3, type: 'file' }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const files = forest.findAll(node => node.data.type === 'file')

        expect(files).toHaveLength(2)
      })
    })

    describe('getLeaves 方法', () => {
      it('应该获取所有叶子节点', () => {
        const data: DataItem[] = [
          { id: 1, children: [{ id: 2 }, { id: 3 }] },
          { id: 4 }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        const leaves = forest.getLeaves()

        expect(leaves).toHaveLength(3)
        expect(leaves.map(n => n.data.id)).toEqual([2, 3, 4])
      })
    })

    describe('size 属性', () => {
      it('应该返回节点总数', () => {
        const data: DataItem[] = [
          { id: 1, children: [{ id: 2 }] },
          { id: 3 }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        expect(forest.size).toBe(3)
      })

      it('空森林的大小应为 0', () => {
        const forest = new Forest<DataItem, ForestNode<DataItem>>({
          data: [],
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        expect(forest.size).toBe(0)
      })
    })

    describe('getMaxDepth 方法', () => {
      it('应该计算所有树的最大深度', () => {
        const data: DataItem[] = [
          { id: 1, children: [{ id: 2 }] },
          { id: 3, children: [{ id: 4, children: [{ id: 5 }] }] }
        ]

        const forest = new Forest({
          data,
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        expect(forest.getMaxDepth()).toBe(2)
      })

      it('空森林的最大深度应为 0', () => {
        const forest = new Forest<DataItem, ForestNode<DataItem>>({
          data: [],
          createNode: (d, index, depth, forest, parent) =>
            new ForestNode(d, index, depth, forest, parent)
        })

        expect(forest.getMaxDepth()).toBe(0)
      })
    })

    describe('增量更新方法（虚拟滚动优化）', () => {
      interface ExpandableForestNode extends ForestNode<DataItem> {
        expanded: boolean
      }

      function createExpandableForest(data: DataItem[]) {
        return new Forest({
          data,
          createNode: (d, index, depth, forest, parent): ExpandableForestNode => {
            const node = new ForestNode(
              d,
              index,
              depth,
              forest as Forest<DataItem, ExpandableForestNode>,
              parent
            ) as ExpandableForestNode
            node.expanded = false
            return node
          }
        })
      }

      describe('flattenVisible 方法', () => {
        it('应该只返回可见节点', () => {
          const data: DataItem[] = [
            { id: 1, children: [{ id: 3 }] },
            { id: 2, children: [{ id: 4 }] }
          ]

          const forest = createExpandableForest(data)

          // 初始状态：只有根节点可见
          let visible = forest.flattenVisible(n => n.expanded)
          expect(visible.map(n => n.data.id)).toEqual([1, 2])

          // 展开第一棵树的根
          forest.roots[0]!.expanded = true
          visible = forest.flattenVisible(n => n.expanded)
          expect(visible.map(n => n.data.id)).toEqual([1, 3, 2])

          // 展开第二棵树的根
          forest.roots[1]!.expanded = true
          visible = forest.flattenVisible(n => n.expanded)
          expect(visible.map(n => n.data.id)).toEqual([1, 3, 2, 4])
        })
      })

      describe('getVisibleDescendants 方法', () => {
        it('应该获取展开节点的可见后代', () => {
          const data: DataItem[] = [
            { id: 1, children: [{ id: 2, children: [{ id: 3 }] }] }
          ]

          const forest = createExpandableForest(data)
          const root = forest.roots[0]!
          root.expanded = true

          // 子节点未展开
          let descendants = forest.getVisibleDescendants(root, n => n.expanded)
          expect(descendants.map(n => n.data.id)).toEqual([2])

          // 展开子节点
          root.children![0]!.expanded = true
          descendants = forest.getVisibleDescendants(root, n => n.expanded)
          expect(descendants.map(n => n.data.id)).toEqual([2, 3])
        })
      })

      describe('getVisibleDescendantCount 方法', () => {
        it('应该返回正确的可见后代数量', () => {
          const data: DataItem[] = [
            { id: 1, children: [{ id: 2, children: [{ id: 3 }] }] }
          ]

          const forest = createExpandableForest(data)
          const root = forest.roots[0]!
          root.expanded = true

          let count = forest.getVisibleDescendantCount(root, n => n.expanded)
          expect(count).toBe(1)

          root.children![0]!.expanded = true
          count = forest.getVisibleDescendantCount(root, n => n.expanded)
          expect(count).toBe(2)
        })
      })
    })
  })
})
