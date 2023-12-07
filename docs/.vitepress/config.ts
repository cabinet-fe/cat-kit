import { defineConfig } from 'vitepress'
import nav from './config/navbar'
import sidebar from './config/sidebar'
import { demoContainer } from './markdown/plugins'

export default defineConfig({
  lang: 'zh-CN',
  title: '喵喵工具箱',
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

  sitemap: {
    hostname: 'https://cabinet-fe.github.io'
  },

  markdown: {
    lineNumbers: true,

    config: async md => {
      md.use(demoContainer)
    }
  },

  themeConfig: {
    footer: {
      message: 'MIT Licensed',
      copyright: '© 2022-PRESENT 元智慧前端'
    },

    outline: {
      label: '当前页面',
      level: 'deep'
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
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },
          modal: {
            noResultsText: '找不到该结果：',
            resetButtonTitle: '清除查询',
            footer: {
              navigateText: '切换',
              closeText: '关闭',
              selectText: '选择'
            },
            displayDetails: '显示列表详情'
          }
        }
      }
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
