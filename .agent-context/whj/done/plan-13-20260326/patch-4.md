# 修复 vitepress-theme 样式丢失的问题

## 补丁内容

在将 `@cat-kit/vitepress-theme` 抽取为独立包之后，文档工程直接引用了主题入口，但是由于 `.vue` 和 `.css` 等样式通过构建独立输出了 `dist/style.css`，文档站点中并没有载入主题专属样式，导致样式完全丢失。

通过在 `packages/vitepress-theme/package.json` 的 `exports` 字段中手动暴露 `./style.css` 文件路径，并在文档的主题入口 `docs/.vitepress/theme/index.ts` 中引入此样式，成功解决了文档样式丢失的问题。

## 影响范围

- 修改文件: `packages/vitepress-theme/package.json`
- 修改文件: `docs/.vitepress/theme/index.ts`
