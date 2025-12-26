# AGENTS.md

本文件为智能体提供在此代码库工作时的项目级别的指导。

## 项目概述

Cat-Kit（喵喵工具箱）是一个基于 monorepo 的 TypeScript 工具库，为浏览器和 Node.js 环境提供实用工具。项目使用 Bun 作为运行时和包管理器。

## Monorepo 架构

这是一个基于工作区的 monorepo，包含以下工作空间：

### 核心包

- `packages/core` - 核心工具包
- `packages/fe` - 前端工具包
- `packages/be` - Node.js 后端工具包
- `packages/http` - HTTP 请求工具包
- `packages/excel` - Excel 文件处理库
- `packages/maintenance` - 库维护工具包

### 支持工作空间

- `packages/tests` - 所有包的集中测试套件
- `build` - 自定义构建系统
- `docs` - VitePress 文档站点

### 依赖关系图

```
@cat-kit/core (基础包，无依赖)
    ↑
    ├── @cat-kit/fe
    ├── @cat-kit/http
    ├── @cat-kit/be
    ├── @cat-kit/excel
    └── @cat-kit/maintenance
```

## 工作流程指导

### 智能体工作流

当你开始处理任务时，请遵循以下流程：

1. **识别工作空间**

   - 根据用户的请求，识别需要操作的工作空间（如 `packages/core`、`packages/fe` 等）
   - 如果不确定，请询问用户

2. **读取工作空间指导文件**

   - 每个工作空间都有自己的 `AGENTS.md` 文件
   - **必须先阅读目标工作空间的 `AGENTS.md` 文件**，路径格式为：`<workspace-dir>/AGENTS.md`
   - 例如：`packages/core/AGENTS.md`、`docs/AGENTS.md`

3. **处理依赖关系**

   - 如果工作空间依赖其他同为工作空间的包（如 `fe`、`http`、`be`、`excel` 依赖 `core`）, **也需要读取依赖包的 `AGENTS.md` 文件**以了解相关 API 和约定

4. **执行任务**
   - 基于工作空间的具体指导文件执行编码任务
   - 遵循该工作空间的编码规范和架构模式

### 示例工作流

**示例 1：修改前端存储功能**

```
用户请求 → 识别为 packages/fe → 读取 packages/fe/AGENTS.md → 读取 packages/core/AGENTS.md（依赖） → 执行任务
```

**示例 2：修改构建系统**

```
用户请求 → 识别为 build → 读取 build/AGENTS.md → 执行任务
```

**示例 3：添加文档**

```
用户请求 → 识别为 docs → 读取 docs/AGENTS.md → 执行任务
```

## 编码规范

### TypeScript 约定

- **类型优先**：始终使用显式类型声明
- **纯函数**：工具函数应该是纯函数，无副作用
- **模块化**：每个功能模块独立，职责单一
- **Tree-shaking 友好**：代码结构支持 tree-shaking 优化

### 类型安全规范

所有函数必须有明确的类型签名：

```typescript
// ✅ 正确：类型安全，使用泛型
export function map<T, U>(array: T[], fn: (item: T, index: number) => U): U[] {
  return array.map(fn)
}

// ✅ 正确：完整的类型定义
export function updateObject<T extends object>(obj: T, updates: Partial<T>): T {
  return { ...obj, ...updates }
}

// ❌ 错误：缺少类型
export function addItem(array, item) {
  array.push(item)
  return array
}
```

### Tree-shaking 友好规范

编写支持 tree-shaking 的代码，减小最终打包体积：

**1. 使用具名导出，避免默认导出**：

```typescript
// ✅ 正确：具名导出，支持 tree-shaking
export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

// ❌ 错误：默认导出对象，无法 tree-shake
export default {
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b
}
```

**2. 避免副作用，使用纯函数**：

```typescript
// ✅ 正确：纯函数，无副作用
export function formatDate(date: Date): string {
  return date.toISOString()
}

// ❌ 错误：有副作用，可能影响 tree-shaking
let cache = {}
export function formatDate(date: Date): string {
  cache[date.getTime()] = date.toISOString()
  return cache[date.getTime()]
}
```

**3. 拆分大型工具类，独立导出函数**：

```typescript
// ✅ 正确：独立函数，可按需引入
// utils/string/capitalize.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// utils/string/trim.ts
export function trim(str: string): string {
  return str.trim()
}

// ❌ 错误：大型工具类，难以 tree-shake
export class StringUtils {
  static capitalize(str: string): string { ... }
  static trim(str: string): string { ... }
  static padLeft(str: string, length: number): string { ... }
  // ... 更多方法
}
```

**4. 避免循环依赖**：

```typescript
// ✅ 正确：清晰的依赖关系
// a.ts
export function funcA() { ... }

// b.ts
import { funcA } from './a'
export function funcB() {
  return funcA()
}

// ❌ 错误：循环依赖，影响 tree-shaking
// a.ts
import { funcB } from './b'
export function funcA() { return funcB() }

// b.ts
import { funcA } from './a'
export function funcB() { return funcA() }
```

**5. 使用 `/*#__PURE__*/` 注释标记纯调用**：

```typescript
// ✅ 正确：标记纯函数调用
export const config = /*#__PURE__*/ Object.freeze({
  apiUrl: 'https://api.example.com',
  timeout: 5000
})

// 对于复杂的工厂函数
export const logger = /*#__PURE__*/ createLogger({
  level: 'info'
})
```

### 文档注释规范

所有公共 API 必须有完整的 JSDoc 注释：

````typescript
/**
 * 过滤数组中的元素
 * @param array - 源数组
 * @param predicate - 过滤条件函数
 * @returns 过滤后的新数组
 * @throws {ValidationError} 当参数无效时
 * @example
 * ```ts
 * const result = filter([1, 2, 3, 4], x => x > 2)
 * // result: [3, 4]
 * ```
 */
export function filter<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return array.filter(predicate)
}
````

**文档注释要求**：

- 简洁描述功能
- 使用 `@param` 描述所有参数
- 使用 `@returns` 描述返回值
- 使用 `@throws` 说明可能抛出的错误
- 提供 `@example` 代码示例

### 错误处理规范

**自定义错误类**：

```typescript
// ✅ 正确：创建自定义错误类
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly configPath: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'ConfigError'
  }
}

// 使用自定义错误
export async function loadConfig(path: string): Promise<Config> {
  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw new ConfigError(`Failed to load config from ${path}`, path, error)
  }
}
```

**错误处理原则**：

- 提供清晰的错误信息
- 保留原始错误信息（使用 `originalError` 或 `cause`）
- 使用有意义的错误类名（如 `ValidationError`、`NetworkError`）

### 性能考虑

**通用原则**：

- 避免不必要的循环和复杂度
- 在文档中说明性能特征（时间复杂度、空间复杂度）
- 对于大数据集，考虑使用生成器或流式处理
- 避免在循环中创建不必要的对象

**示例**：

```typescript
/**
 * 数组去重
 * @param array - 源数组
 * @returns 去重后的新数组
 * @complexity 时间复杂度 O(n)，空间复杂度 O(n)
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}
```

### 导出模式

所有包都遵循双导出模式：

```json
{
  ".": {
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  },
  "./src": {
    "import": "./src/index.ts",
    "types": "./src/index.ts"
  }
}
```

这允许：

- 开发时直接使用源代码（`@cat-kit/core/src`）
- 生产环境使用编译后的代码（`@cat-kit/core`）

**导出策略**：

- 所有公共 API 都通过 `src/index.ts` 统一导出
- 模块级导出通过模块的 `index.ts` 管理
- 避免导出内部实现细节

### 代码组织

- 按功能领域组织代码（如 `data/`、`storage/`、`web-api/`）
- 每个模块包含：
  - 实现文件（`.ts`）
  - 类型定义（通常在同一文件中）
  - 导出通过 `index.ts` 统一管理

### 命名约定

- **文件名**：kebab-case（如 `array-utils.ts`）
- **类型/接口**：PascalCase（如 `StorageAdapter`）
- **函数/变量**：camelCase（如 `getItem`）
- **常量**：UPPER_SNAKE_CASE（如 `DEFAULT_TIMEOUT`）

## 测试规范

### 测试组织

测试文件位于 `packages/tests/` 目录,按包组织:

```
packages/core/src/data/array.ts → packages/tests/core/data/array.test.ts
packages/fe/src/storage/cookie.ts → packages/tests/fe/storage/cookie.test.ts
```

### 测试文件命名

- 测试文件必须以 `.test.ts` 结尾
- 测试文件名应与被测试文件名对应
- 测试套件名称使用 `describe` 描述模块/函数
- 测试用例名称使用 `it` 描述具体行为

### AAA 模式

遵循 Arrange-Act-Assert 模式:

```typescript
it('should format date correctly', () => {
  // Arrange - 准备测试数据
  const date = new Date('2024-01-01')

  // Act - 执行被测试的操作
  const result = formatDate(date, 'YYYY-MM-DD')

  // Assert - 验证结果
  expect(result).toBe('2024-01-01')
})
```

### 测试最佳实践

**1. 测试边界情况**:

```typescript
describe('divide', () => {
  it('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero')
  })

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
  })
})
```

**2. 测试隔离** - 每个测试应该独立:

```typescript
// ✅ 正确：每个测试独立
describe('Calculator', () => {
  it('should add numbers', () => {
    const calc = new Calculator()
    expect(calc.add(1, 2)).toBe(3)
  })
})

// ❌ 错误：测试之间有依赖
describe('Calculator', () => {
  const calc = new Calculator()

  it('should add numbers', () => {
    calc.add(1, 2) // 修改了共享状态
  })
})
```

**3. 描述性测试名称**:

```typescript
// ✅ 正确：清晰描述行为
it('should return empty array when input is empty', () => {})
it('should throw error when value is negative', () => {})

// ❌ 错误：不清晰
it('test1', () => {})
it('works', () => {})
```

**4. 避免测试实现细节**:

```typescript
// ✅ 正确：测试公共 API 行为
it('should filter even numbers', () => {
  const result = filterEven([1, 2, 3, 4])
  expect(result).toEqual([2, 4])
})

// ❌ 错误：测试内部实现
it('should call Array.filter internally', () => {
  const spy = vi.spyOn(Array.prototype, 'filter')
  filterEven([1, 2, 3, 4])
  expect(spy).toHaveBeenCalled()
})
```

### 测试覆盖率目标

- **语句覆盖率**：≥ 80%
- **分支覆盖率**：≥ 75%
- **函数覆盖率**：≥ 80%
- **行覆盖率**：≥ 80%

## 通用开发命令

### 构建

```bash
# 构建所有包（自动处理依赖顺序）
cd build
bun run build

# 分析 bundle 大小
cd build
bun run analyze
```

### 测试

```bash
# 运行所有测试
cd packages/tests
bun run test

# 使用 UI 运行测试
cd packages/tests
bun run test:ui

# 运行特定测试文件
cd packages/tests
bun run test <test-file-pattern>
```

### 代码检查

```bash
# 从项目根目录运行 oxlint
oxlint
```

### 文档

```bash
# 启动文档开发服务器
cd docs
bun run dev

# 构建文档
cd docs
bun run build
```

## 文档编写规范

### 文档结构

文档使用 VitePress 构建，位于 `docs/` 目录。文档应该：

- **清晰的层次结构** - 使用适当的标题层级（H1-H6）
- **代码示例** - 提供实际可运行的代码示例
- **类型信息** - 展示完整的类型签名
- **实际用例** - 说明何时使用某个功能

### 前置知识章节

在编写复杂工具的文档时（如构建工具、打包器），应该包含"前置知识"或"基础概念"章节，帮助读者理解：

- 相关技术的基础概念
- 配置选项的作用原理
- 常见术语的解释
- 最佳实践和决策指南

**示例**：`docs/packages/maintenance/index.md` 的"前置知识"章节解释了：

- 库构建 vs 应用构建的本质区别
- tsdown 作为库构建工具的特性
- package.json 中的依赖类型在库构建上下文中的意义
- external 字段在库构建中的作用
- Monorepo 库构建的最佳实践

### 文档更新记录

**最近更新**：

- **2025-12-04** - 为 `@cat-kit/maintenance` 包文档重写"前置知识"章节，基于 tsdown 官方文档：
  - 区分库构建 vs 应用构建的本质差异
  - 介绍 tsdown 的核心特性和默认行为
  - 在库构建上下文中解释三种依赖类型（dependencies、devDependencies、peerDependencies）
  - 说明 external 字段在库构建中的作用和配置策略
  - Monorepo 库构建的最佳实践和配置检查清单
  - 引用官方资源：[tsdown 文档](https://tsdown.dev/)、[库打包指南](https://tobias-barth.net/blog/How-to-bundle-your-library-and-why)

## TypeScript 配置

项目使用 TypeScript 项目引用（在根 `tsconfig.json` 中定义）。每个包都有自己的 `tsconfig.json`，继承自 `@cat-kit/tsconfig`。

## 工作空间 AGENTS.md 文件位置

位于工作空间根目录下(`<workspace-dir>/AGENTS.md`), 工作空间的定义位于 `package.json` 文件的`workspace`属性中.

## 重要提醒

1. **始终先读取工作空间的 AGENTS.md 文件**再开始编码
2. **关注依赖关系**，如果工作空间依赖其他同为工作空间的包，也要读取依赖包的指导文件
3. **遵循各工作空间的特定规范**，不要假设通用做法
4. **如果不确定目标工作空间，先询问用户**
5. **优先使用简单直接的解决方案**，避免过度工程化

<!-- DEV_PROMPTS:START -->

# DevPrompts Instructions

本说明为在当前项目中工作的 AI 助手 提供指导。

## 目标优先级

**始终**按此顺序决策：

正确性 → 安全性 → 可维护性 → 可读性 → 性能 → 简洁性

## 通用开发规范

- **命名规范**：使用具有描述性的变量和函数名。
- **模块化**：遵循 SOLID 原则，确保函数职责单一，避免“上帝类”或超长函数。
- **注释艺术**：不要解释代码“在做什么”，而要解释“为什么这样做”以及任何非显而易见的逻辑。
- **自解释**：代码本身应清晰易读，尽量减少对文档的依赖。
- **避免死代码**：不得包含任何未使用或者不会被执行到的代码。

## 特定语言规范

- [TypeScript](dev-prompts/languages/typescript.md)

## 代码审查

**每次**代码生成都要经过必要的审查，以符合上述规范。

<!-- DEV_PROMPTS:END -->

