/*
 * @Author: whj
 * @Date: 2022-11-30 15:13:29
 * @LastEditors: whj
 * @LastEditTime: 2023-01-29 17:31:05
 * @FilePath: /cat-kit/docs/vite.config.ts
 *
 */
import { defineConfig } from 'vite'
import { SearchPlugin } from 'vitepress-plugin-search'
import { DemoPlugin } from './.vitepress/plugins/demo-plugin'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      DemoPlugin(),

      SearchPlugin({
        previewLength: 62,
        buttonLabel: '查询',
        placeholder: '查询文档',
        cache: true,
        optimize: true
      })
    ]
  }
})
