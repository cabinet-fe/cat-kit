# CatKit - 开发指南

> 喵喵工具箱：面向浏览器和 Node.js 的 TypeScript 工具包集合。

## 常用命令

```bash
# 安装依赖
bun install

# 运行测试
cd packages/tests && bun vitest

# 运行单个测试文件
cd packages/tests && bun vitest core/data/array.test.ts

# 构建所有包（通过 release 入口）
cd release && bun run build.ts

# 格式化
bunx oxfmt --write .

# Lint
bunx oxlint .
```

## 技术栈

| 技术       | 版本  | 用途                      |
| ---------- | ----- | ------------------------- |
| TypeScript | ^5.9  | 主语言                    |
| Bun        | 最新  | 包管理器、运行时          |
| Vitest     | 最新  | 测试框架                  |
| oxlint     | ^1.54 | Linter                    |
| oxfmt      | ^0.39 | Formatter                 |
| tsdown     | 最新  | 构建工具（基于 Rolldown） |

## 仓库结构（第二层）

```
cat-kit/
├── packages/
│   ├── core/           # @cat-kit/core     — 核心工具（零依赖，通用）
│   ├── http/           # @cat-kit/http     — HTTP 客户端（插件架构，通用）
│   ├── fe/             # @cat-kit/fe       — 前端工具（浏览器专用）
│   ├── be/             # @cat-kit/be       — 后端工具（Node.js 专用）
│   ├── excel/          # @cat-kit/excel    — Excel 流式读写（通用）
│   ├── maintenance/    # @cat-kit/maintenance — Monorepo 维护（构建/发版/依赖管理）
│   ├── tests/          # 集中测试目录（Vitest）
│   ├── tsconfig/       # 共享 tsconfig
│   └── agent-context/  # Agent Context 工具
├── release/            # 构建发布入口脚本
├── skills/             # 仓库内 Agent Skill（见下文 use-cat-kit）
├── docs/               # VitePress 文档站
├── dist/               # 构建产物（gitignored）
├── .oxfmtrc.json       # oxfmt 配置
├── bunfig.toml          # Bun 配置
└── tsconfig.json       # 根 tsconfig（项目引用）
```

## 代码风格

- **Formatter**：oxfmt（配置见 `.oxfmtrc.json`）
  - 无分号、单引号、无尾逗号、括号间有空格
- **Linter**：oxlint
- **命名规范**：
  - 文件名：kebab-case（`lru-cache.ts`）
  - 类名：PascalCase（`HttpClient`）
  - 函数/变量：camelCase（`readDirRecursive`）
  - 常量：UPPER_SNAKE_CASE 或 camelCase 均可
- **导出**：如果一个包要导出，通过 `src/index.ts` 统一导出，除了包名导出还支持 `src` 源码导出
- **包间引用**：开发时使用 `@cat-kit/<pkg>/src` 路径引用源码

## 优先使用内部依赖

本项目是一个**单体仓库**, 在编码时必须倾向于使用内部依赖（如果存在的话）。

除了`@cat-kit/docs`、`@cat-kit/tests`、`build`包，任何包在使用内部依赖时不得使用`src`路径，必须使用`dist`路径。

## 测试约定

- 测试集中在 `packages/tests/` 下，按包名镜像目录结构
- 测试文件命名：`<源文件名>.test.ts`
- 引入被测代码：`import { ... } from '@cat-kit/<pkg>/src'`
- 框架：Vitest，全局 API（`describe`/`it`/`expect` 无需 import）

## 构建约定

- 构建入口脚本位于 `release/build.ts`
- 构建工具：tsdown（基于 Rolldown）
- 构建产物输出到各包 `dist/` 目录
- 各包 `package.json` 的 `exports` 定义了产物和源码双入口

## AI 助手：use-cat-kit

根目录 `skills/use-cat-kit/` 为本仓库各 `@cat-kit/*` 包的**按需查阅**文档技能（与 VitePress 站点 `docs/content/packages/` 同源能力，拆成细粒度 reference）。

- **入口**：`skills/use-cat-kit/SKILL.md` — 包与子模块导航表
- **详情**：`skills/use-cat-kit/references/` — 按包分子目录（如 `core/data.md`、`http/client.md`），**只读与当前问题相关的那一个文件**，避免一次加载整包文档占用上下文
- **何时用**：编写或讲解 cat-kit API、选型子包、核对导入与用法时；需要完整长文与示例时仍以 `docs/` 站点为准

## 约束

- `@cat-kit/core` **禁止添加任何外部依赖**
- 所有路径使用**绝对路径**（maintenance 包内部）
- Node.js 内置模块使用 `node:` 协议导入
- 子包需要基础工具函数时从 `@cat-kit/core` 导入，禁止重复实现
