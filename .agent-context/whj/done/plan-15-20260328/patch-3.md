# 修复 docs 渲染链路与代码块不可见

## 补丁内容

本次补丁修复了两类会导致文档站「看起来整体失效」的问题：

1. `docs/.vitepress/config.ts` 中自定义 `markdown.config` 覆盖了主题扩展配置，导致 `@cat-kit/vitepress-theme/config` 里注册的 `demoContainer` 未执行，`::: demo ... :::` 被原样渲染为文本。  
   处理方式：在 docs 配置中先复用 `defineThemeConfig(...)` 返回值，再在本地 `markdown.config` 里串联执行主题的 `markdown.config`，并保留 `copyOrDownloadAsMarkdownButtons` 插件。

2. `packages/vitepress-theme/src/styles/custom.css` 对 `pre.shiki code` 设置了 `font-size: 0`，在当前 VitePress/Shiki 输出结构下会导致代码文本不可见。  
   处理方式：移除该段 Shiki 字号压缩规则，仅保留等宽字体与行号字体统一设置，恢复代码正常可读性。

同时修复主题客户端入口导出边界：`packages/vitepress-theme/src/index.ts` 不再导出 Node-only 的 markdown/vite 插件模块，避免客户端包被动引入服务端依赖。

验证：
- `bun run build`（`docs/`）通过；
- 浏览器实测 `http://localhost:5173/cat-kit/packages/fe/storage`：
  - `::: demo fe/storage/basic.vue` 正常渲染为可交互 DemoContainer；
  - 普通 markdown 代码块文本可见且高亮正常；
  - 控制台无 `node:fs`/`node:path`/hydrate 等错误。

## 影响范围

- 修改文件: `docs/.vitepress/config.ts`
- 修改文件: `packages/vitepress-theme/src/index.ts`
- 修改文件: `packages/vitepress-theme/src/styles/custom.css`
