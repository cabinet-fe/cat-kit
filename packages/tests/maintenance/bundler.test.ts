import path from 'node:path'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MonoRepoBundler } from '@cat-kit/maintenance/src'
import { build as tsdownBuild } from 'tsdown'

vi.mock('tsdown', () => ({
  build: vi.fn()
}))

vi.mock('rollup-plugin-visualizer', () => ({
  visualizer: vi.fn(() => ({ name: 'visualizer' }))
}))

describe('MonoRepoBundler external 处理', () => {
  let pkgDir = ''

  beforeEach(async () => {
    pkgDir = await mkdtemp(path.join(tmpdir(), 'cat-kit-maint-bundle-'))
    await mkdir(path.join(pkgDir, 'src'), { recursive: true })
    await writeFile(path.join(pkgDir, 'src/index.ts'), 'export const foo = 1\n')
  })

  afterEach(async () => {
    vi.clearAllMocks()
    if (pkgDir) {
      await rm(pkgDir, { recursive: true, force: true })
    }
  })

  it('自动 external peerDependencies 与 devDependencies 的交集并与配置 external 合并', async () => {
    await writeFile(
      path.join(pkgDir, 'package.json'),
      JSON.stringify(
        {
          name: '@demo/kit',
          version: '0.0.0',
          peerDependencies: {
            react: '^18.0.0',
            vue: '^3.0.0'
          },
          devDependencies: {
            react: '^18.0.0',
            vitest: '^4.0.0'
          }
        },
        null,
        2
      )
    )

    const bundler = new MonoRepoBundler([
      {
        dir: pkgDir,
        build: {
          input: 'src/index.ts',
          external: ['@cat-kit/core']
        }
      }
    ])

    await bundler.build()

    const buildMock = vi.mocked(tsdownBuild)
    expect(buildMock).toHaveBeenCalledTimes(1)
    const callOptions = buildMock.mock.calls[0]?.[0]
    expect(callOptions?.external).toEqual(['@cat-kit/core', 'react'])
  })

  it('去重 external 并保持显式 external 在前', async () => {
    await writeFile(
      path.join(pkgDir, 'package.json'),
      JSON.stringify(
        {
          name: '@demo/kit',
          version: '0.0.0',
          peerDependencies: { react: '^18.0.0' },
          devDependencies: { react: '^18.0.0', vite: '^5.0.0' }
        },
        null,
        2
      )
    )

    const bundler = new MonoRepoBundler([
      {
        dir: pkgDir,
        build: {
          input: 'src/index.ts',
          external: ['react', 'picocolors']
        }
      }
    ])

    await bundler.build()

    const buildMock = vi.mocked(tsdownBuild)
    const callOptions = buildMock.mock.calls.at(-1)?.[0]
    expect(callOptions?.external).toEqual(['react', 'picocolors'])
  })
})
