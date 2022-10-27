import { defineConfig } from 'vitepress'
import nav from './config/navbar'
import sidebar from './config/sidebar'

export default defineConfig({
  lang: 'zh-CN',
  title: `fe-dk`,
  description: '前端开发工具包和知识分享',
  base: '/fe-dk/',

  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: `/fe-dk/images/logo.png`
      }
    ]
  ],
  lastUpdated: true,

  markdown: {
    lineNumbers: true
  },

  themeConfig: {
    footer: {
      message: 'MIT Licensed',
      copyright: '© 2022-PRESENT 元和前端'
    },

    editLink: {
      pattern: 'https://github.com/cabinet-fe/fe-dk/tree/main/docs/:path',
      text: '在GitHub中编辑此页'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cabinet-fe/fe-dk' }
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
