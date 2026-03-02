# @cat-kit/core - 核心工具

本文件为 `@cat-kit/core` 包提供详细的开发指导。

## 概述

`@cat-kit/core` 是 Cat-Kit 的核心基础包，提供通用的工具函数和数据结构。这是一个**零外部依赖**的包。

## 目录结构

当前目录结构：

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

**当`core/src`中添加文件、文件意义变更时同步上面的目录结构！**

## 编码规范

- **纯函数要求**：所有工具函数必须是纯函数（无副作用）
- **独立函数导出**：每个工具函数独立导出，支持按需引入

## 导出策略

所有公共 API 通过 `src/index.ts` 统一导出。

## 约束

- **不允许添加任何外部依赖**（除了 TypeScript 类型定义）
- **所有功能必须使用原生 JavaScript/TypeScript 实现**
