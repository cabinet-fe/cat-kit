import { main, maintenance, prompts } from './repo'

export const GROUPS_BUILD = {
  main() {
    return main.build({
      '@cat-kit/be': { platform: 'node' },
      '@cat-kit/excel': { platform: 'browser' }
    })
  },

  maintenance() {
    return maintenance.build({
      '@cat-kit/maintenance': { platform: 'node' }
    })
  },

  prompts() {
    return prompts.build({
      '@cat-kit/prompts': { platform: 'node' }
    })
  }
}
