# 修复 VitePress 配置文件解析缺失扩展名的错误

## 补丁内容

在 `packages/vitepress-theme/src/config.ts` 中存在相对路径的模块导入导出行。因为此文件在 VitePress 编排构建阶段会直接被基于 NodeJS 的 ESM 加载器进行外挂解析，而严格的 NodeJS ESM 规范环境要求带有确切的扩展名后缀（如 `.ts` 或 `.js`），直接使用无后缀会导致报错（如 `Error [ERR_MODULE_NOT_FOUND]`）。为了同时兼容底层解析引擎以及 TypeScript 对模块后缀类型的要求，将配置文件内的依赖引用均加上确切的 `.ts` 扩展名，并通过 `// @ts-ignore` 使 TypeScript 静默。这解决了 `bun run docs:dev` 启动文档时的报错问题。

## 影响范围

- 修改文件: `packages/vitepress-theme/src/config.ts`
