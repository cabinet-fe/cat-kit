import { describe, expect, it } from 'vitest'
import { Monorepo } from '@cat-kit/maintenance/src'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const testRepoRoot = path.resolve(__dirname, '../../..')

describe('Monorepo 类', () => {
  describe('构造函数', () => {
    it('应正确创建实例', () => {
      const repo = new Monorepo(testRepoRoot)
      expect(repo).toBeInstanceOf(Monorepo)
    })


    it('rootDir 不是绝对路径时应抛出错误', () => {
      expect(() => new Monorepo('relative/path')).toThrow('rootDir 必须是绝对路径')
    })
  })

  describe('workspaces', () => {
    it('应返回工作区列表', () => {
      const repo = new Monorepo(testRepoRoot)
      const workspaces = repo.workspaces

      expect(Array.isArray(workspaces)).toBe(true)
      expect(workspaces.length).toBeGreaterThan(0)

      // 验证工作区结构
      const firstWorkspace = workspaces[0]
      expect(firstWorkspace).toHaveProperty('name')
      expect(firstWorkspace).toHaveProperty('dir')
      expect(firstWorkspace).toHaveProperty('version')
      expect(firstWorkspace).toHaveProperty('pkg')
    })

    it('应包含已知的包', () => {
      const repo = new Monorepo(testRepoRoot)
      const names = repo.workspaces.map(ws => ws.name)

      expect(names).toContain('@cat-kit/core')
      expect(names).toContain('@cat-kit/be')
    })
  })

  describe('group()', () => {
    it('应返回 WorkspaceGroup 实例', () => {
      const repo = new Monorepo(testRepoRoot)
      const group = repo.group(['@cat-kit/core'])

      expect(group).toBeDefined()
    })
  })

  describe('isValid()', () => {
    it('应返回验证结果', () => {
      const repo = new Monorepo(testRepoRoot)
      const result = repo.validate()

      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('hasCircular')
      expect(result).toHaveProperty('circularChains')
      expect(result).toHaveProperty('inconsistentDeps')
    })
  })

  describe('buildDependencyGraph()', () => {
    it('应返回依赖图', () => {
      const repo = new Monorepo(testRepoRoot)
      const result = repo.buildDependencyGraph()

      expect(result).toHaveProperty('nodes')
      expect(result).toHaveProperty('edges')
      expect(result).toHaveProperty('mermaid')
      expect(Array.isArray(result.nodes)).toBe(true)
      expect(Array.isArray(result.edges)).toBe(true)
      expect(typeof result.mermaid).toBe('string')
    })

    it('Mermaid 输出应以 graph TD 开头', () => {
      const repo = new Monorepo(testRepoRoot)
      const result = repo.buildDependencyGraph()

      expect(result.mermaid.startsWith('graph TD')).toBe(true)
    })
  })
})
