import { defineConfig } from 'vitepress'
import { demoContainer } from './markdown/demo-container'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'
import { importExamples } from './plugins/import-examples'
import components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import { VarletImportResolver } from '@varlet/import-resolver'

export default defineConfig({
  title: 'CatKit',
  description: '基于 TS 的全环境开发工具包',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/banner.png' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
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
    logo: '/banner.png',
    siteTitle: 'CatKit',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      {
        text: '包',
        items: [
          { text: 'Core 核心', link: '/packages/core/' },
          { text: 'HTTP 请求', link: '/packages/http/' },
          { text: 'FE 前端', link: '/packages/fe/' },
          { text: 'Excel 表格', link: '/packages/excel/' },
          { text: 'BE 后端', link: '/packages/be/' }
        ]
      }
    ],



    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        }
      ],
      '/packages/': [
        {
          text: 'Core 核心包',
          collapsed: false,
          items: [
            { text: '概览', link: '/packages/core/' },
            { text: '数据处理', link: '/packages/core/data' },
            { text: '数据结构', link: '/packages/core/data-structure' },
            { text: '日期处理', link: '/packages/core/date' },
            { text: '环境检测', link: '/packages/core/env' },
            { text: '性能优化', link: '/packages/core/optimize' },
            { text: '设计模式', link: '/packages/core/pattern' }
          ]
        },
        {
          text: 'HTTP 请求包',
          collapsed: false,
          items: [
            { text: '概览', link: '/packages/http/' },
            { text: 'HTTP 客户端', link: '/packages/http/client' },
            { text: '插件系统', link: '/packages/http/plugins' },
            { text: '类型定义', link: '/packages/http/types' }
          ]
        },
        {
          text: 'FE 前端包',
          collapsed: false,
          items: [
            { text: '概览', link: '/packages/fe/' },
            { text: '文件操作', link: '/packages/fe/file' },
            { text: '存储', link: '/packages/fe/storage' },
            { text: '虚拟化', link: '/packages/fe/virtualizer' },
            { text: 'Web API', link: '/packages/fe/web-api' },
            { text: '测试', link: '/packages/fe/tests' }
          ]
        },
        {
          text: 'Excel 表格包',
          collapsed: false,
          items: [{ text: '概览', link: '/packages/excel/' }]
        },
        {
          text: 'BE 后端包',
          collapsed: false,
          items: [{ text: '概览', link: '/packages/be/' }]
        }
      ]
    },

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

    config: (md) => {
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
