# 修复 vitepress-theme 样式问题

> 状态: 已执行

## 目标

修复 docs 文档中 `@cat-kit/vitepress-theme` 的两处样式问题：
1. 宣纸纹理背景丢失（texture.jpg 被替换为 SVG 降级方案）
2. 代码块行号错位：行号与代码内容未对齐，行号间距过大且全部挤到底部

## 内容

### 问题一：宣纸纹理背景

1. **排查构建链**：确认 `dist/style.css` 是如何生成的（检查 monorepo 工具链、根级构建脚本或 CI 配置），判断是否存在可用构建命令。

2. **修复 `src/styles/custom.css`**：
   - 将 `body` 背景恢复为使用 `url(./texture.jpg)` 作为第一层
   - 保留现有 SVG 噪点 + 渐变作为降级层（texture.jpg 加载失败时保持效果）
   - 采用多层 `background-image` 叠加：`url(./texture.jpg), <svg fallback>, <gradients>`

3. **同步 `dist/styles/custom.css`**：与 src 版本保持一致（该文件作为 `./styles/custom.css` 导出，独立于主包）。

4. **修复 `dist/style.css`（主包）**：选择以下方案之一：
   - 方案 A（优先）：如果找到构建命令，重新构建包，Vite 会自动处理 texture.jpg 资源
   - 方案 B（备选）：将 texture.jpg 以 base64 data URL 嵌入 `dist/style.css`，确保自包含

### 问题二：代码块行号错位

5. **排查行号样式根因**：检查 `src/styles/custom.css` 及 VitePress 默认样式，找出导致行号与代码错位、间距异常的 CSS 规则（重点关注 `line-height`、`display`、`vertical-align` 等属性）。

6. **修复行号对齐**：在 `src/styles/custom.css` 中添加/修正代码块行号相关 CSS，使行号与每行代码正确对齐，消除间距异常问题。同步更新 `dist/styles/custom.css` 和 `dist/style.css`。

### 验证

7. **验证**：本地运行 `docs dev`，确认：
   - 浅色模式下宣纸纹理效果恢复，暗色模式不受影响
   - 代码块行号与代码对齐正常，无间距异常

## 影响范围

- `packages/vitepress-theme/src/styles/custom.css`（宣纸 `texture.jpg` 叠层背景、行号与代码块等宽字体对齐）
- `release/groups.ts`（构建后将 `texture.jpg` 复制到 `dist/`，与 `dist/style.css` 中 `url(./texture.jpg)` 一致）
- `packages/vitepress-theme/dist/style.css`、`packages/vitepress-theme/dist/styles/custom.css`、`packages/vitepress-theme/dist/texture.jpg`（由 `release/bundle.ts` 生成）
- `docs/.vitepress/config.ts`（串联主题 markdown 配置与 docs 自有 markdown 插件，恢复 `::: demo` 容器解析）
- `packages/vitepress-theme/src/index.ts`（移除 Node-only 模块的客户端入口导出，避免浏览器侧污染）

## 历史补丁

- patch-1: 修复 VitePress 原生 ``` 围栏与行号对齐
- patch-2: 修复 Shiki 围栏代码行距倍增
- patch-3: 修复 docs 渲染链路与代码块不可见
- patch-4: 修复 VitePress 原生代码块行号间距错位
