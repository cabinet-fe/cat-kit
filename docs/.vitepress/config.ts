import { defineConfig } from 'vitepress'
import container from 'markdown-it-container'
import type MarkdownIt from 'markdown-it'
import type { RenderRule } from 'markdown-it/lib/renderer'
import nav from './config/navbar'
import sidebar from './config/sidebar'
import type Token from 'markdown-it/lib/token'
import fs from 'fs'
import path from 'path'
import prism from 'prismjs'
import loadLanguages from 'prismjs/components/index'

loadLanguages(['markup', 'css', 'javascript'])

const createContainer = (
  md: MarkdownIt,
  name: string,
  options: { render: RenderRule }
) => {
  md.use(container, name, options)
}

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

export default defineConfig({
  lang: 'zh-CN',
  title: 'cat-kit',
  description: '前端开发工具包和知识分享',
  base: '/cat-kit/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: `/cat-kit/images/logo.png`
      }
    ]
  ],
  lastUpdated: true,

  markdown: {
    lineNumbers: true,

    config: md => {
      createContainer(md, 'demo', {
        render(tokens, idx) {
          const token = tokens[idx]

          // 开始标签
          if (token.nesting === 1) {
            const sourceFilePath = getPath(tokens, idx, 'demo')

            if (sourceFilePath) {
              const sourceAbsolutePath = path.resolve(
                __dirname,
                '../examples',
                `${sourceFilePath}.vue`
              )
              const fileExist = fs.existsSync(sourceAbsolutePath)

              if (!fileExist)
                throw new Error(
                  `<div>要渲染的文件不存在, path: ${sourceAbsolutePath}`
                )

              const source = fs.readFileSync(sourceAbsolutePath, 'utf-8')
              return `
                <v-demo :demos="demos" source="${encodeURIComponent(
                  prism.highlight(source, prism.languages['markup'], 'markup')
                )}" path="${sourceFilePath}">
              `
            }

            return ''
          } else {
            return '</v-demo>'
          }
        }
      })
    }
  },

  themeConfig: {
    footer: {
      message: 'MIT Licensed',
      copyright: '© 2022-PRESENT 元和前端'
    },

    editLink: {
      pattern: 'https://github.com/cabinet-fe/cat-kit/tree/main/docs/:path',
      text: '在GitHub中编辑此页'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cabinet-fe/cat-kit' }
    ],

    logo: '/images/logo.png',

    nav,

    sidebar,

    lastUpdatedText: '最后更新于',

    docFooter: {
      prev: '上一节',
      next: '下一节'
    }
  },

  vite: {
    server: {
      host: true,
      port: 2333
    },
    build: {
      minify: 'terser',
      chunkSizeWarningLimit: Infinity
    },
    json: {
      stringify: true
    }
  }
})
