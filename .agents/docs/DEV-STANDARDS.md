# 开发规范

## 命名

- 文件名 kebab-case（`lru-cache.ts`）；类名 PascalCase（`HttpClient`）；函数/变量 camelCase（`readDirRecursive`）；常量 UPPER_SNAKE_CASE 或 camelCase 均可
- 测试文件命名 `<能力名>.test.ts`

## 目录与代码结构

- 库包源码在 `packages/<pkg>/src`，能力按子目录切（如 `core/src/data`、`be/src/logger`），公开 API 统一从 `src/index.ts` 导出；除包名导出外支持 `src` 源码导出
- 测试放各包 `test/` 目录
- 仓库级工程脚本放 `scripts/`（Bun 运行）
- Node.js 内置模块使用 `node:` 协议导入

## 代码风格

- Formatter：oxfmt（`.oxfmtrc.json`：无分号、单引号、无尾逗号、括号间有空格）；Linter：oxlint。跑法：`bunx oxfmt --write .` / `bunx oxlint .`
- 注释语言：中文（现有源码注释为中文）
- 包间引用：开发时用 `@cat-kit/<pkg>/src` 引源码（package.json 的 `development` 条件）；除 `@cat-kit/docs` 外，任何包使用内部依赖不得走 `src` 路径，必须走 `dist`
- 子包需要基础工具函数时优先从 `@cat-kit/core` 导入，禁止重复实现

## 测试

- 框架 Vitest，全局 API（`describe`/`it`/`expect` 无需 import）
- 引入被测代码：`import { ... } from '@cat-kit/<pkg>'`
- 跑法：优先 `bun --cwd packages/<pkg> run test ./test/xxx.test.ts`；全仓 `bun run test`
- 何时必须写：未定（见 ARCHITECTURE.md 未决）

## 版本与发布

- Changesets：开发者每次完成功能后执行 `bun run changeset` 录入，发布范围由本次保留的 changeset 决定
- 发布（维护者执行）：`bun run release`（`scripts/release.ts`：changeset version + commit + push；其余在 GitHub Actions 中完成）

## 文档同步

- 功能 / API 变更必须同步两处文档：`docs/content/packages/<pkg>/`（用户文档）与 `agent-docs/packages/<pkg>/`（docs-mcp 检索文档），只改代码不同步视为未完成
- `agent-docs/` 每篇 `.md` 必须有 YAML frontmatter 且 `title` 非空；撰写与格式标准见 docs-mcp 技能 `references/doc-standards.md`，值含 `@` 等特殊字符时用双引号包裹（`@` 是 YAML 保留指示符）
- agent-docs 变更后执行 `node scripts/push-docs.mjs` 全量推送到 docs-mcp 服务端；连接信息在 `.env`（已 gitignore：`DOCS_MCP_SERVER_URL` / `DOCS_MCP_TOKEN` / `DOCS_MCP_LIBRARY`）

## 明确禁止

- cooking `spec.md` 缺少可被 `spec-files.mjs parse` 通过的「影响文件」章节
- `@cat-kit/core` 添加任何外部依赖
- 子包重复实现 `@cat-kit/core` 已有的基础工具函数
- 功能变更只改代码，不同步 `docs/content/packages/<pkg>/` 文档与 `agent-docs/packages/<pkg>/` 检索文档
