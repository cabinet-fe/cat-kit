import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  unbundle: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'neutral'
})
