# 修正 Virtualizer 示例跳转与容器高度

## 补丁内容

修正 `@cat-kit/fe` 文档中 Virtualizer 交互示例的两个体验问题：

1. 将示例的 `estimateSize` 从过于偏小的固定值改为按卡片档位给出更接近真实值的预估高度，并在目标项挂载后补做一次居中对齐，减少远距离 `scrollToIndex` 明显跳偏的问题。
2. 提高示例滚动容器高度，改善文档页中异高列表的可视区域，让滚动与测量效果更容易观察。

同时同步更新文档描述，明确示例采用“预估 + 实测校正”的演示方式，避免文案与实际行为不一致。

## 影响范围

- 修改文件: `docs/examples/fe/virtualizer/basic.vue`
- 修改文件: `docs/content/packages/fe/virtualizer.md`
