# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此代码库工作时的指导。

**重要提示：在与此项目交互时，请始终使用中文进行交流。**

## 项目概述

Cat-Kit（喵喵工具箱）是一个基于 monorepo 的 TypeScript 工具库，为浏览器和 Node.js 环境提供实用工具。项目使用 Bun 作为运行时和包管理器。

## Monorepo 结构

这是一个基于工作区的 monorepo，包含以下包：

- `@cat-kit/core` - 核心工具包（数据结构、日期处理、性能优化、设计模式）
- `@cat-kit/fe` - 前端工具包（存储、虚拟滚动、Web API、文件处理）
- `@cat-kit/http` - HTTP 请求工具包（带插件系统）
- `@cat-kit/be` - 后端工具包
- `@cat-kit/excel` - Excel 文件处理库（支持流式处理）
- `@cat-kit/tests` - 所有包的集中测试套件
- `build` - 自定义构建系统
- `docs` - VitePress 文档站点

### 包依赖关系

依赖关系图：
- `@cat-kit/core` - 无依赖（基础包）
- `@cat-kit/fe`、`@cat-kit/http`、`@cat-kit/be`、`@cat-kit/excel` - 都依赖于 `@cat-kit/core`

## 开发命令

### 构建

```bash
# 构建所有包（自动处理依赖顺序，分批并行构建）
cd build
bun run build

# 分析 bundle 大小
cd build
bun run analyze
```

构建系统（`build/repo.ts`）会自动：
- 按依赖顺序构建包
- 在每个批次内并行构建
- 使用 tsdown 进行打包和压缩
- 生成 bundle 分析报告（每个包的 dist 文件夹中的 stats.html）

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

测试使用 Vitest，位于 `packages/tests/` 目录下，按包组织（如 `core/`、`http/`、`excel/`）。

### 文档

```bash
# 启动开发服务器
cd docs
bun run dev

# 构建文档
cd docs
bun run build

# 预览构建的文档
cd docs
bun run preview
```

文档使用 VitePress，包含交互式示例。

### 代码检查

```bash
# 从项目根目录运行 oxlint
oxlint
```

## 构建系统架构

自定义构建系统（`build/`）使用 tsdown 并按依赖感知的批次处理包：

1. **包配置**（`build/pkgs.ts`）：定义所有包及其构建配置
2. **构建编排**（`build/repo.ts`）：
   - 读取 package.json 文件
   - 解析依赖图
   - 分批构建（依赖已满足的包并行构建）
   - 生成统计信息和 bundle 可视化

输出格式：
- 仅 ES 模块（`.js` 扩展名）
- TypeScript 类型声明（`.d.ts`）
- 默认启用 sourcemap
- 压缩的生产构建

## 包导出模式

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

这允许在开发时直接使用源代码，在生产环境使用编译后的代码。

## 主要包功能

### @cat-kit/core
包含按类别组织的基础工具：
- `data/` - 数组、字符串、对象、数字、类型工具、验证器、转换器
- `data-structure/` - 树、森林实现
- `date/` - 日期操作
- `env/` - 环境检测
- `optimize/` - 并行执行、安全包装器、定时器
- `pattern/` - 观察者模式实现

### @cat-kit/fe
前端专用工具：
- `storage/` - Cookie、IndexedDB 和统一存储 API
- `virtualizer/` - 虚拟滚动实现
- `web-api/` - 剪贴板、权限
- `file/` - 文件读取和保存工具

### @cat-kit/http
带插件架构的 HTTP 客户端：
- 引擎抽象（XHR、Fetch）
- 横切关注点的插件系统
- 内置插件：token 管理、方法覆盖

### @cat-kit/excel
支持流式处理的现代 Excel 库：
- 不可变数据结构（Cell、Row、Worksheet、Workbook）
- 基于流的读取（`readWorkbookStream`）和写入（`StreamWorkbookWriter`）
- 用于小文件的非流式 API
- 通过 `ExcelWorkerClient` 支持 Web Worker
- 地址、日期和转换的辅助函数

## TypeScript 配置

项目使用 TypeScript 项目引用（在根 `tsconfig.json` 中定义）。每个包都有自己的 `tsconfig.json`，继承自 `ts-conf-base`。

## 在此代码库中工作

### 添加新工具

1. 将源代码添加到相应包的 `src/` 目录
2. 从包的 `src/index.ts` 导出
3. 在 `packages/tests/<package-name>/` 添加测试
4. 使用 `cd build && bun run build` 构建并验证

### 修改构建配置

编辑 `build/pkgs.ts` 以：
- 向构建流程添加新包
- 修改外部依赖
- 更改构建输入文件

### 跨包依赖

在包之间添加依赖时：
1. 使用工作区依赖更新 `package.json`：`"@cat-kit/core": "workspace:*"`
2. 如果合适，添加到 `peerDependencies`
3. 更新 `build/pkgs.ts` 中的 deps 数组
4. 在构建配置中添加到 `external` 数组

### 文档更新

文档文件位于 `docs/packages/<package-name>/`。文档包括：
- 使用 `DemoContainer.vue` 的交互式示例
- 自定义 markdown-it 插件（在 `docs/.vitepress/plugins/` 中）
- `docs/.vitepress/shared.ts` 中的共享配置
