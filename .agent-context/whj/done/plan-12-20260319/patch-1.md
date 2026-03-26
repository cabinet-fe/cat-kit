# 封装 Vite 和 Markdown 配置

## 补丁内容

为 `@cat-kit/vitepress-theme` 提供更彻底的封装。将 VitePress 支持的构建插件（`importExamples`）和 Markdown 插件（`demoContainer`、`mermaidPlugin` 等）从浏览器入口（`src/index.ts`）移至 `src/config.ts` 以防因为引入了 NodeJS 模块而导致 Vite 在构建客户端浏览器包时报错。在 `docs/.vitepress/config.ts` 中直接通过 `extends: defineThemeConfig({ ... })` 一键引入所有的配置，无需麻烦地在用户的 VitePress 的配置文件里一一手动注入和导入这些插件。

## 影响范围

- 修改文件: `docs/.vitepress/config.ts`
- 修改文件: `packages/vitepress-theme/src/index.ts`
- 修改文件: `packages/vitepress-theme/src/config.ts`
