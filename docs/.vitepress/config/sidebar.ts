import { DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = {
  '/utils/': [
    {
      text: '前端工具',
      items: [
        { text: '概要', link: '/utils/' },
        { text: '缓存', link: '/utils/fe/cache' },
        { text: 'HTTP', link: '/utils/fe/http' },
        { text: '路径', link: '/utils/fe/path' },
        { text: '数据库', link: '/utils/fe/db.md' },
        { text: '图片', link: '/utils/fe/image' },
        { text: '工作线程', link: '/utils/fe/worker' }
      ]
    },
    {
      text: '后端工具',
      items: []
    },
    {
      text: '通用工具',
      items: [
        { text: '数据处理', link: '/utils/common/data' },
        { text: '数据类型', link: '/utils/common/data-type' },
        { text: '日期', link: '/utils/common/date' },
        { text: '加密', link: '/utils/common/crypto' },
        { text: '信息摘要', link: '/utils/common/hash' },
        { text: '编解码', link: '/utils/common/codec' }
      ]
    }
  ],

  '/lab/': [
    {
      text: '数据结构',
      collapsible: true,
      items: [
        { text: '概要', link: '/lab/data-structure/' },
        { text: '数组', link: '/lab/data-structure/array' },
        { text: '队列', link: '/lab/data-structure/queue' },
        { text: '栈', link: '/lab/data-structure/stack' },
        { text: '链表', link: '/lab/data-structure/list' },
        { text: '树', link: '/lab/data-structure/tree' },
        { text: '堆', link: '/lab/data-structure/heap' },
        { text: '散列表', link: '/lab/data-structure/hash' },
        { text: '图', link: '/lab/data-structure/graph' }
      ]
    },
    {
      text: '算法',
      items: [
        { text: '查找', link: '/lab/algorithm/search' },
        { text: '排序', link: '/lab/algorithm/sort' }
      ]
    },
    {
      text: '设计模式',
      items: [
        { text: '概要', link: '/lab/pattern/' },
        { text: '观察者', link: '/lab/pattern/watcher' }
      ]
    }
  ],

  '/shared/': [
    {
      text: '术语',
      items: [
        { text: '概要', link: '/shared/term/' },
        { text: '基础', link: '/shared/term/basic' },
        { text: 'oauth2', link: '/shared/term/oauth2' },
        { text: 'restful', link: '/shared/term/restful' },
        { text: '工作流', link: '/shared/term/workflow' },
        { text: '元编程', link: '/shared/term/meta-program' },
        { text: '开源协议', link: '/shared/term/license' }
      ]
    },
    {
      text: '数据库',
      items: [
        { text: '概要', link: '/shared/db/' },
        { text: 'mysql', link: '/shared/db/mysql' },
        { text: 'mongodb', link: '/shared/db/mongodb' },
        { text: 'redis', link: '/shared/db/redis' },
        { text: 'sqlite', link: '/shared/db/sqlite' }
      ]
    },

    {
      text: 'Typescript',
      items: [
        { text: '声明', link: '/shared/typescript/declare' },
        { text: '配置', link: '/shared/typescript/config' }
      ]
    },
    {
      text: '玩转GitHub',
      items: [
        { text: '概要', link: '/shared/github/' },
        { text: '首页', link: '/shared/github/home' },
        { text: '创建仓库', link: '/shared/github/create-repo' },
        { text: 'issue', link: '/shared/github/issue' },
        { text: 'pull request', link: '/shared/github/pr' }
      ]
    },
    {
      text: '其他',
      items: [{ text: '概要', link: '/shared/others/' }]
    }
  ]
}

export default sidebar
