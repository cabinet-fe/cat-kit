import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      // 改插件的作用是往md文件中插入一个vue的script标签脚本
      // vitepress检测到这个脚本时会将其作为每一个vue模板的script来用
      // 详细查看此文档: https://vitepress.vuejs.org/guide/using-vue#script-style-hoisting
      {
        name: 'md-transform',
        enforce: 'pre',
        async transform(code, id) {
          const targetDir = 'utils/'
          const modulePath = id.split(targetDir)[1]?.replace(/\.md/, '')
          const hasDemos = fs.existsSync(
            path.resolve(__dirname, `./examples/${modulePath}`)
          )

          // 只对utils文件夹里面的
          if (!id.endsWith('.md') || !id.includes(targetDir) || !hasDemos)
            return

          const script = `<script setup>
            const demos = import.meta.globEager('../../examples/${modulePath}/*.vue')
          </script>\n`

          // 返回一个相对该md文件的相对路径的
          return `${script} ${code}`
        }
      }
    ]
  }
})
