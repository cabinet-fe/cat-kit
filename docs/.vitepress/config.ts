import { defineConfig } from 'vitepress'
import nav from './config/navbar'
import sidebar from './config/sidebar'
import { demoContainer } from './markdown/plugins'

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

    config: async md => {

      md.use(demoContainer)
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
