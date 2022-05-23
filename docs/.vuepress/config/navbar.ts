const navbar = [
  {
    text: `工具`,
    link: '/utils/'
  },
  {
    text: '实验室',
    link: '/lab/',
    children: [
      {
        text: '数据结构',
        link: '/lab/data-structure/'
      },
      {
        text: '算法',
        link: '/lab/algorithm/'
      },
      {
        text: '设计模式',
        link: '/lab/pattern/'
      },

    ]
  },

  {
    text: '分享',
    link: '/shared/',
    children: [
      {
        text: '术语',
        link: '/shared/term/'

      },
      {
        text: '数据库',
        link: '/shared/db/'
      },
      {
        text: 'TypeScript',
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
