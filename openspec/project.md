# Project Context

## Purpose
**CatKit (喵喵工具箱)** 是一个专为浏览器和 Node.js 环境打造的现代 TypeScript 工具库。其目标是提供简洁、直观且高性能的工具，具备完整的类型安全支持，同时保持模块化架构，支持 Tree-shaking，且核心包零外部依赖。

## Tech Stack
- **语言:** TypeScript (主要), JavaScript (ESM)
- **运行时 & 包管理器:** Bun (首选), Node.js
- **Monorepo 管理:** Bun Workspaces
- **构建工具:** Vite, tsc (TypeScript Compiler)
- **测试:** Vitest
- **文档:** VitePress, Varlet UI (文档组件库)
- **Linting:** OXLint

## Project Conventions

### Code Style
- **范式:** 工具函数首选函数式编程风格。
- **模块化:** 纯 ESM 模块。设计上支持 Tree-Shaking。
- **类型:** 严格的 TypeScript 类型检查。“完整的类型推导”是核心特性。
- **依赖:** `@cat-kit/core` 必须保持 **零外部依赖 (Zero External Dependencies)**。其他包应尽量减少重型依赖。
- **命名:** 文件/文件夹使用 Kebab-case（短横线命名）。类/类型使用 CamelCase（大驼峰）。函数/变量使用 camelCase（小驼峰）。

### Architecture Patterns
- **Monorepo 结构:** 所有包位于 `packages/` 目录下。
    - `core`: 通用工具（数据、树结构、日期、性能）。
    - `http`: 基于插件架构的 HTTP 客户端。
    - `fe`: 浏览器专用工具。
    - `be`: Node.js 专用工具。
    - `excel`: 基于流的 Excel 处理。
    - `maintenance`: 内部维护工具。
- **插件架构:** 用于 `@cat-kit/http` 以实现可扩展性。
- **通用兼容性:** 核心逻辑应尽可能与环境无关 (Environment-agnostic)。

### Testing Strategy
- **框架:** Vitest。
- **范围:** 所有工具函数的单元测试。
- **位置:** `packages/tests/` 或同级目录（项目结构显示存在 `packages/tests`）。
- **命令:** `bun run test`。

### Git Workflow
- **分支:** 功能分支合并入 `main`。
- **提交:** 约定式提交 (Conventional Commits) 格式（如 `feat:`, `fix:`, `docs:`, `chore:`）。
- **工作区:** 使用 `bun` 进行依赖管理 (`bun install`, `bun add`)。

## Domain Context
- **工具库:** 领域为软件开发工具。
- **目标受众:** 使用 TypeScript 的前端和后端开发者。
- **核心概念:**
    - **流式处理 (Stream Processing):** 特别是对于 Excel 和大数据处理。
    - **跨平台 (Cross-Platform):** 代码通常需要在浏览器和服务器 (Node/Bun) 端运行。
    - **开发体验 (DX):** 强调自动补全 (IntelliSense) 和文档质量。

## Important Constraints
- **核心依赖:** `@cat-kit/core` 必须没有运行时依赖。
- **性能:** 关键路径工具（如循环迭代、数据解析）必须经过优化。
- **包体积:** 严格关注导出的包体积（Tree-shaking 是目标）。

## External Dependencies
- **Bun:** 本地开发和脚本执行必须。
- **VitePress:** 用于文档站点 (`docs/`)。
- **Varlet:** 在文档/示例中使用的 UI 库。
