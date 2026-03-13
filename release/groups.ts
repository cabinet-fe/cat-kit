import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Monorepo, WorkspaceGroup } from '@cat-kit/maintenance/src'

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
  }
}
