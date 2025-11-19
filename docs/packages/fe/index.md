# FE 前端工具包

`@cat-kit/fe` 提供了一套完整的浏览器端工具函数和类库，涵盖存储、文件操作、虚拟化和 Web API 等常用功能。

## 安装

```bash
bun add @cat-kit/fe
```

## 特性

- 🗄️ **存储管理** - 支持 LocalStorage、SessionStorage、Cookie 和 IndexedDB
- 📁 **文件操作** - 文件读取和保存的简单封装
- 📋 **剪贴板** - 统一的剪贴板读写 API
- 🎯 **权限查询** - Web 权限状态查询
- 📜 **虚拟滚动** - 高性能的虚拟滚动实现

## 快速开始

### 存储操作

```typescript
import { storage, cookie } from '@cat-kit/fe'

// LocalStorage 操作
storage.local.set('token', 'abc123', 3600) // 1小时后过期
const token = storage.local.get('token')

// Cookie 操作
cookie.set('user', 'admin', { expires: 7 * 24 * 3600 }) // 7天
const user = cookie.get('user')
```

### 文件操作

```typescript
import { readFile, saveFile } from '@cat-kit/fe'

// 读取文件
await readFile(file, {
  chunkSize: 1024 * 1024, // 1MB
  onChunk: (chunk, index) => {
    console.log(`读取第 ${index} 块`)
  }
})

// 保存文件
saveFile(blob, 'download.txt')
```

### 剪贴板操作

```typescript
import { clipboard } from '@cat-kit/fe'

// 复制文本
await clipboard.copy('Hello World')

// 读取文本
const text = await clipboard.readText()
```

## 模块列表

- [存储](./storage) - WebStorage、Cookie、IndexedDB
- [文件操作](./file) - 文件读取和保存
- [Web API](./web-api) - 剪贴板、权限查询
- [虚拟化](./virtualizer) - 虚拟滚动实现

## 浏览器兼容性

大部分功能需要现代浏览器支持：

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

某些功能（如 IndexedDB、Clipboard API）可能需要更高版本。
