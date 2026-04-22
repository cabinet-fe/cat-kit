---
'@cat-kit/fe': patch
---

Virtualizer: 修复 `getItemKey` 在 keyed ↔ non-keyed 切换时旧 key 污染缓存的边界 bug；smooth 滚动目标与当前 offset 已对齐时不再启动无谓的 rAF 校准循环；清理 `ScrollState.behavior` 死字段。
