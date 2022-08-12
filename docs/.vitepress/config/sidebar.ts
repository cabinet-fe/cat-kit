import { DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = {
  '/lab/data-structure/': [
    {
      text: '数据结构',
      items: [
        { text: '数组', link: '/lab/data-structure/array' },
        { text: '队列', link: '/lab/data-structure/queue' },
        { text: '栈', link: '/lab/data-structure/stack' },
        { text: '链表', link: '/lab/data-structure/list' },
        { text: '树', link: '/lab/data-structure/tree' },
        { text: '堆', link: '/lab/data-structure/heap' },
        { text: '散列表', link: '/lab/data-structure/hash' },
        { text: '图', link: '/lab/data-structure/graph' }
      ]
    }
  ],
  '/lab/algorithm/': [
    {
      text: '算法',
      items: [
        { text: '查找', link: '/lab/algorithm/search' },
        { text: '排序', link: '/lab/algorithm/sort' }
      ]
    }
  ],
  '/utils/': [
    {
      text: '工具',
      items: [
        { text: '缓存', link: '/utils/cache' },
        { text: '数据类型', link: '/utils/data-type' },
        { text: '数据处理', link: '/utils/data' },
        { text: 'HTTP', link: '/utils/http' },
        { text: '路径', link: '/utils/path' },
        { text: '日期', link: '/utils/date' },
        { text: '加密', link: '/utils/crypto' },
        { text: '哈希', link: '/utils/hash' },
        { text: '数据库', link: '/utils/db.md' },
        { text: '编解码', link: '/utils/codec' },
        { text: '图片', link: '/utils/image' }
      ]
    }
  ],

  '/shared/': [
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
      text: '术语',
      items: [
        { text: '概要', link: '/shared/term/' },
        { text: '基础', link: '/shared/term/basic' },
        { text: 'oauth2', link: '/shared/term/oauth2' },
        { text: 'restful', link: '/shared/term/restful' },
        { text: '工作流', link: '/shared/term/workflow' }
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
      text: '其他',
      items: [{ text: '概要', link: '/shared/others/' }]
    }
  ]
}

export default sidebar
