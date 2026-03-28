# 修复 VitePress 原生 ``` 围栏与行号对齐

## 补丁内容

用户反馈问题出在 **Markdown 围栏代码**（VitePress + Shiki + `markdown.lineNumbers`），而非 `::: demo` / CodeViewer。

VitePress 行号插件生成的是「`inline` 行号 + `<br>`」；Shiki 输出多为每行外包一层 `span.line`。两侧行盒模型不一致时，会出现行号与代码垂直错位。本补丁：

- 为 `code .line` 设为 `display: block`，与逻辑行一致。
- 将 `.line-numbers-wrapper .line-number` 改为块级，并隐藏插件注入的相邻 `<br>`，避免行距叠加。

已执行 `release/bundle.ts` 同步 `dist/style.css` 与 `dist/styles/custom.css`。

## 影响范围

- 修改文件: `packages/vitepress-theme/src/styles/custom.css`
- 修改文件: `packages/vitepress-theme/dist/style.css`
- 修改文件: `packages/vitepress-theme/dist/styles/custom.css`
