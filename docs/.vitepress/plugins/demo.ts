import fs from 'node:fs'
import path from 'node:path'
import type { MarkdownRenderer } from 'vitepress'
import mdContainer from 'markdown-it-container'
import { str } from '@cat-kit/core'
import { EXAMPLES_DIR } from '../shared'
import { createHighlighter, type Highlighter } from 'shiki'

// 全局缓存 highlighter 实例
let highlighter: Highlighter | null = null

async function getHighlighter() {
  if (!highlighter) {
    // 使用 GitHub 主题
    highlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['vue', 'vue-html', 'typescript', 'javascript', 'html', 'css', 'json']
    })
  }
  return highlighter
}

export const demoPlugin = async (md: MarkdownRenderer) => {
  const hl = await getHighlighter()

  md.use(mdContainer, 'demo', {
    validate(params: string) {
      return !!params.trim().match(/^demo\s*(.*)$/)
    },

    render(tokens: any[], idx: number) {
      const token = tokens[idx]

      if (token.nesting === -1) {
        return '</DemoContainer>\n'
      }

      const m = token.info.trim().match(/^demo\s*(.*)$/)
      const demoPath = m ? m[1].trim() : ''

      if (!demoPath) {
        throw new Error('Demo路径不能为空')
      }

      const absolutePath = path.join(EXAMPLES_DIR, demoPath)

      // 检查文件是否存在
      if (!fs.existsSync(absolutePath)) {
        return `<DemoContainer path="${demoPath}">\n`
      }

      const code = fs.readFileSync(absolutePath, 'utf-8')
      const lineCount = code.split('\n').length

      // 使用 Shiki dual 主题模式，生成包含 CSS 变量的 HTML
      // VitePress 的 CSS 会自动处理主题切换
      const html = hl.codeToHtml(code, {
        lang: 'vue',
        themes: {
          light: 'github-light',
          dark: 'github-dark'
        },
        defaultColor: false
      })

      const ComponentName = str(path.basename(demoPath, '.vue')).camelCase('upper')

      return `<DemoContainer
        :is="${ComponentName}"
        path="${demoPath}"
        code="${encodeURIComponent(code)}"
        :line-count="${lineCount}"
        highlight-code="${encodeURIComponent(html)}"
      >\n`
    }
  })
}
