import { defineConfig } from 'vite'
import { DemoPlugin } from './.vitepress/vite-plugins/demo-plugin'
import jsx from '@vitejs/plugin-vue-jsx'

export default defineConfig(({ mode }) => {
  return {
    plugins: [DemoPlugin(), jsx()],

    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:2334',
          changeOrigin: true
        }
      }
    }
  }
})
