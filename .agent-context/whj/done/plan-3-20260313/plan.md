# 优化和修复页面主题背景

> 状态: 已执行

## 目标

- 使得文档页面的 texture.jpg 背景图片固定不滚动
- 修复 VitePress 布局导航栏和侧栏顶部背景色遮挡背景图的割裂问题

## 内容

1. 在 `docs/.vitepress/theme/styles/custom.css` 中为 body 添加 `background-attachment: fixed`，使背景固定。
2. 覆盖 VitePress 主题的 `--vp-sidebar-bg-color`, `--vp-nav-bg-color`, `--vp-local-nav-bg-color` 等变量使其支持透明化。
3. 将 `.VPNavBarTitle` 的背景强制设置为透明，以消除侧边栏顶部纯色区域的背景遮挡。
4. 确保 `.VPLocalNav` 在亮色与暗色模式下拥有毛玻璃质感滤镜，维持整体水墨丹青主题一致性。

## 影响范围

- `docs/.vitepress/theme/styles/custom.css`

## 历史补丁
