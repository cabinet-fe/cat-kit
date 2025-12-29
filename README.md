# 喵喵工具箱

喵喵工具箱是专为浏览器和 Node.js 端提供简洁、易用和高性能的开发工具包。

## 特性

- 零外部依赖的核心库
- 完整的 TypeScript 类型支持
- 支持 Tree Shaking，按需引入
- 统一的 API 设计风格

## 安装

```bash
# 使用 bun
bun add @cat-kit/core

# 使用 npm
npm install @cat-kit/core

# 使用 pnpm
pnpm add @cat-kit/core
```

## 包列表

| 包名 | 说明 | 环境 |
|------|------|------|
| `@cat-kit/core` | 核心工具包，提供数据处理、数据结构、日期、性能优化等功能 | 通用 |
| `@cat-kit/http` | 基于插件架构的现代 HTTP 客户端 | 通用 |
| `@cat-kit/fe` | 前端工具包，提供存储、虚拟滚动、Web API 封装、文件处理 | 浏览器 |
| `@cat-kit/be` | 后端工具包，提供文件系统、日志、配置管理、缓存等功能 | Node.js |
| `@cat-kit/excel` | Excel 文件处理库，支持流式读写大型文件 | 通用 |
| `@cat-kit/maintenance` | Monorepo 维护工具，提供依赖管理、版本控制、构建和发布 | Node.js |

## 快速开始

### 核心工具

```typescript
import { Dater, Tree, parallel, debounce } from '@cat-kit/core'

// 日期处理
const date = new Dater('2024-01-01')
console.log(date.format('YYYY-MM-DD'))

// 树形结构
const tree = Tree.parse(flatData, { idKey: 'id', parentKey: 'pid' })

// 并行执行
const results = await parallel(tasks, { concurrency: 3 })

// 防抖
const debouncedFn = debounce(fn, 300)
```

### HTTP 客户端

```typescript
import { HttpClient, tokenPlugin } from '@cat-kit/http'

const client = new HttpClient({ baseURL: 'https://api.example.com' })

client.use(tokenPlugin({
  getToken: () => localStorage.getItem('token')
}))

const response = await client.get('/users')
```

### Excel 处理

```typescript
import { readWorkbookStream, StreamWorkbookWriter } from '@cat-kit/excel'

// 流式读取
for await (const { row } of await readWorkbookStream(file)) {
  console.log(row)
}

// 流式写入
const writer = new StreamWorkbookWriter()
const sheet = writer.createSheet('Sheet1')
sheet.addRow(['Name', 'Age'])
sheet.addRow(['Alice', 25])
await writer.download('data.xlsx')
```

## 项目结构

```
packages/
├── core/          # 核心工具包
├── http/          # HTTP 客户端
├── fe/            # 前端工具包
├── be/            # 后端工具包
├── excel/         # Excel 处理库
├── maintenance/   # Monorepo 维护工具
└── tests/         # 测试文件
```

## 开发

```bash
# 安装依赖
bun install

# 构建所有包
bun run build

# 运行测试
bun run test
```

## 许可证

MIT
