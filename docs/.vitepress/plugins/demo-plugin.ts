/*
 * @Author: whj
 * @Date: 2023-01-29 16:31:57
 * @LastEditors: whj
 * @LastEditTime: 2023-02-24 09:26:56
 * @FilePath: /cat-kit/docs/.vitepress/plugins/demo-plugin.ts
 *
 */
import type { PluginOption } from 'vite'
import path from 'path'
import fs from 'fs'
import { cwd } from 'process'

// 该插件的作用是往md文件中插入一个vue的script标签脚本
// vitepress检测到这个脚本时会将其作为每一个vue模板的公共script来用
// 详细查看此文档: https://vitepress.vuejs.org/guide/using-vue#script-style-hoisting
export function DemoPlugin(): PluginOption {
  return {
    name: 'md-transform',
    enforce: 'pre',
    async transform(code, id) {
      // id是文件路径标识
      if (!id.endsWith('.md')) return

      const docsPath = path.resolve(cwd(), 'docs')
      const examplesPath = path.resolve(docsPath, 'examples')

      // 当前md文件相对于docs目录的路径
      const modulePath = id.split('docs/')[1]!.replace(/\.md/, '')

      // 是否存在目标demo文件
      const hasDemos = fs.existsSync(path.resolve(examplesPath, modulePath))
      if (!hasDemos) return
      // 导入模块下的所有vue文件
      const script = `<script setup>
        const demos = import.meta.glob('/examples/${modulePath}/*.vue', { eager: true })
        </script>\n`

      // 返回一个相对该md文件的相对路径的
      return `${script} ${code}`
    }
  }
}
