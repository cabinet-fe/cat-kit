import type { DefaultTheme } from 'vitepress/theme'

const navbar: DefaultTheme.NavItem[] = [
  { text: `工具`, link: '/utils/fe/', activeMatch: '/utils/' },
  {
    text: '实验室',
    items: [
      { text: '数据结构', link: '/lab/data-structure/' },
      { text: '算法', link: '/lab/algorithm/' },
      { text: '设计模式', link: '/lab/pattern/' },
      { text: '前端进阶', link: '/lab/advance/' },
      { text: 'bun', link: '/lab/bun/' }
    ]
  },

  {
    text: '分享',
    items: [
      { text: 'AI专题', link: '/shared/ai/gpt' },
      {
        text: '术语',
        link: '/shared/term/'
      },
      {
        text: '数据库',
        link: '/shared/db/'
      },
      {
        text: 'Typescript',
        link: '/shared/typescript/'
      },
      {
        text: '玩转GitHub',
        link: '/shared/github/'
      },
      {
        text: '其他',
        link: '/shared/others/'
      }
    ]
  }
]

export default navbar
