import { describe, expect, it } from 'vitest'

import { createGitTag, commitAndPush, GitError, PublishError } from '@cat-kit/maintenance/src'

describe('release/git', () => {
  describe('createGitTag', () => {
    it('tag 名称为空时抛出异常', async () => {
      await expect(
        createGitTag({
          cwd: '/repo',
          tag: '   '
        })
      ).rejects.toThrow('tag 名称不能为空')
    })
  })

  describe('commitAndPush', () => {
    it('提交信息为空时抛出异常', async () => {
      await expect(
        commitAndPush({
          cwd: '/repo',
          message: '   '
        })
      ).rejects.toThrow('提交信息不能为空')
    })

    it('git 命令失败时抛出 GitError', async () => {
      await expect(
        commitAndPush({
          cwd: '/nonexistent-path',
          message: 'test commit'
        })
      ).rejects.toBeInstanceOf(GitError)
    })
  })
})

describe('release/publish', () => {
  it('在无效目录执行发布时抛出 PublishError', async () => {
    const { publishPackage } = await import('@cat-kit/maintenance/src')

    await expect(
      publishPackage({
        cwd: '/nonexistent-pkg'
      })
    ).rejects.toBeInstanceOf(PublishError)
  })

  it('使用 workspace 参数发布指定工作区', async () => {
    const { publishPackage } = await import('@cat-kit/maintenance/src')

    // 由于目录不存在，应该抛出 PublishError
    await expect(
      publishPackage({
        cwd: '/nonexistent-repo',
        workspace: ['@cat-kit/core', '@cat-kit/fe']
      })
    ).rejects.toBeInstanceOf(PublishError)
  })

  it('使用 workspaces 参数发布所有工作区', async () => {
    const { publishPackage } = await import('@cat-kit/maintenance/src')

    // 由于目录不存在，应该抛出 PublishError
    await expect(
      publishPackage({
        cwd: '/nonexistent-repo',
        workspaces: true
      })
    ).rejects.toBeInstanceOf(PublishError)
  })

  it('provenance 和 provenanceFile 不能同时使用', async () => {
    const { publishPackage } = await import('@cat-kit/maintenance/src')

    await expect(
      publishPackage({
        cwd: '/some-path',
        provenance: true,
        provenanceFile: '/path/to/provenance.json'
      })
    ).rejects.toThrow('provenance 和 provenanceFile 不能同时使用')
  })
})
