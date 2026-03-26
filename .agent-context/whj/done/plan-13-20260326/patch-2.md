# 修正 vitepress-theme 构建输出目录与根入口导出

## 补丁内容

1. 修复 `@cat-kit/maintenance` 构建器将入口路径强制转成绝对路径的问题，改为仅用绝对路径做存在性检查，实际向 tsdown 传递相对 `cwd` 的入口，避免 preserve modules 产物落成 `dist/packages/vitepress-theme/src/**`。
2. 为构建配置补充 `root` 与 `deps.skipNodeModulesBundle` 支持，并在 `vitepress-theme` 发布构建中将源码根目录固定为 `src`，避免输出路径带上 monorepo 前缀，同时禁止把 `node_modules` 依赖展开到产物目录。
3. 修复 `@cat-kit/vitepress-theme` 根入口漏导出 `markdown` / `plugins` 模块的问题，使 README 中的 `demoContainer`、`mermaidPlugin`、`importExamples` 用法与实际构建产物一致。
4. 将样式导出从 `src/styles/custom.css` 调整为 `dist/styles/custom.css`，使包导出与构建产物保持一致。

## 影响范围

- 修改文件: `packages/maintenance/src/build/build.ts`
- 修改文件: `packages/maintenance/src/build/types.ts`
- 修改文件: `release/groups.ts`
- 修改文件: `packages/vitepress-theme/src/index.ts`
- 修改文件: `packages/vitepress-theme/package.json`
