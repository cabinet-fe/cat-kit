import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  unbundle: true,
  entry: { cli: 'src/cli.ts' },
  format: ['esm'],
  platform: 'node'
})
