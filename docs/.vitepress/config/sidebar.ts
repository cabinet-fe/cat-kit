export default {
  "/lab/": [
    {
      text: "前端进阶",
      items: [
        { text: "位运算", link: "/lab/advance/bit-opt" },
        { text: "概要", link: "/lab/advance/" },
        { text: "响应式布局", link: "/lab/advance/response-layout" },
        { text: "类型化数组", link: "/lab/advance/typed-array" },
      ],
    },
    {
      text: "算法",
      items: [
        { text: "概要", link: "/lab/algorithm/" },
        { text: "查找算法", link: "/lab/algorithm/search" },
        { text: "排序算法", link: "/lab/algorithm/sort" },
      ],
    },
    { text: "bun 无敌的包子", items: [{ text: "概要", link: "/lab/bun/" }] },
    {
      text: "数据结构",
      items: [
        { text: "数组 Array", link: "/lab/data-structure/array" },
        { text: "图 Graph", link: "/lab/data-structure/graph" },
        { text: "散列表 Hash", link: "/lab/data-structure/hash" },
        { text: "堆 Heap", link: "/lab/data-structure/heap" },
        { text: "概要", link: "/lab/data-structure/" },
        { text: "链表 LinkedList", link: "/lab/data-structure/list" },
        { text: "队列 Queue", link: "/lab/data-structure/queue" },
        { text: "栈 Stack", link: "/lab/data-structure/stack" },
        { text: "树 Tree", link: "/lab/data-structure/tree" },
      ],
    },
    {
      text: "设计模式 Pattern",
      items: [
        { text: "概要", link: "/lab/pattern/" },
        { text: "观察者模式", link: "/lab/pattern/watcher" },
      ],
    },
  ],
  "/shared/": [
    { text: "ai", items: [{ text: "AI", link: "/shared/ai/gpt" }] },
    {
      text: "开发者实用密码学",
      items: [
        { text: "加密算法", link: "/shared/crypto/algo" },
        { text: "概要", link: "/shared/crypto/" },
      ],
    },
    {
      text: "数据库 DataBase",
      items: [
        { text: "概要", link: "/shared/db/" },
        { text: "indexedDB", link: "/shared/db/indexedDB" },
        { text: "mongodb", link: "/shared/db/mongodb" },
        { text: "mysql", link: "/shared/db/mysql" },
        { text: "下一代ORM", link: "/shared/db/orm" },
        { text: "redis", link: "/shared/db/redis" },
        { text: "sqlite", link: "/shared/db/sqlite" },
      ],
    },
    { text: "玩转GitHub", items: [] },
    { text: "图形化", items: [{ text: "概要", link: "/shared/graph/" }] },
    { text: "# 文档开发工具", items: [] },
    {
      text: "performance",
      items: [{ text: "事件性能", link: "/shared/performance/event" }],
    },
    { text: "术语", items: [] },
    {
      text: "typescript",
      items: [
        { text: "配置文件 tsconfig.json", link: "/shared/typescript/config" },
        { text: "声明文件", link: "/shared/typescript/declare" },
        { text: "概要", link: "/shared/typescript/" },
      ],
    },
  ],
  "/utils/": [
    {
      text: "后端工具",
      items: [
        { text: "文件系统", link: "/utils/be/fs" },
        { text: "概要", link: "/utils/be/" },
      ],
    },
    {
      text: "画布工具",
      items: [
        { text: "概要", link: "/utils/canvas/" },
        { text: "舞台", link: "/utils/canvas/stage" },
      ],
    },
    {
      text: "通用工具",
      items: [
        { text: "动画", link: "/utils/common/anime" },
        { text: "编解码", link: "/utils/common/codec" },
        { text: "数据结构", link: "/utils/common/data-structure" },
        { text: "数据类型", link: "/utils/common/data-type" },
        { text: "数据操作", link: "/utils/common/data" },
        { text: "日期 date", link: "/utils/common/date" },
        { text: "概要", link: "/utils/common/" },
        { text: "优化", link: "/utils/common/optimize" },
      ],
    },
    {
      text: "加密和解密",
      items: [
        { text: "非对称加密", link: "/utils/crypto/asymmetric" },
        { text: "哈希函数(信息摘要)", link: "/utils/crypto/hash" },
        { text: "概要", link: "/utils/crypto/" },
        { text: "对称加密", link: "/utils/crypto/symmetric" },
      ],
    },
    {
      text: "前端工具",
      items: [
        { text: "缓存", link: "/utils/fe/cache" },
        { text: "数据库 IndexedDB", link: "/utils/fe/db" },
        { text: "拖拽", link: "/utils/fe/drag" },
        { text: "HTTP", link: "/utils/fe/http" },
        { text: "图片操作", link: "/utils/fe/image" },
        { text: "概要", link: "/utils/fe/" },
        { text: "路径", link: "/utils/fe/path" },
        { text: "浏览器API", link: "/utils/fe/web-api" },
        { text: "WebWorker 工作线程", link: "/utils/fe/worker" },
      ],
    },
  ],
};
