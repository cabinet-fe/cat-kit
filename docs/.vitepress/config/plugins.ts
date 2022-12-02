import container from 'markdown-it-container'
import type { RenderRule } from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import path from 'path'
import fs from 'fs'
import hljs from 'highlight.js/lib/core'
import html from 'highlight.js/lib/languages/xml'
import ts from 'highlight.js/lib/languages/typescript'
hljs.registerLanguage('html', html)
hljs.registerLanguage('ts', ts)

const getPath = (tokens: Token[], idx: number, info: 'demo') => {
  while (idx++) {
    let line = tokens[idx]
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
export function demoContainer(name: string): [typeof container, string, { render: RenderRule }] {
  return [container, name, {
    render(tokens, idx) {
      const token = tokens[idx]

      // 开始标签
      if (token.nesting === 1) {
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

          const html = source.match(/<template>[\s\S\r]*<\/template>/)?.[0] ?? source
          const scripts = source.match(/(<script[\s\S]*>)([\s\S\r]*)(<\/script>)/)
          const whiteSpace = source.match(/<\/template>([\s\s\r]*)<script/)?.[1] ?? '\n'

          let scriptBlock = ''
          if (scripts) {
            scriptBlock += hljs.highlight(scripts[1], { language: 'html' }).value
            scriptBlock += hljs.highlight(scripts[2], { language: 'ts' }).value
            scriptBlock += hljs.highlight(scripts[3], { language: 'html' }).value
          }

          const sourceHTML =
            '<pre v-pre><code>' +
            hljs.highlight(html, { language: 'html' }).value + whiteSpace +
            scriptBlock
            '</code></pre>'

          return `
            <v-demo :demos="demos" source="${encodeURIComponent(
              sourceHTML
            )}" path="${sourceFilePath}">
          `
        }

        return ''
      } else {
        return '</v-demo>'
      }
    }
  }]
}
