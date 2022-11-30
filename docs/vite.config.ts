import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
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
