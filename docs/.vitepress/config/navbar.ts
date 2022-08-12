import { DefaultTheme } from 'vitepress'

const navbar: DefaultTheme.NavItem[] = [
  { text: `工具`, link: '/utils/cache', activeMatch: '/utils/' },
  {
    text: '实验室',
    items: [
      { text: '数据结构', link: '/lab/data-structure/' },
      { text: '算法', link: '/lab/algorithm/' },
      { text: '设计模式', link: '/lab/pattern/' }
    ]
  },

  {
    text: '分享',
    items: [
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
        text: '其他',
        link: '/shared/others/'
      }
    ]
  }
]

export default navbar
