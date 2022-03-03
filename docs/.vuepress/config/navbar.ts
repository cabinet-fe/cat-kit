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
      {
        text: '其他',
        link: '/lab/others/'
      }
    ]
  },

  {
    text: '学习',
    link: '/learn/',
    children: [
      {
        text: '术语',
        link: '/learn/term/'

      },
      {
        text: '数据库',
        link: '/learn/db/'
      }
    ]
  }
]

export default navbar
