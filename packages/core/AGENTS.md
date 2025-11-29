# @cat-kit/core - 核心工具包

本文件为 `@cat-kit/core` 包提供详细的开发指导。

## 包概述

`@cat-kit/core` 是 Cat-Kit 的核心基础包，提供通用的工具函数和数据结构。它是一个**零外部依赖**的包，所有其他包都依赖于它。

**包名称**：`@cat-kit/core`
**依赖关系**：无外部依赖（基础包）
**被依赖**：`@cat-kit/fe`、`@cat-kit/http`、`@cat-kit/be`、`@cat-kit/excel`

## 目录结构

```
packages/core/src/
├── data/              # 数据处理工具
│   ├── array.ts       # 数组操作
│   ├── string.ts      # 字符串操作
│   ├── object.ts      # 对象操作
│   ├── number.ts      # 数字操作
│   ├── type.ts        # 类型工具
│   ├── validator.ts   # 验证器
│   ├── converter.ts   # 转换器
│   └── index.ts
├── data-structure/    # 数据结构
│   ├── tree.ts        # 树结构
│   ├── forest.ts      # 森林（多棵树）
│   └── index.ts
├── date/              # 日期处理
│   └── date.ts
├── env/               # 环境检测
│   └── env.ts
├── optimize/          # 性能优化
│   ├── parallel.ts    # 并行执行
│   ├── safe.ts        # 安全包装器
│   ├── timer.ts       # 定时器
│   └── index.ts
├── pattern/           # 设计模式
│   └── observer.ts    # 观察者模式
└── index.ts           # 主导出文件
```

## 模块说明

### 1. data/ - 数据处理工具

提供常用的数据处理函数，包括：
- **array.ts**：数组操作（过滤、映射、分组等）
- **string.ts**：字符串操作（格式化、转换等）
- **object.ts**：对象操作（深拷贝、合并、路径访问等）
- **number.ts**：数字操作（格式化、范围检查等）
- **type.ts**：TypeScript 类型工具和类型守卫
- **validator.ts**：数据验证函数
- **converter.ts**：类型转换函数

### 2. data-structure/ - 数据结构

提供高级数据结构：
- **tree.ts**：树形结构实现
- **forest.ts**：森林（多棵树的集合）实现

### 3. date/ - 日期处理

日期和时间相关的工具函数。

### 4. env/ - 环境检测

检测运行时环境（浏览器、Node.js、特定平台等）。

### 5. optimize/ - 性能优化

性能优化相关工具：
- **parallel.ts**：并行执行任务
- **safe.ts**：安全包装器（错误处理）
- **timer.ts**：定时器和延迟执行

### 6. pattern/ - 设计模式

常用设计模式的实现：
- **observer.ts**：观察者模式

## 编码规范

### 纯函数优先

所有工具函数都应该是**纯函数**：
- 无副作用
- 相同输入产生相同输出
- 不修改输入参数

```typescript
// ✅ 正确：纯函数
export function addItem<T>(array: readonly T[], item: T): T[] {
  return [...array, item]
}

// ❌ 错误：有副作用
export function addItem<T>(array: T[], item: T): T[] {
  array.push(item) // 修改了输入参数
  return array
}
```

### 类型安全

- 所有函数必须有明确的类型签名
- 使用泛型提供类型灵活性
- 优先使用 `readonly` 修饰不会被修改的参数

```typescript
// ✅ 正确：类型安全
export function map<T, U>(
  array: readonly T[],
  fn: (item: T, index: number) => U
): U[] {
  return array.map(fn)
}
```

### 不可变性

- 优先使用不可变操作
- 返回新对象而不是修改原对象
- 使用 `readonly` 类型标记不可变数据

```typescript
// ✅ 正确：不可变操作
export function updateObject<T extends object>(
  obj: Readonly<T>,
  updates: Partial<T>
): T {
  return { ...obj, ...updates }
}
```

### 文档注释

所有公共 API 必须有 JSDoc 注释：

```typescript
/**
 * 过滤数组中的元素
 * @param array - 源数组
 * @param predicate - 过滤条件函数
 * @returns 过滤后的新数组
 * @example
 * ```ts
 * const result = filter([1, 2, 3, 4], x => x > 2)
 * // result: [3, 4]
 * ```
 */
export function filter<T>(
  array: readonly T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return array.filter(predicate)
}
```

## 添加新工具

### 步骤

1. **确定模块**：根据功能确定应该放在哪个模块（`data/`、`optimize/` 等）
2. **创建或编辑文件**：在对应模块下创建或编辑 `.ts` 文件
3. **实现功能**：编写纯函数，添加类型和文档
4. **导出**：在模块的 `index.ts` 中导出
5. **主导出**：确保在 `src/index.ts` 中导出（如果是新模块）
6. **添加测试**：在 `packages/tests/core/` 下添加对应的测试文件
7. **构建验证**：运行 `cd build && bun run build` 验证构建

### 示例：添加新的数组工具函数

```typescript
// packages/core/src/data/array.ts

/**
 * 数组去重
 * @param array - 源数组
 * @returns 去重后的新数组
 */
export function unique<T>(array: readonly T[]): T[] {
  return [...new Set(array)]
}
```

然后在 `packages/core/src/data/index.ts` 中导出：
```typescript
export * from './array'
```

## 测试规范

- 每个工具函数都应该有对应的测试
- 测试文件位于 `packages/tests/core/` 目录
- 使用 Vitest 编写测试

```typescript
// packages/tests/core/data/array.test.ts
import { describe, it, expect } from 'vitest'
import { unique } from '@cat-kit/core/src'

describe('unique', () => {
  it('should remove duplicates', () => {
    const result = unique([1, 2, 2, 3, 3, 3])
    expect(result).toEqual([1, 2, 3])
  })
})
```

## 性能考虑

- 避免不必要的循环和复杂度
- 对于大数据集，考虑使用生成器或流式处理
- 在文档中说明性能特征（时间复杂度）

## 导出策略

所有公共 API 都通过 `src/index.ts` 统一导出：

```typescript
export * from './data'
export * from './date/date'
export * from './env/env'
export * from './optimize/parallel'
export * from './optimize/timer'
export * from './optimize/safe'
export * from './pattern/observer'
export * from './data-structure'
```

## 依赖约束

⚠️ **重要约束**：

- **不允许添加任何外部依赖**（除了 TypeScript 类型定义）
- 所有功能必须使用原生 JavaScript/TypeScript 实现
- 如果需要复杂功能，考虑是否应该放在其他专门的包中

## 构建配置

构建配置位于 `build/pkgs.ts`：

```typescript
{
  dir: pkg('core'),
  build: {
    input: 'src/index.ts'
  }
  // 注意：无 external，因为没有依赖
}
```

## 常见任务

### 添加新的数据处理函数
→ 编辑 `src/data/` 下的相应文件

### 添加新的设计模式实现
→ 在 `src/pattern/` 下创建新文件

### 添加新的性能优化工具
→ 在 `src/optimize/` 下创建新文件

### 修改现有工具函数
→ 确保向后兼容，或更新版本号并记录破坏性变更
