# vitepress-theme 构建报错修复与导出调整

> 状态: 已执行

## 目标

- 修复 `@cat-kit/vitepress-theme` 因为包含 Vue 和 CSS 文件导致的构建失败问题。
- 调整并简化其 `package.json` 的 `exports` 字段，默认导出构建后的 `index.js`，且只保留默认导出、src导出和样式导入，加入 `dist` 到发布文件白名单中。

## 内容

1. **排除 Vue 与 CSS 的直接构建**：增加 `tsdown.config.ts` 给 `@cat-kit/vitepress-theme`，将 `/\.vue$/` 和 `/\.css$/` 加入 external 列表。
2. **复制构建资产**：修改 `release/groups.ts` 中的 `vitepressTheme` 构建组，添加 `afterBuild` hook 以调用 `copyAssetsToDist` 自动拷贝 `src/components` 和 `src/styles` 到 `dist/` 目录中。
3. **精简与更新 Exports**：修改 `packages/vitepress-theme/package.json`，保留且只保留 `.`(默认指向 `dist/index.js`), `./src` 和 `./styles/custom.css` 三个导出，并将 `"dist"` 添加进 `files` 列表以便正确发布资产。
4. **验证构建**：通过全量构建以及单包测试等方式，确保项目及依赖组可以正常构建。

## 影响范围

- `packages/vitepress-theme/package.json`（含 `./config` 与 `./style.css` 导出）
- `packages/vitepress-theme/tsdown.config.ts` (已删除)
- `packages/maintenance/src/build/types.ts`
- `packages/maintenance/src/build/build.ts`
- `release/groups.ts`
- `packages/vitepress-theme/src/index.ts`
- `docs/package.json`（`predev` 构建主题包）
- `docs/.vitepress/theme/index.ts`

## 历史补丁

- patch-1: 优化 vitepress-theme 构建配置 (引入 vue 编译，移除独立 tsdown.config.ts)
- patch-2: 修正 vitepress-theme 构建输出目录与根入口导出
- patch-3: 补全 `./config` 导出并双入口构建 `dist/config.js`（修复 docs 配置加载与 Node ESM 解析）
- patch-4: 补充导出 `style.css` 并在 docs 主题中导入 (修复独立包使用时样式丢失)
