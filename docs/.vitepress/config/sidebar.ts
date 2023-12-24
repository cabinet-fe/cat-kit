import type { DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = {
  '/utils/': [
    {
      text: '前端工具',
      items: [
        { text: '概要', link: '/utils/fe/' },
        { text: '缓存', link: '/utils/fe/cache' },
        { text: 'HTTP', link: '/utils/fe/http' },
        { text: '路径', link: '/utils/fe/path' },
        { text: '数据库', link: '/utils/fe/db.md' },
        { text: '图片', link: '/utils/fe/image' },
        { text: '工作线程', link: '/utils/fe/worker' },
        { text: '浏览器API', link: '/utils/fe/web-api' }
      ]
    },
    {
      text: '画布工具',
      items: [
        { text: '概要', link: '/utils/canvas/' },
        { text: '舞台', link: '/utils/canvas/stage' },
        { text: '矩形', link: '/utils/canvas/rect' }
      ]
    },
    {
      text: '后端工具',
      items: [
        { text: '概要', link: '/utils/be/' },
        { text: '文件系统', link: '/utils/be/fs' }
      ]
    },
    {
      text: '通用工具',
      items: [
        { text: '数据处理', link: '/utils/common/data' },
        { text: '数据类型', link: '/utils/common/data-type' },
        { text: '数据结构', link: '/utils/common/data-structure' },
        { text: '动画', link: '/utils/common/anime' },
        { text: '日期', link: '/utils/common/date' },
        { text: '编解码', link: '/utils/common/codec' },
        { text: '优化', link: '/utils/common/optimize' }
      ]
    },
    {
      text: '加密工具',
      items: [
        { text: '概要', link: '/utils/crypto/' },
        { text: '哈希函数', link: '/utils/crypto/hash' },
        { text: '对称加密', link: '/utils/crypto/symmetric' },
        { text: '非对称加密', link: '/utils/crypto/asymmetric' },
        { text: '加密性能', link: '/utils/crypto/performance' }
      ]
    }
  ],

  '/lab/': [
    {
      text: '数据结构',
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
    },
    {
      text: '前端进阶',
      items: [
        { text: '概要', link: '/lab/advance/' },
        { text: '位运算', link: '/lab/advance/bit-opt' },
        { text: '类型化数组', link: '/lab/advance/typed-array' }
      ]
    }
  ],

  '/shared/': [
    {
      text: 'AI专题',
      items: [{ text: 'chat-gpt', link: '/shared/ai/gpt' }]
    },
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
        { text: '下一代ORM', link: '/shared/db/orm' },
        { text: 'mysql', link: '/shared/db/mysql' },
        { text: 'mongodb', link: '/shared/db/mongodb' },
        { text: 'redis', link: '/shared/db/redis' },
        { text: 'sqlite', link: '/shared/db/sqlite' }
      ]
    },

    {
      text: '实用密码学',
      items: [
        { text: '概要', link: '/shared/crypto/' },
        { text: '加密算法', link: '/shared/crypto/algo' }
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
      items: [
        { text: '概要', link: '/shared/others/' },
        { text: '职级评定指南', link: '/shared/others/position' }
      ]
    }
  ]
}

export default sidebar
