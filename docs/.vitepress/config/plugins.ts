import container from 'markdown-it-container'
import type { RenderRule } from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import path from 'path'
import fs from 'fs'
import hljs from 'highlight.js/lib/core'
import html from 'highlight.js/lib/languages/xml'
hljs.registerLanguage('html', html)

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

          const sourceHTML =
            '<pre v-pre><code>' +
            hljs.highlight(source, { language: 'html' }).value +
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
