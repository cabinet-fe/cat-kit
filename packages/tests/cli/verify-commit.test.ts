import { describe, it, expect } from 'vitest'
import { verifyCommitMessage } from '@cat-kit/cli/src/commands/verify-commit'

describe('verify-commit', () => {
  it('应该通过合法的提交信息', () => {
    const validMessages = [
      'feat: add new feature',
      'fix: fix a bug',
      'docs: update documentation',
      'style: format code',
      'refactor: refactor code',
      'perf: improve performance',
      'test: add tests',
      'build: update build system',
      'ci: update ci config',
      'chore: update dependencies',
      'revert: revert a commit',
      'feat(ui): add button component',
      'fix!: breaking change'
    ]

    for (const msg of validMessages) {
      expect(verifyCommitMessage(msg).valid).toBe(true)
    }
  })

  it('应该拒绝非法的提交信息', () => {
    const invalidMessages = [
      'random message',
      'feat add feature',
      'Fix: wrong case',
      'unknown(scope): message',
      'feat:',
      ': message'
    ]

    for (const msg of invalidMessages) {
      const result = verifyCommitMessage(msg)
      expect(result.valid).toBe(false)
      expect(result.reason).toBeDefined()
    }
  })
})
