# 安装

## 包管理器

推荐使用包管理器安装 CatKit，这样可以轻松管理依赖和版本。

### npm

```bash
npm install @cat-kit/core
npm install @cat-kit/crypto
npm install @cat-kit/fe
npm install @cat-kit/http
```

### pnpm

```bash
pnpm add @cat-kit/core
pnpm add @cat-kit/crypto
pnpm add @cat-kit/fe
pnpm add @cat-kit/http
```

### Yarn

```bash
yarn add @cat-kit/core
yarn add @cat-kit/crypto
yarn add @cat-kit/fe
yarn add @cat-kit/http
```

### Bun

```bash
bun add @cat-kit/core
bun add @cat-kit/crypto
bun add @cat-kit/fe
bun add @cat-kit/http
```

## 包说明

### @cat-kit/core

核心工具包，包含最常用的工具函数：

- 数据处理（数组、字符串、对象、数字）
- 数据结构（树、森林）
- 日期处理
- 性能优化（定时器、并行执行、安全执行）
- 设计模式（观察者）

**特点**：零依赖，可在任何 JavaScript 环境中使用。

```bash
npm install @cat-kit/core
```

### @cat-kit/crypto

加密和哈希工具包：

- 对称加密（AES-256-GCM、AES-256-CBC）
- 哈希摘要（MD5、SHA256）
- 密钥生成（NanoID）

**特点**：同时支持 Web Crypto API 和纯 JavaScript 实现。

```bash
npm install @cat-kit/crypto
```

### @cat-kit/fe

前端专用工具包：

- 存储管理（LocalStorage、SessionStorage、Cookie、IndexedDB）
- 文件操作（读取、保存）
- Web API（剪贴板、权限）
- 虚拟滚动

**特点**：仅在浏览器环境中使用。

```bash
npm install @cat-kit/fe
```

### @cat-kit/http

HTTP 请求工具包：

- 统一的 HTTP 客户端
- 支持 Fetch 和 XMLHttpRequest
- 插件系统
- 请求/响应拦截

**特点**：可在浏览器和 Node.js 环境中使用。

```bash
npm install @cat-kit/http
```

## 版本要求

### Node.js

- Node.js >= 16.x

### TypeScript

- TypeScript >= 5.0（如果使用 TypeScript）

### 浏览器

CatKit 支持所有现代浏览器：

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

::: warning 注意
不支持 IE11 及更旧的浏览器。
:::

## 按需导入

CatKit 完全支持 ES Modules 和 tree-shaking：

```typescript
// ✅ 推荐：只导入需要的功能
import { chunk, unique } from '@cat-kit/core'
import { md5 } from '@cat-kit/crypto/digest/md5'
import { Storage } from '@cat-kit/fe'

// ❌ 不推荐：导入整个包
import * as core from '@cat-kit/core'
```

## TypeScript 配置

如果你使用 TypeScript，建议在 `tsconfig.json` 中添加以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // 或 "node16"
    "module": "ESNext",
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["node"]
  }
}
```

## 验证安装

安装完成后，可以通过以下代码验证：

```typescript
import { chunk } from '@cat-kit/core'

console.log(chunk([1, 2, 3, 4], 2))
// 输出: [[1, 2], [3, 4]]
```

## 更新

### 检查更新

```bash
npm outdated @cat-kit/core
```

### 更新到最新版本

```bash
npm update @cat-kit/core
```

### 更新到指定版本

```bash
npm install @cat-kit/core@4.0.0
```

## 故障排除

### 模块解析错误

如果遇到模块解析错误，请确保：

1. Node.js 版本 >= 16
2. package.json 中设置了 `"type": "module"` 或使用 `.mjs` 扩展名
3. TypeScript 配置正确

### 类型定义问题

如果 TypeScript 无法识别类型：

```bash
# 重新安装包
rm -rf node_modules package-lock.json
npm install

# 清理 TypeScript 缓存
rm -rf node_modules/.cache
```

## 下一步

- 查看 [快速开始](/guide/getting-started) 了解基本用法
- 阅读 [最佳实践](/guide/best-practice) 学习推荐模式
