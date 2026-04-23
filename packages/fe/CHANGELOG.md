# @cat-kit/fe

## 1.1.3

### Patch Changes

- @cat-kit/core@1.1.3

## 1.1.2

### Patch Changes

- Updated dependencies [5a18a14]
  - @cat-kit/core@1.1.2

## 1.1.1

### Patch Changes

- 11ac889: 虚拟化增强
  - @cat-kit/core@1.1.1

## 1.1.0

### Minor Changes

- 242893a: Virtualizer: 新增 `getItemKey` 支持按数据项 key 复用测量（列表前插 / 乱序 / 中段删除时未变动项保留真实尺寸）；`scrollToIndex` / `scrollToOffset` 的 `behavior: 'smooth'` 支持 rAF 校准循环（目标漂移自动跳到修正位置，用户抢占或再次 `scrollTo*` 立即终止，5 秒安全阀兜底）。

### Patch Changes

- 242893a: fix virtualizer snapshot correctness and tighten hot paths
- 242893a: 修复 `Virtualizer` 两类真实项目使用中暴露的问题：

  - `unmount()` 未断开 `ResizeObserver` 且 `elementIndexes` WeakMap 残留，频繁挂载/卸载时会泄露对 DOM 元素与观察器的引用；修复后 `unmount()` 会显式 `disconnect` 全部被观察元素并清空 `mountedItems`，`destroy()` 进一步彻底释放 observer 实例。
  - `estimateSize` 与真实测量尺寸差距过大时，远距离滚动后 `totalSize` 剧烈跳变造成滚动条抖动；新增 `useMeasuredAverage` 选项（默认开启），未测项统一使用已测项平均尺寸做估值，并在平均值漂移超过 10% 时按需 `invalidateFrom(0)`，显著减小跳动。

  同步把内部实现拆分为 3 个私有工具模块 `size-cache`、`resize-tracker`、`scroll-end-detector`，不改变任何公共 API。新增 `docs/examples/fe/virtualizer/table.vue` 表格示例（2000 × 20、行高 30–60 随机、800px 视口）用于展示与回归滚动性能。

- 5dd642f: Virtualizer: 为所有公共 API 补充标准 TSDoc 注释（含参数 / 返回 / 抛错 / 示例 / 备注），同步更新文档站与 skill 的逐 API 使用说明；纯注释与文档变更，运行时行为未改变。
- 242893a: Virtualizer: 修复 `getItemKey` 在 keyed ↔ non-keyed 切换时旧 key 污染缓存的边界 bug；smooth 滚动目标与当前 offset 已对齐时不再启动无谓的 rAF 校准循环；清理 `ScrollState.behavior` 死字段。
- 242893a: Virtualizer 终极补足：

  - 修复 `setOptions({ count, getItemKey })` 同轮更新按旧 key 空间剪裁、测量丢失的边界 bug（现按新 `getItemKey` 构造 alive 集合）。
  - 视口前方项同批测量的 scroll 补偿累积到一次 DOM 写入，降低高频 resize 下的 layout 抖动（对齐 virtua 的 jump 合并策略）。
  - 提取独立模块 `scroll-reconciler.ts` 承载 smooth 滚动 rAF 校准循环；提取 `updateCount` 私有方法消除 `setCount` 与 `applyOptions` 的字段级重复；以 `readScrollOffset` / `writeScroll` 统一轴向读写。内部重构不改变公开 API；实施前后净源码行数持平。
  - @cat-kit/core@1.1.0

## 1.0.7

### Patch Changes

- 7585726: Virtualizer 增强与 API 收敛：

  - 新增 `gap` 配置：语义与 CSS `gap` 对齐，只作用于相邻两项之间，不影响首尾，默认 `0`。
  - API 精简（破坏性变更，不保留兼容层）：移除 `VirtualizerOptions.onChange`，移除 `resizeItem` / `getItems` / `getRange` / `getTotalSize` 公共方法；`getTotalSize` 降级为内部实现。订阅统一通过 `subscribe` + `getSnapshot` 完成。
  - 性能优化：`ResizeObserver` 回调改为批量测量后单次重算；新增 `scrollend` 事件支持，不支持时仍以 `setTimeout` 兜底；`setCount` 仅对新增尾部失效，收缩时复用既有测量；`paddingEnd` 变更不再触发 O(count) 重算；快照无视觉变化时跳过 `notify` 派发。
  - 注释增强：为公开接口与关键私有方法补充中文 JSDoc。
  - @cat-kit/core@1.0.7

## 1.0.6

### Patch Changes

- @cat-kit/core@1.0.6

## 1.0.5

### Patch Changes

- 407e248: 更新包构建
- Updated dependencies [407e248]
  - @cat-kit/core@1.0.5

## 1.0.4

### Patch Changes

- Updated dependencies [2ad5b2e]
  - @cat-kit/core@1.0.4

## 1.0.3

### Patch Changes

- 455541f: 新增虚拟化 API 和 Tween API
  - @cat-kit/core@1.0.3
