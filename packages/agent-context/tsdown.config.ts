import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    cli: 'src/cli.ts'
  },
  format: ['esm'],
  platform: 'node'
})
