# 补全 vitepress-theme 的 config 子路径导出

## 补丁内容

1. `docs/.vitepress/config.ts` 使用 `@cat-kit/vitepress-theme/config`，但 patch-2 精简 `exports` 后缺少 `./config`，触发 Missing "./config" specifier。
2. 若将 `./config` 仅指向 `src/config.ts`，Vite 在打包配置时会 externalize 该子路径，Node 直接按 ESM 加载 TS 源码，相对路径无 `.ts` 后缀会报 `ERR_MODULE_NOT_FOUND`。
3. 处理：在 `release/groups.ts` 的 vitepress-theme 构建中增加入口 `src/config.ts`，产出 `dist/config.js`；`package.json` 中 `./config` 的 `import` 指向 `./dist/config.js`，`types` 仍用 `./src/config.ts`（构建未生成 d.ts）。

在 `docs/package.json` 增加 `predev`，每次 `bun run dev` 前先构建 vitepress-theme，避免干净克隆后缺少 `dist/config.js`。

## 影响范围

- 修改文件: `packages/vitepress-theme/package.json`
- 修改文件: `release/groups.ts`
- 修改文件: `docs/package.json`
