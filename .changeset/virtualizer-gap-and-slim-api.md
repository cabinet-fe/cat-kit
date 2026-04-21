---
'@cat-kit/fe': patch
---

Virtualizer 增强与 API 收敛：

- 新增 `gap` 配置：语义与 CSS `gap` 对齐，只作用于相邻两项之间，不影响首尾，默认 `0`。
- API 精简（破坏性变更，不保留兼容层）：移除 `VirtualizerOptions.onChange`，移除 `resizeItem` / `getItems` / `getRange` / `getTotalSize` 公共方法；`getTotalSize` 降级为内部实现。订阅统一通过 `subscribe` + `getSnapshot` 完成。
- 性能优化：`ResizeObserver` 回调改为批量测量后单次重算；新增 `scrollend` 事件支持，不支持时仍以 `setTimeout` 兜底；`setCount` 仅对新增尾部失效，收缩时复用既有测量；`paddingEnd` 变更不再触发 O(count) 重算；快照无视觉变化时跳过 `notify` 派发。
- 注释增强：为公开接口与关键私有方法补充中文 JSDoc。
