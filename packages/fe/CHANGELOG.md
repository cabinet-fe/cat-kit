# @cat-kit/fe

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
