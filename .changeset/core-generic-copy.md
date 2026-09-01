---
"@cat-kit/core": minor
---

新增通用 `copy`（structuredClone 快路径 + 兼容回退，Vue 响应式不抛错）。

**破坏**：移除 `o().copy()`；旧 JSON 拷贝语义（丢函数、Date 变字符串、不能循环引用）不再提供。
