import { defineConfig } from 'vite'
import { pluginPresets } from '@builder/vite'

export default defineConfig({
  plugins: [pluginPresets(['vue'])],
  server: {
    port: 3333
  }
})
