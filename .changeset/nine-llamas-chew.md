---
'@cat-kit/core': patch
---

fix(data): merge 方法不再跳过源对象的空值，确保 null/undefined/空字符串等从源对象覆盖到目标对象
