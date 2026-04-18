import { verifyCommitMessage, stripComments } from '@cat-kit/cli/src/commands/verify-commit'
import { describe, it, expect } from 'vitest'

describe('stripComments', () => {
  it('应该去除 # 开头的注释行', () => {
    const raw = [
      'feat: add feature',
      '',
      '# Please enter the commit message for your changes.',
      "# Lines starting with '#' will be ignored."
    ].join('\n')

    expect(stripComments(raw)).toBe('feat: add feature')
  })

  it('应该处理纯注释内容', () => {
    expect(stripComments('# comment only')).toBe('')
  })

  it('应该保留无注释的消息', () => {
    expect(stripComments('fix: a bug')).toBe('fix: a bug')
  })
})

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
