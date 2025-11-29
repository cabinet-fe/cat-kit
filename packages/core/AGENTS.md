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

> **📌 通用编码规范请参考根目录的 `AGENTS.md` 文件**

### Core 包特有规范

- **纯函数要求**：所有工具函数必须是纯函数（无副作用）
- **独立函数导出**：每个工具函数独立导出，支持按需引入


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

> **📌 通用测试规范请参考根目录的 `AGENTS.md` 文件**

测试位置：`packages/tests/core/`

## 性能考虑

> **📌 通用性能考虑请参考根目录的 `AGENTS.md` 文件**

Core 包特有要求：
- 对于大数据集，考虑使用生成器
- 在文档中标注时间复杂度

## 导出策略

> **📌 通用导出策略请参考根目录的 `AGENTS.md` 文件**

所有公共 API 通过 `src/index.ts` 统一导出。


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
