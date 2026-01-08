import { describe, it, expect } from 'vitest'
import {
  dfs,
  bfs,
  TreeNode,
  TreeManager,
  type ITreeNode
} from '@cat-kit/core/src'

type DataItem = {
  id: number
  name?: string
  type?: string
  children?: DataItem[]
}

describe('树结构', () => {
  describe('dfs - 深度优先遍历函数', () => {
    it('应该按深度优先顺序遍历', () => {
      const data: DataItem = {
        id: 1,
        children: [
          { id: 2, children: [{ id: 4 }] },
          { id: 3 }
        ]
      }

      const visited: number[] = []
      dfs(data, node => {
        visited.push(node.id)
      })

      expect(visited).toEqual([1, 2, 4, 3])
    })

    it('应该提供正确的 index 和 parent', () => {
      const data: DataItem = {
        id: 1,
        children: [{ id: 2 }, { id: 3 }]
      }

      const results: Array<{ id: number; index: number; parentId?: number }> =
        []
      dfs(data, (node, index, parent) => {
        results.push({
          id: node.id,
          index,
          parentId: parent?.id
        })
      })

      expect(results).toEqual([
        { id: 1, index: 0, parentId: undefined },
        { id: 2, index: 0, parentId: 1 },
        { id: 3, index: 1, parentId: 1 }
      ])
    })

    it('返回 true 时应提前终止遍历', () => {
      const data: DataItem = {
        id: 1,
        children: [{ id: 2 }, { id: 3 }]
      }

      const visited: number[] = []
      const result = dfs(data, node => {
        visited.push(node.id)
        if (node.id === 2) return true
      })

      expect(result).toBe(true)
      expect(visited).toEqual([1, 2])
    })

    it('应该支持自定义 childrenKey', () => {
      const data = {
        id: 1,
        items: [{ id: 2 }, { id: 3 }]
      }

      const visited: number[] = []
      dfs(
        data,
        node => {
          visited.push(node.id as number)
        },
        'items'
      )

      expect(visited).toEqual([1, 2, 3])
    })
  })

  describe('bfs - 广度优先遍历函数', () => {
    it('应该按广度优先顺序遍历', () => {
      const data: DataItem = {
        id: 1,
        children: [
          { id: 2, children: [{ id: 4 }] },
          { id: 3 }
        ]
      }

      const visited: number[] = []
      bfs(data, node => {
        visited.push(node.id)
      })

      expect(visited).toEqual([1, 2, 3, 4])
    })

    it('返回 true 时应提前终止遍历', () => {
      const data: DataItem = {
        id: 1,
        children: [{ id: 2 }, { id: 3 }]
      }

      const visited: number[] = []
      const result = bfs(data, node => {
        visited.push(node.id)
        if (node.id === 2) return true
      })

      expect(result).toBe(true)
      expect(visited).toEqual([1, 2])
    })
  })

  describe('TreeNode', () => {
    it('应该创建树节点', () => {
      const data = { id: 1, name: 'root' }
      const node = new TreeNode(data, 0, 0)

      expect(node.data).toBe(data)
      expect(node.depth).toBe(0)
      expect(node.index).toBe(0)
      expect(node.isLeaf).toBe(true)
      expect(node.parent).toBeUndefined()
    })

    it('应该创建带父节点的树节点', () => {
      const parentData = { id: 1 }
      const childData = { id: 2 }
      const parent = new TreeNode(parentData, 0, 0)
      const child = new TreeNode(childData, 0, 1, parent)

      expect(child.parent).toBe(parent)
      expect(child.depth).toBe(1)
    })

    it('应该移除节点', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child1 = new TreeNode({ id: 2 }, 0, 1, root)
      const child2 = new TreeNode({ id: 3 }, 1, 1, root)

      root.children = [child1, child2]

      child1.remove()

      expect(root.children).toHaveLength(1)
      expect(root.children[0]).toBe(child2)
      expect(child2.index).toBe(0)
      expect(child1.parent).toBeUndefined()
    })

    it('移除最后一个子节点后父节点应变为叶子', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child = new TreeNode({ id: 2 }, 0, 1, root)

      root.children = [child]

      child.remove()

      expect(root.children).toHaveLength(0)
      expect(root.isLeaf).toBe(true)
    })

    it('index 过期时也应正确移除自身', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child1 = new TreeNode({ id: 2 }, 0, 1, root)
      const child2 = new TreeNode({ id: 3 }, 1, 1, root)

      // 人为打乱 children 顺序，制造 index 过期场景
      root.children = [child2, child1]

      child1.remove()

      expect(root.children).toHaveLength(1)
      expect(root.children![0]).toBe(child2)
      expect(child2.index).toBe(0)
      expect(child1.parent).toBeUndefined()
    })

    it('应该插入子节点到末尾', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child1 = new TreeNode({ id: 2 }, 0, 0)
      const child2 = new TreeNode({ id: 3 }, 0, 0)

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
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child1 = new TreeNode({ id: 2 }, 0, 0)
      const child2 = new TreeNode({ id: 3 }, 0, 0)
      const child3 = new TreeNode({ id: 4 }, 0, 0)

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

    it('应该获取从根到当前节点的路径', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child = new TreeNode({ id: 2 }, 0, 1, root)
      const grandchild = new TreeNode({ id: 3 }, 0, 2, child)

      root.children = [child]
      child.children = [grandchild]

      const path = grandchild.getPath()

      expect(path).toHaveLength(3)
      expect(path[0]).toBe(root)
      expect(path[1]).toBe(child)
      expect(path[2]).toBe(grandchild)
    })

    it('应该获取所有祖先节点', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child = new TreeNode({ id: 2 }, 0, 1, root)
      const grandchild = new TreeNode({ id: 3 }, 0, 2, child)

      root.children = [child]
      child.children = [grandchild]

      const ancestors = grandchild.getAncestors()

      expect(ancestors).toHaveLength(2)
      expect(ancestors[0]).toBe(child) // 从父节点开始
      expect(ancestors[1]).toBe(root)
    })

    it('应该正确判断祖先关系', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child = new TreeNode({ id: 2 }, 0, 1, root)
      const grandchild = new TreeNode({ id: 3 }, 0, 2, child)

      root.children = [child]
      child.children = [grandchild]

      expect(root.isAncestorOf(grandchild)).toBe(true)
      expect(root.isAncestorOf(child)).toBe(true)
      expect(child.isAncestorOf(grandchild)).toBe(true)
      expect(grandchild.isAncestorOf(root)).toBe(false)
    })

    it('应该正确判断后代关系', () => {
      const root = new TreeNode({ id: 1 }, 0, 0)
      const child = new TreeNode({ id: 2 }, 0, 1, root)
      const grandchild = new TreeNode({ id: 3 }, 0, 2, child)

      root.children = [child]
      child.children = [grandchild]

      expect(grandchild.isDescendantOf(root)).toBe(true)
      expect(grandchild.isDescendantOf(child)).toBe(true)
      expect(child.isDescendantOf(root)).toBe(true)
      expect(root.isDescendantOf(grandchild)).toBe(false)
    })
  })

  describe('TreeManager', () => {
    it('应该直接使用原始数据创建树（不传 createNode）', () => {
      const data: DataItem = {
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
      const data: DataItem = {
        id: 1,
        name: 'root',
        children: [
          { id: 2, name: 'child1' },
          { id: 3, name: 'child2' }
        ]
      }

      const tree = new TreeManager(data, {
        createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
      })

      expect(tree.root).toBeInstanceOf(TreeNode)
      expect(tree.root.data.id).toBe(1)
      expect(tree.root.children).toHaveLength(2)
      expect(tree.root.children![0]!.data.id).toBe(2)
      expect(tree.root.children![1]!.data.id).toBe(3)
    })

    it('应该使用 ITreeNode 接口创建节点', () => {
      const data: DataItem = {
        id: 1,
        children: [{ id: 2 }, { id: 3 }]
      }

      const tree = new TreeManager(data, {
        createNode: (data, index, depth, parent): ITreeNode<DataItem> => ({
          data,
          index,
          depth,
          get isLeaf() {
            return !data.children?.length
          },
          parent
        })
      })

      expect(tree.root.data.id).toBe(1)
      expect(tree.root.depth).toBe(0)
      expect(tree.root.isLeaf).toBe(false)
      expect(tree.root.children![0]!.isLeaf).toBe(true)
    })

    it('构建的节点应该有正确的 depth 和 parent', () => {
      const data: DataItem = {
        id: 1,
        children: [{ id: 2, children: [{ id: 3 }] }]
      }

      const tree = new TreeManager(data, {
        createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
      })

      expect(tree.root.depth).toBe(0)
      expect(tree.root.children![0]!.depth).toBe(1)
      expect(tree.root.children![0]!.children![0]!.depth).toBe(2)

      expect(tree.root.parent).toBeUndefined()
      expect(tree.root.children![0]!.parent).toBe(tree.root)
    })

    it('应该支持自定义 childrenKey', () => {
      const data = {
        id: 1,
        items: [{ id: 2 }, { id: 3 }]
      }

      const tree = new TreeManager(data, {
        createNode: (d, index, depth, parent) =>
          new TreeNode(d as DataItem, index, depth, parent),
        childrenKey: 'items'
      })

      expect(tree.root.children).toHaveLength(2)
    })

    describe('dfs 方法', () => {
      it('应该深度优先遍历', () => {
        const data: DataItem = {
          id: 1,
          children: [
            { id: 2, children: [{ id: 4 }] },
            { id: 3 }
          ]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })

        const visited: number[] = []
        tree.dfs(node => {
          visited.push(node.data.id)
        })

        expect(visited).toEqual([1, 2, 4, 3])
      })
    })

    describe('bfs 方法', () => {
      it('应该广度优先遍历', () => {
        const data: DataItem = {
          id: 1,
          children: [
            { id: 2, children: [{ id: 4 }] },
            { id: 3 }
          ]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })

        const visited: number[] = []
        tree.bfs(node => {
          visited.push(node.data.id)
        })

        expect(visited).toEqual([1, 2, 3, 4])
      })
    })

    describe('find 方法', () => {
      it('应该查找节点', () => {
        const data: DataItem = {
          id: 1,
          children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })
        const found = tree.find(node => node.data.id === 4)

        expect(found).not.toBeNull()
        expect(found?.data.id).toBe(4)
      })

      it('应该返回 null 当未找到节点', () => {
        const data: DataItem = { id: 1, children: [{ id: 2 }] }
        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })
        const found = tree.find(node => node.data.id === 999)

        expect(found).toBeNull()
      })
    })

    describe('findAll 方法', () => {
      it('应该查找所有符合条件的节点', () => {
        const data: DataItem = {
          id: 1,
          type: 'folder',
          children: [
            { id: 2, type: 'file' },
            { id: 3, type: 'file' },
            { id: 4, type: 'folder' }
          ]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })
        const files = tree.findAll(node => node.data.type === 'file')

        expect(files).toHaveLength(2)
        expect(files.map(n => n.data.id)).toEqual([2, 3])
      })
    })

    describe('flatten 方法', () => {
      it('应该扁平化节点', () => {
        const data: DataItem = {
          id: 1,
          children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })
        const flattened = tree.flatten()

        expect(flattened).toHaveLength(4)
        expect(flattened.map(n => n.data.id)).toEqual([1, 2, 3, 4])
      })

      it('应该支持扁平化时过滤', () => {
        const data: DataItem = {
          id: 1,
          type: 'folder',
          children: [
            { id: 2, type: 'file' },
            { id: 3, type: 'folder', children: [{ id: 4, type: 'file' }] }
          ]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })
        const files = tree.flatten(node => node.data.type === 'file')

        expect(files).toHaveLength(2)
        expect(files.map(n => n.data.id)).toEqual([2, 4])
      })
    })

    describe('getLeaves 方法', () => {
      it('应该获取所有叶子节点', () => {
        const data: DataItem = {
          id: 1,
          children: [
            { id: 2 },
            { id: 3, children: [{ id: 4 }, { id: 5 }] }
          ]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })
        const leaves = tree.getLeaves()

        expect(leaves).toHaveLength(3)
        expect(leaves.map(n => n.data.id)).toEqual([2, 4, 5])
      })
    })

    describe('getNodesAtDepth 方法', () => {
      it('应该获取指定深度的节点', () => {
        const data: DataItem = {
          id: 1,
          children: [
            { id: 2, children: [{ id: 4 }] },
            { id: 3, children: [{ id: 5 }] }
          ]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })

        const depth0 = tree.getNodesAtDepth(0)
        const depth1 = tree.getNodesAtDepth(1)
        const depth2 = tree.getNodesAtDepth(2)

        expect(depth0.map(n => n.data.id)).toEqual([1])
        expect(depth1.map(n => n.data.id)).toEqual([2, 3])
        expect(depth2.map(n => n.data.id)).toEqual([4, 5])
      })
    })

    describe('getMaxDepth 方法', () => {
      it('应该计算最大深度', () => {
        const data: DataItem = {
          id: 1,
          children: [
            { id: 2 },
            { id: 3, children: [{ id: 4, children: [{ id: 5 }] }] }
          ]
        }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })

        expect(tree.getMaxDepth()).toBe(3)
      })

      it('单节点树的最大深度应为 0', () => {
        const data: DataItem = { id: 1 }

        const tree = new TreeManager(data, {
          createNode: (d, index, depth, parent) => new TreeNode(d, index, depth, parent)
        })

        expect(tree.getMaxDepth()).toBe(0)
      })
    })

    describe('增量更新方法（虚拟滚动优化）', () => {
      interface ExpandableNode extends TreeNode<DataItem> {
        expanded: boolean
      }

      function createExpandableTree(data: DataItem) {
        return new TreeManager(data, {
          createNode: (d, index, depth, parent): ExpandableNode => {
            const node = new TreeNode(d, index, depth, parent) as ExpandableNode
            node.expanded = false
            return node
          }
        })
      }

      describe('flattenVisible 方法', () => {
        it('应该只返回可见节点', () => {
          const data: DataItem = {
            id: 1,
            children: [
              { id: 2, children: [{ id: 4 }] },
              { id: 3, children: [{ id: 5 }] }
            ]
          }

          const tree = createExpandableTree(data)

          // 初始状态：只有根节点可见
          let visible = tree.flattenVisible(n => n.expanded)
          expect(visible.map(n => n.data.id)).toEqual([1])

          // 展开根节点
          tree.root.expanded = true
          visible = tree.flattenVisible(n => n.expanded)
          expect(visible.map(n => n.data.id)).toEqual([1, 2, 3])

          // 展开第一个子节点
          tree.root.children![0]!.expanded = true
          visible = tree.flattenVisible(n => n.expanded)
          expect(visible.map(n => n.data.id)).toEqual([1, 2, 4, 3])

          // 展开第二个子节点
          tree.root.children![1]!.expanded = true
          visible = tree.flattenVisible(n => n.expanded)
          expect(visible.map(n => n.data.id)).toEqual([1, 2, 4, 3, 5])
        })
      })

      describe('getVisibleDescendants 方法', () => {
        it('应该获取展开节点的可见后代', () => {
          const data: DataItem = {
            id: 1,
            children: [
              { id: 2, children: [{ id: 4 }, { id: 5 }] },
              { id: 3 }
            ]
          }

          const tree = createExpandableTree(data)
          tree.root.expanded = true

          // 获取根节点的可见后代（子节点都未展开）
          let descendants = tree.getVisibleDescendants(tree.root, n => n.expanded)
          expect(descendants.map(n => n.data.id)).toEqual([2, 3])

          // 展开 id=2 的节点
          tree.root.children![0]!.expanded = true
          descendants = tree.getVisibleDescendants(tree.root, n => n.expanded)
          expect(descendants.map(n => n.data.id)).toEqual([2, 4, 5, 3])
        })

        it('叶子节点应返回空数组', () => {
          const data: DataItem = {
            id: 1,
            children: [{ id: 2 }]
          }

          const tree = createExpandableTree(data)
          tree.root.expanded = true

          const leaf = tree.root.children![0]!
          const descendants = tree.getVisibleDescendants(leaf, n => n.expanded)
          expect(descendants).toEqual([])
        })
      })

      describe('getVisibleDescendantCount 方法', () => {
        it('应该返回正确的可见后代数量', () => {
          const data: DataItem = {
            id: 1,
            children: [
              { id: 2, children: [{ id: 4 }, { id: 5 }] },
              { id: 3 }
            ]
          }

          const tree = createExpandableTree(data)
          tree.root.expanded = true

          // 子节点都未展开
          let count = tree.getVisibleDescendantCount(tree.root, n => n.expanded)
          expect(count).toBe(2)

          // 展开 id=2 的节点
          tree.root.children![0]!.expanded = true
          count = tree.getVisibleDescendantCount(tree.root, n => n.expanded)
          expect(count).toBe(4) // 2, 4, 5, 3
        })
      })

      describe('增量更新使用示例', () => {
        it('应该正确模拟展开/折叠操作', () => {
          const data: DataItem = {
            id: 1,
            children: [
              { id: 2, children: [{ id: 4 }] },
              { id: 3 }
            ]
          }

          const tree = createExpandableTree(data)
          tree.root.expanded = true

          // 初始化扁平列表
          let flatList = tree.flattenVisible(n => n.expanded)
          expect(flatList.map(n => n.data.id)).toEqual([1, 2, 3])

          // 模拟展开 id=2 的节点
          const nodeToExpand = tree.root.children![0]!
          nodeToExpand.expanded = true

          // 获取需要插入的节点
          const toInsert = tree.getVisibleDescendants(nodeToExpand, n => n.expanded)
          expect(toInsert.map(n => n.data.id)).toEqual([4])

          // 找到节点在列表中的位置并插入
          const nodeIndex = flatList.indexOf(nodeToExpand)
          flatList.splice(nodeIndex + 1, 0, ...toInsert)
          expect(flatList.map(n => n.data.id)).toEqual([1, 2, 4, 3])

          // 模拟折叠 id=2 的节点
          const removeCount = tree.getVisibleDescendantCount(nodeToExpand, n => n.expanded)
          expect(removeCount).toBe(1)

          nodeToExpand.expanded = false
          flatList.splice(nodeIndex + 1, removeCount)
          expect(flatList.map(n => n.data.id)).toEqual([1, 2, 3])
        })
      })
    })
  })
})
