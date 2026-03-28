# 修复 Shiki 围栏代码行距倍增

## 补丁内容

用户在 patch-1 后反馈：渲染出的代码行距远大于 Markdown 源码，出现「多出一倍空行」感。

根因：`pre` 使用浏览器默认 `white-space: pre`；Shiki 输出的 HTML 在相邻 `</span><span class="line">` 之间带有换行文本节点。将 `.line` 设为 `display: block` 后，这些匿名换行会被当成独立空行渲染，与块级 `.line` 叠加形成倍增行距。

处理：

- 仅对 `pre.shiki code` 使用 `font-size: 0`，在 `code .line` 上恢复 `font-size` 与 `line-height`，使行间空白节点高度趋近于零。
- 撤销 patch-1 中行号列 `display: block` 与 `br { display: none }`，恢复 VitePress 默认行号 DOM 行为，仅保留行号 `font-family` 与代码一致。

已执行 `release/bundle.ts` 同步 dist。

## 影响范围

- 修改文件: `packages/vitepress-theme/src/styles/custom.css`
- 修改文件: `packages/vitepress-theme/dist/style.css`
- 修改文件: `packages/vitepress-theme/dist/styles/custom.css`
