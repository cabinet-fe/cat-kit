import { DefaultTheme } from 'vitepress'
import fs from 'fs-extra'
import path from 'path'
import { readFileLine } from 'node-utils'

const docsDir = path.resolve(__dirname, '../..')

// 跳过检测的目录
const skippedFiles = new Set(['.vitepress', 'node_modules', 'public'])

// 获取存放md文件的目录 docs/*
const dirs = fs
  .readdirSync(docsDir, {
    withFileTypes: true
  })
  .filter(dirent => dirent.isDirectory() && !skippedFiles.has(dirent.name))
  .map(dirent => dirent.name)

const bars = dirs.reduce((acc, cur) => {
  // 一级目录 docs/*/*
  const dirs = fs.readdirSync(path.resolve(docsDir + `/${cur}`), {
    withFileTypes: true
  })

  const isNest = dirs.some(dir => dir.isDirectory())

  // 有二级目录再读取二级目录
  if (isNest) {
    acc[`/${cur}/`] = dirs.map(dir => {
      // fs.readFileSync()
    })
  } else {
    readFileLine(path.resolve(docsDir, cur, 'index.md'), (lineIndex, str) => {
      return lineIndex < 5
    }).then(v => {
      console.log(v)
    })
    const indexFileContent = fs.readFileSync(
      path.resolve(docsDir, cur, 'index.md'),
      'utf-8'
    )
    // const title =
    acc[`/${cur}/`] = []
  }

  return acc
}, {} as DefaultTheme.Sidebar)

const sidebar: DefaultTheme.Sidebar = {
  '/lab/': [
    {
      text: '数据结构',
      collapsible: true,
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
      items: []
    }
  ],

  '/utils/': [
    {
      text: '工具',
      items: [
        { text: '概要', link: '/utils/index' },
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
      text: '术语',
      items: [
        { text: '概要', link: '/shared/term/' },
        { text: '基础', link: '/shared/term/basic' },
        { text: 'oauth2', link: '/shared/term/oauth2' },
        { text: 'restful', link: '/shared/term/restful' },
        { text: '工作流', link: '/shared/term/workflow' },
        { text: '元编程', link: '/shared/term/meta-program' }
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
      items: []
    },
    {
      text: '其他',
      items: [{ text: '概要', link: '/shared/others/' }]
    }
  ]
}

export default sidebar
