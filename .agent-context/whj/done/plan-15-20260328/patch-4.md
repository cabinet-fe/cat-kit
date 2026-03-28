# 修复 VitePress 原生代码块行号间距错位

## 补丁内容

在 `packages/core/data` 页面复测后，确认原生 fenced code 的行号列出现「行高偏大、与代码行不对齐」问题。根因是主题样式只统一了字体，未显式约束代码行与行号列的 `line-height/font-size`，在当前主题排版覆盖下两者行盒度量不一致，导致行号“隔行拉大”。

本补丁在主题样式中统一了代码区与行号列的行高与字号，并将行号改为固定行盒（同时隐藏 `br` 换行），确保行号与代码按 1:1 行对齐。随后通过浏览器访问 `http://localhost:5173/cat-kit/packages/core/data` 进行回归，多个代码块均已对齐正常。

## 影响范围

- 修改文件: `packages/vitepress-theme/src/styles/custom.css`
- 修改文件: `packages/vitepress-theme/dist/style.css`
- 修改文件: `packages/vitepress-theme/dist/styles/custom.css`
