# 架构

## 业务架构

喵喵工具箱（cat-kit）是给业务项目用的 TypeScript 工具包集合，按目标环境拆成多个独立发布的 npm 包：通用（core / http / crypto）、浏览器（fe）、Node.js（be / cli），外加配套的 TS 配置预设（tsconfig）、VitePress 文档主题（vitepress-theme）、人类文档站（docs）和面向 AI 智能体检索的文档目录（agent-docs）。核心域是「统一 API、细粒度导出、轻依赖的工具函数与类」；没有服务端业务逻辑，npm 发布即交付。

## 技术架构

Turborepo 编排的多包单体仓库，Bun workspaces 管依赖。每个库包用 tsdown 构建到 `dist`，同时以 `development` 导出条件暴露 `src` 源码（包内开发引用 `@cat-kit/<pkg>/src`）。`core` 是零外部依赖的底座，http / fe / be / vitepress-theme 依赖 core，docs 文档站（VitePress，含 vitepress-plugin-llms 生成面向 LLM 的输出）依赖几乎全部包。版本走 Changesets，发布由维护者触发、GitHub Actions 完成。`agent-docs/` 是面向 AI 智能体检索的文档目录（根入口 `index.md` → 包级 index → 主题文件，每篇带 `title` frontmatter，类型链接指向各包 `dist` 下 .d.ts），由维护者使用 `node --env-file=.env scripts/push-docs.mjs` 推送到文档服务（slug `cat-kit`）；原 `skills/cat-kit` 技能分发链已废弃。

### 技术栈

| 层             | 选型                                                 | 备注                                                          |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 语言 / runtime | TypeScript ^6.0.3、Bun 1.4.x                         | 库目标环境：浏览器、Node.js、Bun（版本来源：根 package.json） |
| 框架           | Vue ^3.5（仅 docs 与 vitepress-theme）               | 库本体零框架依赖                                              |
| 构建 / 包管理  | tsdown ^0.23.0、Turbo ^2.10.12、Bun workspaces       | 代码检查/格式化：oxlint ^1.81.0、oxfmt ^0.66.0                |
| 测试           | Vitest ^4.1.11、@vitest/coverage-v8 ^5.0.0           |                                                               |
| 文档           | VitePress ^2.0.0-alpha.17 + @cat-kit/vitepress-theme | 正文在 docs/content/                                          |
| 发布           | Changesets + GitHub Actions → npm                    |                                                               |

## 未决

- 公开 API 兼容策略未定（setup 访谈未答）
- 测试强制范围未定（同上；现有约定只覆盖放哪、怎么跑）
- README「包列表」写了 `@cat-kit/agent-context`，但 packages/ 下无此包，两者不一致
