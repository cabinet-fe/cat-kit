import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  copy: [
    { from: 'src/skill/scripts/get-context-info.js', to: 'dist/skill/scripts' },
    { from: 'src/skill/scripts/validate-context.js', to: 'dist/skill/scripts' },
    { from: 'src/skill/references/ask-user-question.md', to: 'dist/skill/references' },
    { from: 'src/skill/references/_principles.md', to: 'dist/skill/references' }
  ],
  dts: true,
  unbundle: true,
  entry: { cli: 'src/cli.ts' },
  format: ['esm'],
  platform: 'node',
  fixedExtension: false
})
