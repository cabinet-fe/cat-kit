---
'@cat-kit/fe': patch
---

修复 `Virtualizer` 两类真实项目使用中暴露的问题：

- `unmount()` 未断开 `ResizeObserver` 且 `elementIndexes` WeakMap 残留，频繁挂载/卸载时会泄露对 DOM 元素与观察器的引用；修复后 `unmount()` 会显式 `disconnect` 全部被观察元素并清空 `mountedItems`，`destroy()` 进一步彻底释放 observer 实例。
- `estimateSize` 与真实测量尺寸差距过大时，远距离滚动后 `totalSize` 剧烈跳变造成滚动条抖动；新增 `useMeasuredAverage` 选项（默认开启），未测项统一使用已测项平均尺寸做估值，并在平均值漂移超过 10% 时按需 `invalidateFrom(0)`，显著减小跳动。

同步把内部实现拆分为 3 个私有工具模块 `size-cache`、`resize-tracker`、`scroll-end-detector`，不改变任何公共 API。新增 `docs/examples/fe/virtualizer/table.vue` 表格示例（2000 × 20、行高 30–60 随机、800px 视口）用于展示与回归滚动性能。
