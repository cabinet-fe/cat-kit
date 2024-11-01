import container from 'markdown-it-container'
import type { RenderRule } from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import path from 'path'
import fs from 'fs'
import { getHighlighter } from 'shikiji'
import MarkdownIt from 'markdown-it'
// import { readFileLine } from '../config/readline'

const getPath = (tokens: Token[], idx: number, info: 'demo') => {
  while (idx++) {
    let line = tokens[idx]!
    if (line.content.startsWith('render(')) {
      return line.content.slice(7, -1).trim()
    }
    // 标签结束或者查到path则结束
    if (line.type === `container_${info}_close`) {
      return ''
    }
  }
}

/**
 * 渲染成为v-demo组件
 * @param name 名称
 * @returns
 */
export async function demoContainer(md: MarkdownIt) {
  const highlighter = await getHighlighter({
    langs: ['vue', 'typescript', 'javascript', 'html'],
    themes: ['github-light', 'github-dark']
  })

  const render: RenderRule = (tokens, idx) => {
    const token = tokens[idx]!

    // 开始标签
    if (token.nesting === 1) {
      /** 获取render内的渲染路径 */
      const sourceFilePath = getPath(tokens, idx, 'demo')
      if (sourceFilePath) {
        const sourceAbsolutePath = path.resolve(
          __dirname,
          '../../examples',
          `${sourceFilePath}.vue`
        )
        const fileExist = fs.existsSync(sourceAbsolutePath)

        if (!fileExist)
          throw new Error(
            `<div>要渲染的文件不存在, path: ${sourceAbsolutePath}`
          )

        const source = fs.readFileSync(sourceAbsolutePath, 'utf-8')

        const highlightSourceCode = highlighter.codeToHtml(source, {
          lang: 'vue',
          themes: {
            light: 'github-light',
            dark: 'github-dark'
          }
        })

        const lines = highlightSourceCode
          .slice(
            highlightSourceCode.indexOf('<code>'),
            highlightSourceCode.indexOf('</code>')
          )
          .split('\n')

        const lineNumberCode = `<div class="line-numbers">${Array.from({
          length: lines.length
        })
          .map((_, index) => {
            return `<span class="line-number">${index + 1}</span>`
          })
          .join('')}</div>`

        // demos在
        return `
        <v-demo :demos="demos" source="${encodeURIComponent(
          lineNumberCode + highlightSourceCode
        )}" path="${sourceFilePath}">
      `
      }

      return ''
    }

    return '</v-demo>'
  }

  md.use(container, 'demo', {
    render
  })
}
