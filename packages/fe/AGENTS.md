# @cat-kit/fe - 前端工具包

本文件为 `@cat-kit/fe` 包提供详细的开发指导。

## 包概述

`@cat-kit/fe` 是专门为浏览器环境设计的前端工具包，提供存储、虚拟滚动、Web API 封装和文件处理等功能。

**包名称**：`@cat-kit/fe`
**依赖关系**：依赖 `@cat-kit/core`
**运行环境**：仅浏览器（Browser only）

## 依赖说明

⚠️ **重要**：在开发此包时，如果需要使用基础工具函数，应优先从 `@cat-kit/core` 导入，而不是重新实现。

```typescript
// ✅ 正确：从 core 导入
import { isObject, deepClone } from '@cat-kit/core/src'

// ❌ 错误：重新实现已有功能
function isObject(value: unknown): boolean { ... }
```

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
│   ├── saver.ts       # 文件保存
│   ├── read.ts        # 文件读取
│   └── index.ts
└── index.ts           # 主导出文件
```

## 模块说明

### 1. storage/ - 存储解决方案

提供多种浏览器存储方案的封装：

- **cookie.ts**：Cookie 操作封装（读取、设置、删除）
- **indexed-db.ts**：IndexedDB 的 Promise 化封装
- **unified.ts**：统一的存储 API，自动选择最佳存储方案

**使用场景**：
- 需要持久化用户数据
- 需要大容量客户端存储（IndexedDB）
- 需要跨标签页共享数据

### 2. virtualizer/ - 虚拟滚动

高性能虚拟滚动实现，用于渲染大量列表项。

**特性**：
- 只渲染可见区域的项
- 支持动态高度
- 性能优化

**使用场景**：
- 渲染超长列表（千行以上）
- 表格虚拟化
- 无限滚动

### 3. web-api/ - Web API 封装

现代 Web API 的友好封装：

- **clipboard.ts**：剪贴板 API（复制、粘贴）
- **permission.ts**：权限 API（请求和检查权限）

**设计原则**：
- 提供 Promise 化的 API
- 统一错误处理
- 自动降级和兼容性处理

### 4. file/ - 文件处理

浏览器文件操作工具：

- **saver.ts**：保存文件到本地（下载）
- **read.ts**：读取文件内容

**使用场景**：
- 导出数据为文件
- 上传文件前预览
- 文件内容解析

## 编码规范

### 浏览器环境检测

所有代码必须在浏览器环境中运行。如果某个功能需要特定 API，应该进行检测：

```typescript
// ✅ 正确：检测 API 可用性
export function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    return Promise.reject(new Error('Clipboard API not available'))
  }
  return navigator.clipboard.writeText(text)
}
```

### Promise 优先

所有异步操作使用 Promise：

```typescript
// ✅ 正确：使用 Promise
export async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
```

### 类型安全的 DOM 操作

处理 DOM 时，确保类型安全：

```typescript
// ✅ 正确：类型安全
export function scrollToElement(element: HTMLElement): void {
  element.scrollIntoView({ behavior: 'smooth' })
}

// ❌ 错误：类型不安全
export function scrollToElement(element: any): void {
  element.scrollIntoView()
}
```

### 错误处理

提供清晰的错误信息和降级方案：

```typescript
// ✅ 正确：完善的错误处理
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    throw new Error('Notification API not supported')
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}
```

## 存储模块开发指南

### Cookie 操作

```typescript
/**
 * 设置 Cookie
 * @param name - Cookie 名称
 * @param value - Cookie 值
 * @param options - Cookie 选项（过期时间、路径等）
 */
export function setCookie(
  name: string,
  value: string,
  options?: CookieOptions
): void {
  // 实现
}
```

### IndexedDB 封装

IndexedDB 操作应该 Promise 化：

```typescript
export class IndexedDBStore {
  /**
   * 获取数据
   */
  async get<T>(key: string): Promise<T | undefined> {
    // 实现
  }

  /**
   * 设置数据
   */
  async set<T>(key: string, value: T): Promise<void> {
    // 实现
  }
}
```

## 虚拟滚动开发指南

### 核心接口

```typescript
export interface VirtualizerOptions {
  /** 总项数 */
  itemCount: number
  /** 估计的项高度 */
  estimatedItemHeight: number
  /** 容器高度 */
  containerHeight: number
  /** 过扫描项数（上下额外渲染的项） */
  overscan?: number
}

export interface VirtualizerResult {
  /** 虚拟总高度 */
  totalHeight: number
  /** 可见项的索引范围 */
  visibleRange: [start: number, end: number]
  /** 偏移量 */
  offset: number
}
```

## Web API 封装指南

### 统一的错误处理

```typescript
export class WebAPIError extends Error {
  constructor(
    message: string,
    public readonly api: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'WebAPIError'
  }
}
```

### 兼容性处理

```typescript
export function isAPISupported(api: string): boolean {
  switch (api) {
    case 'clipboard':
      return 'clipboard' in navigator
    case 'notification':
      return 'Notification' in window
    default:
      return false
  }
}
```

## 文件处理开发指南

### 文件保存

```typescript
/**
 * 保存文件到本地
 * @param blob - 文件内容（Blob 对象）
 * @param filename - 文件名
 */
export function saveFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

### 文件读取

```typescript
/**
 * 读取文件为文本
 * @param file - File 对象
 * @returns 文件内容
 */
export function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
```

## 测试规范

### 浏览器环境测试

测试文件位于 `packages/tests/fe/` 目录。由于需要浏览器 API，可能需要使用 jsdom 或其他浏览器环境模拟：

```typescript
// packages/tests/fe/storage/cookie.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setCookie, getCookie } from '@cat-kit/fe/src'

describe('cookie', () => {
  beforeEach(() => {
    // 清理 cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=')
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
  })

  it('should set and get cookie', () => {
    setCookie('test', 'value')
    expect(getCookie('test')).toBe('value')
  })
})
```

## 添加新功能

### 步骤

1. **确定模块**：根据功能确定应该放在哪个模块（`storage/`、`web-api/` 等）
2. **检查浏览器兼容性**：确认目标 API 的浏览器支持情况
3. **实现功能**：编写代码，添加类型和文档
4. **处理降级**：为不支持的浏览器提供降级方案或清晰的错误信息
5. **导出**：在模块的 `index.ts` 和 `src/index.ts` 中导出
6. **添加测试**：在 `packages/tests/fe/` 下添加测试
7. **构建验证**：运行 `cd build && bun run build` 验证构建

## 性能考虑

- 虚拟滚动应避免频繁的 DOM 操作
- 使用 `requestAnimationFrame` 优化动画和滚动
- 大量数据操作考虑使用 Web Worker
- IndexedDB 操作应批量处理

## 导出策略

所有公共 API 都通过 `src/index.ts` 统一导出：

```typescript
export * from './virtualizer'
export * from './storage'
export * from './web-api/permission'
export * from './web-api/clipboard'
export * from './file/saver'
export * from './file/read'
```

## 构建配置

构建配置位于 `build/pkgs.ts`：

```typescript
{
  dir: pkg('fe'),
  deps: ['@cat-kit/core'],
  build: {
    input: 'src/index.ts',
    external: ['@cat-kit/core']
  }
}
```

## 常见任务

### 添加新的存储适配器
→ 在 `src/storage/` 下创建新文件，实现统一接口

### 添加新的 Web API 封装
→ 在 `src/web-api/` 下创建新文件，遵循 Promise 化模式

### 优化虚拟滚动性能
→ 编辑 `src/virtualizer/core.ts`，注意性能测试

### 添加文件处理功能
→ 在 `src/file/` 下创建新文件，处理不同文件类型

## 浏览器兼容性

默认目标浏览器：
- Chrome/Edge: 最新两个主要版本
- Firefox: 最新两个主要版本
- Safari: 最新两个主要版本

使用新 API 时应该：
1. 检查 [Can I Use](https://caniuse.com/) 确认兼容性
2. 提供降级方案或 polyfill
3. 在文档中说明浏览器要求
