import { describe, expect, it } from 'vitest'
import {
  getPeerDevExternalDeps,
  mergeExternalDeps
} from '@cat-kit/maintenance/src'

describe('MonoRepoBundler external 处理', () => {
  describe('getPeerDevExternalDeps', () => {
    it('返回 peerDependencies 与 devDependencies 的交集', () => {
      const peerDeps = {
        react: '^18.0.0',
        vue: '^3.0.0'
      }
      const devDeps = {
        react: '^18.0.0',
        vitest: '^4.0.0'
      }

      const result = getPeerDevExternalDeps(peerDeps, devDeps)

      expect(result).toEqual(['react'])
    })

    it('peerDependencies 为空时返回空数组', () => {
      const peerDeps = {}
      const devDeps = { react: '^18.0.0' }

      const result = getPeerDevExternalDeps(peerDeps, devDeps)

      expect(result).toEqual([])
    })

    it('无交集时返回空数组', () => {
      const peerDeps = { vue: '^3.0.0' }
      const devDeps = { react: '^18.0.0' }

      const result = getPeerDevExternalDeps(peerDeps, devDeps)

      expect(result).toEqual([])
    })

    it('完全交集时返回所有 peerDependencies', () => {
      const peerDeps = { react: '^18.0.0', vue: '^3.0.0' }
      const devDeps = { react: '^18.0.0', vue: '^3.0.0', vitest: '^4.0.0' }

      const result = getPeerDevExternalDeps(peerDeps, devDeps)

      expect(result).toEqual(['react', 'vue'])
    })
  })

  describe('mergeExternalDeps', () => {
    it('合并显式 external 和自动 external 并去重', () => {
      const configExternal = ['@cat-kit/core']
      const autoExternal = ['react']

      const result = mergeExternalDeps(configExternal, autoExternal)

      expect(result).toEqual(['@cat-kit/core', 'react'])
    })

    it('显式 external 优先，重复依赖只保留一份', () => {
      const configExternal = ['react', 'picocolors']
      const autoExternal = ['react']

      const result = mergeExternalDeps(configExternal, autoExternal)

      expect(result).toEqual(['react', 'picocolors'])
    })

    it('仅有显式 external 时正常返回', () => {
      const configExternal = ['@cat-kit/core']

      const result = mergeExternalDeps(configExternal)

      expect(result).toEqual(['@cat-kit/core'])
    })

    it('仅有自动 external 时正常返回', () => {
      const autoExternal = ['react']

      const result = mergeExternalDeps(undefined, autoExternal)

      expect(result).toEqual(['react'])
    })

    it('两者都为空时返回 undefined', () => {
      const result = mergeExternalDeps(undefined, [])

      expect(result).toBeUndefined()
    })

    it('configExternal 为空数组时仍处理 autoExternal', () => {
      const result = mergeExternalDeps([], ['react'])

      expect(result).toEqual(['react'])
    })
  })
})
