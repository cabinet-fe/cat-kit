# Project Context

## Purpose

Cat-Kit（喵喵工具箱）是一个专为浏览器和 Node.js 端提供简洁、易用和高性能的开发工具包。项目采用 monorepo 架构，提供多个独立但可协同使用的工具包。

### 核心目标

- **跨平台兼容**：同时支持浏览器和 Node.js 环境
- **类型安全**：完整的 TypeScript 类型支持
- **高性能**：优化的实现，支持 tree-shaking
- **易用性**：简洁直观的 API 设计

## Tech Stack

- **运行时 & 包管理器**：Bun
- **语言**：TypeScript 5.x
- **构建工具**：tsdown（基于 esbuild/rolldown）
- **测试框架**：Vitest
- **代码检查**：oxlint
- **文档系统**：VitePress

## Project Conventions

### Code Style

**1. 命名约定**：
- **文件名**：kebab-case（如 `array-utils.ts`）
- **类型/接口**：PascalCase（如 `StorageAdapter`）
- **函数/变量**：camelCase（如 `getItem`）
- **常量**：UPPER_SNAKE_CASE（如 `DEFAULT_TIMEOUT`）

**2. 类型规范**：
- 所有函数必须有明确的类型签名
- 使用泛型提高代码复用性
- 避免使用 `any`，优先使用 `unknown`

**3. 导出规范**：
- 使用具名导出，避免默认导出
- 所有公共 API 通过 `src/index.ts` 统一导出
- 避免导出内部实现细节

**4. 文档注释**：
- 所有公共 API 必须有完整的 JSDoc 注释
- 包含 `@param`、`@returns`、`@throws`、`@example` 标签

### Architecture Patterns

**1. Monorepo 结构**：

```
packages/
├── core/      # 核心工具包（基础包，无内部依赖）
├── fe/        # 前端工具包（依赖 core）
├── be/        # 后端工具包（依赖 core）
├── http/      # HTTP 请求工具包（依赖 core）
├── excel/     # Excel 文件处理库（依赖 core）
├── maintenance/ # 库维护工具包（依赖 core）
├── tests/     # 集中测试套件
└── tsconfig/  # 共享 TypeScript 配置
```

**2. 依赖原则**：
- `@cat-kit/core` 是基础包，不依赖其他内部包
- 其他包可依赖 `core`，但不应相互循环依赖
- 使用 `buildDependencyGraph` 管理构建顺序

**3. 双导出模式**：
- 开发时：`@cat-kit/core/src`（直接使用源代码）
- 生产时：`@cat-kit/core`（使用编译后的代码）

**4. Tree-shaking 友好**：
- 纯函数设计，无副作用
- 避免大型工具类，拆分为独立函数
- 使用 `/*#__PURE__*/` 注释标记纯调用

### Testing Strategy

**1. 测试组织**：
- 测试位于 `packages/tests/` 目录
- 按包对应组织：`packages/core/src/data/array.ts` → `packages/tests/core/data/array.test.ts`

**2. 测试模式**：
- 遵循 AAA 模式（Arrange-Act-Assert）
- 测试边界情况和异常场景
- 每个测试独立，无共享状态

**3. 覆盖率目标**：
- 语句覆盖率：≥ 80%
- 分支覆盖率：≥ 75%
- 函数覆盖率：≥ 80%
- 行覆盖率：≥ 80%

**4. 测试命令**：
```bash
cd packages/tests
bun run test        # 运行所有测试
bun run test:ui     # UI 模式运行测试
```

### Git Workflow

**1. 分支策略**：
- `main`：主分支，保持稳定可发布状态
- `feature/*`：功能开发分支
- `fix/*`：Bug 修复分支

**2. 提交规范**：
- 遵循 Conventional Commits 规范
- 格式：`<type>(<scope>): <description>`
- 类型：`feat`、`fix`、`docs`、`refactor`、`test`、`chore`

**3. 版本管理**：
- 使用 `@cat-kit/maintenance` 包的版本工具
- 按包组（main、tsconfig、maintenance）独立维护版本
- 支持预发布版本（alpha、beta、rc）

## Domain Context

**1. 工作空间感知**：
- 每个工作空间有独立的 `AGENTS.md` 指导文件
- 处理任务前必须先阅读目标工作空间的指导文件
- 如依赖其他内部包，也需阅读依赖包的指导文件

**2. 构建系统**：
- 使用 `release/` 目录进行发布流程
- 支持交互式选择版本和包组
- 发布失败时自动回滚版本

**3. 文档系统**：
- VitePress 驱动的文档站点
- 支持代码示例和实时演示
- 位于 `docs/` 目录

## Important Constraints

**1. 技术约束**：
- 使用 Bun 作为包管理器（不使用 npm/yarn/pnpm）
- TypeScript 严格模式
- 不引入重量级框架依赖

**2. 设计约束**：
- 保持 API 简洁直观
- 保持向后兼容性
- 优先简单直接的解决方案

**3. 性能约束**：
- 支持 tree-shaking
- 避免不必要的运行时开销
- 注意 bundle 大小

## External Dependencies

**1. 构建工具**：
- [tsdown](https://tsdown.dev/) - 库构建工具（基于 esbuild/rolldown）
- [Vitest](https://vitest.dev/) - 测试框架
- [VitePress](https://vitepress.dev/) - 文档站点生成器

**2. 运行时依赖**：
- [fflate](https://www.npmjs.com/package/fflate) - 高性能压缩库（用于 Excel 包）
- [fast-glob](https://www.npmjs.com/package/fast-glob) - 高性能文件匹配

**3. 开发依赖**：
- [oxlint](https://oxc-project.github.io/docs/guide/usage/linter.html) - 代码检查
- [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) - 交互式命令行
