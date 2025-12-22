import { defineConfig } from 'vitepress'
import { demoContainer } from './markdown/demo-container'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'
import { importExamples } from './plugins/import-examples'
import components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import { VarletImportResolver } from '@varlet/import-resolver'
import { sidebar } from './sidebar'

export default defineConfig({
  title: 'CatKit',
  description: '基于 TS 的全环境开发工具包',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  srcDir: 'content',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    // 霞鹜文楷字体
    ['link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css'
      }
    ],
    ['meta', { name: 'theme-color', content: '#1a1a1a' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh' }],
    ['meta', { property: 'og:title', content: 'CatKit | 喵喵工具箱' }],
    ['meta', { property: 'og:site_name', content: 'CatKit' }],
    [
      'meta',
      { property: 'og:description', content: '基于 TS 的全环境开发工具包' }
    ]
  ],

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'CatKit',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      {
        text: '包',
        items: [
          { text: '核心库', link: '/packages/core/' },
          { text: 'HTTP请求', link: '/packages/http/' },
          { text: '前端', link: '/packages/fe/' },
          { text: 'Excel处理', link: '/packages/excel/' },
          { text: '后端', link: '/packages/be/' },
          { text: '维护工具', link: '/packages/maintenance/' }
        ]
      }
    ],

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cabinet-fe/cat-kit' }
    ],

    editLink: {
      pattern: 'https://github.com/cabinet-fe/cat-kit/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2022-present 元智慧前端小分队'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航',
      level: [2, 3]
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    search: {
      provider: 'local',

      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    }
  },

  markdown: {
    lineNumbers: true,

    config: md => {
      md.use(demoContainer)
      md.use(copyOrDownloadAsMarkdownButtons)
    }
  },

  vite: {
    ssr: {
      noExternal: ['@varlet/ui']
    },
    plugins: [
      llmstxt(),
      importExamples(),
      components({
        resolvers: [VarletImportResolver()]
      }),
      autoImport({
        resolvers: [VarletImportResolver({ autoImport: true })]
      })
    ]
  }
})
