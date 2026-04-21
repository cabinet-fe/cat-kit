# CatKit - 开发指南

> 喵喵工具箱：面向浏览器和 Node.js 的 TypeScript 工具包集合。

## 常用命令

```bash
# 安装依赖
bun install

# 运行测试
bun run test

# 运行单个测试文件
bun --cwd packages/core run test ./test/arr.test.ts

# 构建所有包
bun run build

# 录入变更（开发者每次完成功能后执行；发布范围由本次保留的 changeset 决定）
bun run changeset

# 发布（维护者执行：跑 `changeset version` + commit + push；其余在 GitHub Actions 中完成）
bun run release

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
│   ├── cli/            # @cat-kit/cli      — 命令行工具
│   ├── agent-context/  # @cat-kit/agent-context — Agent Context 工具
│   ├── tsconfig/       # 共享 tsconfig
│   └── vitepress-theme/# @cat-kit/vitepress-theme — 文档主题
├── skills/             # 仓库内 Agent Skill（见下文 cat-kit 技能）
├── docs/               # VitePress 文档站
├── .changeset/         # Changesets 版本与发布记录
├── dist/               # 构建产物（gitignored）
├── .oxfmtrc.json       # oxfmt 配置
├── bunfig.toml          # Bun 配置
├── turbo.json          # Turborepo 任务编排
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

除了 `@cat-kit/docs` 外，任何包在使用内部依赖时不得使用 `src` 路径，必须使用 `dist` 路径。

## 测试约定

- 测试放在各包目录下的 `test/` 文件夹中
- 测试文件命名：`<能力名>.test.ts`
- 引入被测代码：`import { ... } from '@cat-kit/<pkg>'`
- 运行方式：优先使用 `bun --cwd packages/<pkg> run test`
- 框架：Vitest，全局 API（`describe`/`it`/`expect` 无需 import）

## AI 助手：cat-kit 技能（按包）

`skills/use-cat-kit/SKILL.md` 为**路由**：按正在使用的 npm 包打开 `skills/cat-kit-<短名>/`（共 8 个子技能）。各子技能内 **`generated/`** 与 npm 发布物对齐（多数为 `dist` 下 `.d.ts`；`@cat-kit/tsconfig` 为 JSON 预设）。

**刷新（仓库根）**：`bun run sync-cat-kit-skills-api` 或 `bun run sync-cat-kit-skills-api:build`。脚本：`scripts/sync-cat-kit-skills-api.ts`。

- **路由**：`skills/use-cat-kit/SKILL.md`
- **子技能**：`skills/cat-kit-core/`、`cat-kit-http/`、`cat-kit-fe/`、`cat-kit-be/`、`cat-kit-agent-context/`、`cat-kit-cli/`、`cat-kit-tsconfig/`、`cat-kit-vitepress-theme/`（各含 `SKILL.md`、`generated/`、`references/` 或等价索引、`examples.md`）
- **何时用**：编写或讲解 cat-kit API、核对签名时；长文与示例以 `docs/` 为准

## 约束

- `@cat-kit/core` **禁止添加任何外部依赖**
- Node.js 内置模块使用 `node:` 协议导入
- 子包需要基础工具函数时优先从 `@cat-kit/core` 导入，禁止重复实现
- 任何 `packages/<pkg>` 的功能变更，都必须在同一轮修改中同步更新对应的 `docs/content/packages/<pkg>/` 文档，以及 `<root>/skills` 下该包对应的供真实项目使用的技能内容；不要只改代码不改文档和技能
