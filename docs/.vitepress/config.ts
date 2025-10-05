import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CatKit',
  description: '基于 TS 的全环境开发工具包',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
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
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      {
        text: '核心工具',
        items: [
          { text: '数据处理', link: '/core/data/array' },
          { text: '日期工具', link: '/core/date' },
          { text: '性能优化', link: '/core/optimize/timer' },
          { text: '设计模式', link: '/core/pattern/observer' }
        ]
      },
      {
        text: '加密工具',
        items: [
          { text: 'AES 加密', link: '/crypto/symmetric/aes' },
          { text: 'MD5 哈希', link: '/crypto/digest/md5' },
          { text: 'SHA256 哈希', link: '/crypto/digest/sha256' },
          { text: 'ID 生成', link: '/crypto/key-gen/nanoid' }
        ]
      },
      {
        text: '前端工具',
        items: [
          { text: '存储管理', link: '/fe/storage/storage' },
          { text: '文件操作', link: '/fe/file/read' },
          { text: 'Web API', link: '/fe/web-api/clipboard' },
          { text: '虚拟滚动', link: '/fe/virtualizer/' }
        ]
      },
      {
        text: 'HTTP',
        link: '/http/'
      },
      {
        text: '链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/cabinet-fe/cat-kit' },
          {
            text: '更新日志',
            link: 'https://github.com/cabinet-fe/cat-kit/releases'
          }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '最佳实践', link: '/guide/best-practice' },
            { text: '文档状态', link: '/guide/documentation-status' }
          ]
        }
      ],
      '/core/': [
        {
          text: '数据处理',
          collapsed: false,
          items: [
            { text: '数组工具', link: '/core/data/array' },
            { text: '字符串工具', link: '/core/data/string' },
            { text: '对象工具', link: '/core/data/object' },
            { text: '数字工具', link: '/core/data/number' },
            { text: '类型判断', link: '/core/data/type' },
            { text: '类型转换', link: '/core/data/transform' },
            { text: '数据验证', link: '/core/data/validator' }
          ]
        },
        {
          text: '数据结构',
          collapsed: false,
          items: [
            { text: '树结构', link: '/core/data-structure/tree' },
            { text: '森林结构', link: '/core/data-structure/forest' }
          ]
        },
        {
          text: '日期工具',
          collapsed: false,
          items: [{ text: '日期处理', link: '/core/date' }]
        },
        {
          text: '性能优化',
          collapsed: false,
          items: [
            { text: '定时器', link: '/core/optimize/timer' },
            { text: '并行执行', link: '/core/optimize/parallel' },
            { text: '安全执行', link: '/core/optimize/safe' }
          ]
        },
        {
          text: '设计模式',
          collapsed: false,
          items: [{ text: '观察者模式', link: '/core/pattern/observer' }]
        }
      ],
      '/crypto/': [
        {
          text: '对称加密',
          collapsed: false,
          items: [{ text: 'AES 加密', link: '/crypto/symmetric/aes' }]
        },
        {
          text: '哈希摘要',
          collapsed: false,
          items: [
            { text: 'MD5', link: '/crypto/digest/md5' },
            { text: 'SHA256', link: '/crypto/digest/sha256' }
          ]
        },
        {
          text: '密钥生成',
          collapsed: false,
          items: [{ text: 'NanoID', link: '/crypto/key-gen/nanoid' }]
        },
        {
          text: '基础',
          collapsed: false,
          items: [
            { text: '类型定义', link: '/crypto/base/types' },
            { text: '工具函数', link: '/crypto/base/utils' }
          ]
        }
      ],
      '/fe/': [
        {
          text: '存储管理',
          collapsed: false,
          items: [
            { text: 'Storage', link: '/fe/storage/storage' },
            { text: 'Cookie', link: '/fe/storage/cookie' },
            { text: 'IndexedDB', link: '/fe/storage/idb' }
          ]
        },
        {
          text: '文件操作',
          collapsed: false,
          items: [
            { text: '读取文件', link: '/fe/file/read' },
            { text: '保存文件', link: '/fe/file/save' }
          ]
        },
        {
          text: 'Web API',
          collapsed: false,
          items: [
            { text: '剪贴板', link: '/fe/web-api/clipboard' },
            { text: '权限管理', link: '/fe/web-api/permission' }
          ]
        },
        {
          text: '组件',
          collapsed: false,
          items: [{ text: '虚拟滚动', link: '/fe/virtualizer/' }]
        }
      ],
      '/http/': [
        {
          text: 'HTTP 工具',
          items: [
            { text: '概述', link: '/http/' },
            { text: '快速开始', link: '/http/getting-started' },
            { text: 'API 参考', link: '/http/api' }
          ]
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
  }
})
