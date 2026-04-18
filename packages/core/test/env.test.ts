import { getEnvironmentSummary, getRuntime, isInBrowser, isInNode } from '@cat-kit/core/src'
import { describe, expect, it } from 'vitest'

describe('env', () => {
  it('Vitest(Node) 下 getRuntime 为 node', () => {
    expect(getRuntime()).toBe('node')
  })

  it('isInNode / isInBrowser 与运行时一致', () => {
    expect(isInNode()).toBe(true)
    expect(isInBrowser()).toBe(false)
  })

  it('getEnvironmentSummary 在 node 下返回合规形状', () => {
    const s = getEnvironmentSummary()
    expect(s.runtime).toBe('node')
    if (s.runtime === 'node') {
      expect(s).toHaveProperty('os')
      expect(typeof s.os).toBe('string')
      expect(s.nodeVersion === null || typeof s.nodeVersion === 'string').toBe(true)
    }
  })
})
