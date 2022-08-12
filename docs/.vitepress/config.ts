import { defineConfig } from 'vitepress'
import { version } from '../../package.json'
import nav from './config/navbar'
import sidebar from './config/sidebar'

export default defineConfig({
  lang: 'zh-CN',
  title: `fe-dk v${version}`,
  description: '前端开发工具包',
  base: '/fe-dk/',

  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: `/images/logo.png`
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cabinet-fe/fe-dk' }
    ],
    logo: '/images/logo.png',
    nav,
    sidebar
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
