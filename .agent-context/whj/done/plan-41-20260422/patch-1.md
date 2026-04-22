# 平滑 perf 面板并合帧提交虚拟列表快照

## 补丁内容

为 `docs/examples/fe/virtualizer/table.vue` 增加两类 demo 层优化：

1. 将 `Virtualizer.subscribe()` 收到的快照改为按 `requestAnimationFrame` 合帧后再写入 Vue `shallowRef`，避免同一帧内多次 `scroll` 事件触发多次组件提交，降低手动滚动时的渲染抖动与卡顿。
2. 将 perf 面板中的 `FPS`、`min FPS`、`帧耗时` 更新改为短窗口平滑后的低频 DOM 直写，其中 `帧耗时` 改为显示平均帧耗时而非瞬时值，减少指标数字疯狂跳动带来的噪音和额外刷新成本。

同时同步更新文档与技能说明，明确 demo 中 perf 面板展示的是平滑指标，并补充宿主框架应对 `Virtualizer` 快照按帧合并提交的最佳实践。

## 影响范围

- 修改文件: `/Users/whj/codes/cat-kit/docs/examples/fe/virtualizer/table.vue`
- 修改文件: `/Users/whj/codes/cat-kit/docs/content/packages/fe/virtualizer.md`
- 修改文件: `/Users/whj/codes/cat-kit/skills/cat-kit-fe/references/virtualizer.md`
