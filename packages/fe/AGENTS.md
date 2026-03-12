# @cat-kit/fe - 前端工具包

浏览器专用前端工具包，提供存储、虚拟滚动、Web API 封装和文件处理等功能。

**依赖**：`@cat-kit/core`
**运行环境**：仅浏览器

## 目录结构

```
packages/fe/src/
├── storage/           # 存储解决方案
│   ├── cookie.ts      # Cookie 操作
│   ├── indexed-db.ts  # IndexedDB 封装
│   ├── unified.ts     # 统一存储 API
│   └── index.ts
├── virtualizer/       # 虚拟滚动
│   ├── core.ts        # 虚拟滚动核心实现
│   └── index.ts
├── web-api/           # Web API 封装
│   ├── clipboard.ts   # 剪贴板 API
│   ├── permission.ts  # 权限 API
│   └── index.ts
├── file/              # 文件处理
│   ├── saver.ts       # 文件保存/下载
│   ├── read.ts        # 文件读取
│   └── index.ts
└── index.ts           # 主导出文件
```

**当 `fe/src` 中添加文件、文件意义变更时同步上面的目录结构！**

## 约束

- 基础工具函数从 `@cat-kit/core` 导入，禁止重复实现
- 使用浏览器 API 前检测可用性
- 异步操作使用 Promise
- 所有公共 API 通过 `src/index.ts` 统一导出
