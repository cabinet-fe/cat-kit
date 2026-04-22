---
'@cat-kit/fe': minor
---

Virtualizer: 新增 `getItemKey` 支持按数据项 key 复用测量（列表前插 / 乱序 / 中段删除时未变动项保留真实尺寸）；`scrollToIndex` / `scrollToOffset` 的 `behavior: 'smooth'` 支持 rAF 校准循环（目标漂移自动跳到修正位置，用户抢占或再次 `scrollTo*` 立即终止，5 秒安全阀兜底）。
