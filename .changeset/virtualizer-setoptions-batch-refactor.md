---
'@cat-kit/fe': patch
---

Virtualizer 终极补足：

- 修复 `setOptions({ count, getItemKey })` 同轮更新按旧 key 空间剪裁、测量丢失的边界 bug（现按新 `getItemKey` 构造 alive 集合）。
- 视口前方项同批测量的 scroll 补偿累积到一次 DOM 写入，降低高频 resize 下的 layout 抖动（对齐 virtua 的 jump 合并策略）。
- 提取独立模块 `scroll-reconciler.ts` 承载 smooth 滚动 rAF 校准循环；提取 `updateCount` 私有方法消除 `setCount` 与 `applyOptions` 的字段级重复；以 `readScrollOffset` / `writeScroll` 统一轴向读写。内部重构不改变公开 API；实施前后净源码行数持平。
