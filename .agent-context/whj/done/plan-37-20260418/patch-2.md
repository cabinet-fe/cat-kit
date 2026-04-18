# 强化 Virtualizer 的异高列表示例

## 补丁内容

将 `Virtualizer` 文档示例从“隐式依赖文本行数撑高”改为“固定估算高度 + 明确不等高卡片”的演示方式：为示例卡片引入分档高度、额外内容行和说明面板，并在文档页中明确说明这是一个异高 item 场景，便于读者直接观察 `measureElement` 对不等高列表的校正效果。

## 影响范围

- 修改文件: `docs/examples/fe/virtualizer/basic.vue`
- 修改文件: `docs/content/packages/fe/virtualizer.md`
