const sidebar = {
  '/lab/data-structure/': [
    '/lab/data-structure/index.md',
    '/lab/data-structure/array.md',
    '/lab/data-structure/queue.md',
    '/lab/data-structure/stack.md',
    '/lab/data-structure/list.md',
    '/lab/data-structure/tree.md',
    '/lab/data-structure/heap.md',
    '/lab/data-structure/hash.md',
    '/lab/data-structure/graph.md'
  ],

  '/lab/algorithm/': [
    '/lab/algorithm/index.md',
    '/lab/algorithm/sort.md',
    '/lab/algorithm/search.md'
  ],


  '/utils/': [
    {
      text: '工具',
      activeMatch: '/utils/cache.html',
      children: [
        '/utils/cache.md',
        '/utils/data-type.md',
        '/utils/data.md',
        '/utils/HTTP.md',
        '/utils/path.md',
        '/utils/date.md',
        '/utils/crypto.md',
        '/utils/hash.md',
        '/utils/db.md',
        '/utils/codec.md',
        '/utils/image.md'
      ]
    }
  ],
  '/shared/db/': [
    '/shared/db/index.md',
    '/shared/db/mysql.md',
    '/shared/db/mongodb.md',
    '/shared/db/redis.md',
    '/shared/db/sqlite.md'
  ],
  '/shared/term/': [
    '/shared/term/index.md',
    '/shared/term/basic.md',
    '/shared/term/oauth2.md',
    '/shared/term/restful.md',
    '/shared/term/workflow.md'
  ],
  '/shared/typescript/': [
    '/shared/typescript/declare.md',
    '/shared/typescript/config.md',
  ],
  '/shared/others/': [
    '/shared/others/index.md'
  ],
}

export default sidebar
