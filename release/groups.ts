import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Monorepo, WorkspaceGroup } from '@cat-kit/maintenance/src'
import vue from '@vitejs/plugin-vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const repo = new Monorepo(path.resolve(__dirname, '..'))

export interface ReleaseGroup {
  group: WorkspaceGroup<string>
  build?: () => Promise<void> | void
}

export const groups: Record<string, ReleaseGroup> = {
  main: {
    group: repo.group([
      '@cat-kit/core',
      '@cat-kit/fe',
      '@cat-kit/be',
      '@cat-kit/http',
      '@cat-kit/excel'
    ]),
    build() {
      return this.group.build({
        '@cat-kit/be': { platform: 'node' },
        '@cat-kit/excel': { platform: 'browser' }
      })
    }
  },
  agentContext: {
    group: repo.group(['@cat-kit/agent-context']),
    build() {
      return this.group.build({
        '@cat-kit/agent-context': {
          platform: 'node',
          entry: 'src/cli.ts',
          output: { sourcemap: false }
        }
      })
    }
  },
  cli: {
    group: repo.group(['@cat-kit/cli']),
    build() {
      return this.group.build({
        '@cat-kit/cli': { platform: 'node', entry: 'src/cli.ts', output: { sourcemap: false } }
      })
    }
  },
  tsconfig: { group: repo.group(['@cat-kit/tsconfig']) },
  maintenance: {
    group: repo.group(['@cat-kit/maintenance']),
    build() {
      return this.group.build({ '@cat-kit/maintenance': { platform: 'node' } })
    }
  },
  vitepressTheme: {
    group: repo.group(['@cat-kit/vitepress-theme']),
    build() {
      return this.group.build({
        '@cat-kit/vitepress-theme': {
          platform: 'browser',
          root: 'src',
          entry: ['src/index.ts', 'src/config.ts'],
          deps: { skipNodeModulesBundle: true },
          plugins: [vue()],
          dts: false,
          hooks: {
            afterBuild: async (config) => {
              const { copyAssetsToDist } = await import('./copy-assets.js')
              await copyAssetsToDist({ pkgDir: config.dir, assets: ['styles'] })
              /* dist/style.css 引用 url(./texture.jpg)，需与 style.css 同目录 */
              await copyFile(
                path.join(config.dir, 'src/styles/texture.jpg'),
                path.join(config.dir, 'dist/texture.jpg')
              )
            }
          }
        }
      })
    }
  }
}
