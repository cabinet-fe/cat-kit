/*
 * @Author: whj
 * @Date: 2022-11-30 15:13:29
 * @LastEditors: whj
 * @LastEditTime: 2023-01-30 10:53:52
 * @FilePath: /cat-kit/docs/vite.config.ts
 *
 */
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
