import { EventEmitter } from 'node:events'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { PassThrough } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSpawn = vi.fn()

vi.mock('node:child_process', async () => {
  const actual = await vi.importActual<typeof import('node:child_process')>(
    'node:child_process'
  )
  return {
    ...actual,
    spawn: (...args: unknown[]) => mockSpawn(...args)
  }
})

import {
  commitAndPush,
  createGitTag,
  publishPackage,
  PublishError
} from '@cat-kit/maintenance/src'

function createMockProcess(
  stdout: string,
  exitCode: number,
  stderr = ''
): ChildProcessWithoutNullStreams {
  const stdoutStream = new PassThrough()
  const stderrStream = new PassThrough()
  const proc = Object.assign(new EventEmitter(), {
    stdout: stdoutStream,
    stderr: stderrStream
  }) as unknown as ChildProcessWithoutNullStreams

  queueMicrotask(() => {
    if (stdout) stdoutStream.emit('data', Buffer.from(stdout))
    if (stderr) stderrStream.emit('data', Buffer.from(stderr))
    proc.emit('close', exitCode)
  })

  return proc
}

describe('发布辅助工具', () => {
  beforeEach(() => {
    mockSpawn.mockReset()
  })

  it('创建 tag 并推送远端', async () => {
    mockSpawn
      .mockImplementationOnce(() => createMockProcess('', 0)) // tag
      .mockImplementationOnce(() => createMockProcess('', 0)) // push

    await createGitTag({
      cwd: '/repo',
      tag: 'v1.0.0',
      message: '发布 1.0.0',
      push: true,
      force: true
    })

    expect(mockSpawn).toHaveBeenNthCalledWith(
      1,
      'git',
      ['tag', '-f', '-a', 'v1.0.0', '-m', '发布 1.0.0'],
      expect.objectContaining({ cwd: '/repo' })
    )
    expect(mockSpawn).toHaveBeenNthCalledWith(
      2,
      'git',
      ['push', 'origin', 'v1.0.0', '--force'],
      expect.objectContaining({ cwd: '/repo' })
    )
  })

  it('自动识别当前分支并推送，可选推送所有 tag', async () => {
    mockSpawn
      .mockImplementationOnce(() => createMockProcess('', 0)) // add
      .mockImplementationOnce(() => createMockProcess('', 0)) // commit
      .mockImplementationOnce(() => createMockProcess('main', 0)) // branch
      .mockImplementationOnce(() => createMockProcess('', 0)) // push branch
      .mockImplementationOnce(() => createMockProcess('', 0)) // push tags
      .mockImplementationOnce(() => createMockProcess('abcdef', 0)) // commit hash

    const result = await commitAndPush({
      cwd: '/repo',
      message: 'chore: release',
      pushTags: true
    })

    expect(mockSpawn).toHaveBeenNthCalledWith(
      3,
      'git',
      ['rev-parse', '--abbrev-ref', 'HEAD'],
      expect.objectContaining({ cwd: '/repo' })
    )
    expect(mockSpawn).toHaveBeenNthCalledWith(
      4,
      'git',
      ['push', 'origin', 'main'],
      expect.objectContaining({ cwd: '/repo' })
    )
    expect(mockSpawn).toHaveBeenNthCalledWith(
      5,
      'git',
      ['push', 'origin', '--tags'],
      expect.objectContaining({ cwd: '/repo' })
    )
    expect(result).toEqual({
      commitHash: 'abcdef',
      branch: 'main'
    })
  })

  it('支持自定义 registry 和 npm publish 选项', async () => {
    mockSpawn.mockImplementation(() => createMockProcess('published', 0))

    const result = await publishPackage({
      cwd: '/pkg',
      registry: 'https://registry.npmmirror.com',
      tag: 'next',
      otp: '654321',
      dryRun: true,
      access: 'public',
      provenance: true
    })

    expect(mockSpawn).toHaveBeenCalledWith(
      'npm',
      [
        'publish',
        '--registry',
        'https://registry.npmmirror.com',
        '--tag',
        'next',
        '--access',
        'public',
        '--dry-run',
        '--otp',
        '654321',
        '--provenance'
      ],
      {
        cwd: '/pkg',
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false
      }
    )
    expect(result.output).toBe('published')
  })

  it('npm 发布失败时抛出 PublishError', async () => {
    mockSpawn.mockImplementation(() =>
      createMockProcess('', 1, 'publish failed')
    )

    await expect(
      publishPackage({
        cwd: '/pkg',
        registry: 'https://registry.npmmirror.com'
      })
    ).rejects.toBeInstanceOf(PublishError)
  })
})
