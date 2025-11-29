# AGENTS.md

本文件为智能体提供在此代码库工作时的项目级别的指导。

## 项目概述

Cat-Kit（喵喵工具箱）是一个基于 monorepo 的 TypeScript 工具库，为浏览器和 Node.js 环境提供实用工具。项目使用 Bun 作为运行时和包管理器。

## Monorepo 架构

这是一个基于工作区的 monorepo，包含以下工作空间：

### 核心包

- `packages/core` - 核心工具包（无外部依赖的基础包）
- `packages/fe` - 前端工具包（依赖 core）
- `packages/http` - HTTP 请求工具包（依赖 core）
- `packages/be` - 后端工具包（依赖 core）
- `packages/excel` - Excel 文件处理库（依赖 core）

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
    └── @cat-kit/excel
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

   - 如果工作空间依赖其他包（如 `fe`、`http`、`be`、`excel` 依赖 `core`）
   - **也需要读取依赖包的 `AGENTS.md` 文件**以了解相关 API 和约定

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
- **不可变性**：优先使用不可变数据结构和函数式编程
- **纯函数**：工具函数应该是纯函数，无副作用
- **模块化**：每个功能模块独立，职责单一

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

## TypeScript 配置

项目使用 TypeScript 项目引用（在根 `tsconfig.json` 中定义）。每个包都有自己的 `tsconfig.json`，继承自 `ts-conf-base`。

## 工作空间 AGENTS.md 文件位置

位于工作空间根目录下(`<workspace-dir>/AGENTS.md`), 工作空间的定义位于 `package.json` 文件的`workspace`属性中.

## 重要提醒

1. **始终先读取工作空间的 AGENTS.md 文件**再开始编码
2. **关注依赖关系**，如果工作空间依赖其他包，也要读取依赖包的指导文件
3. **遵循各工作空间的特定规范**，不要假设通用做法
4. **如果不确定目标工作空间，先询问用户**
5. **优先使用简单直接的解决方案**，避免过度工程化
