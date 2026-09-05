---
title: "任意值拷贝 copy API"
description: "@cat-kit/core 的 copy 函数签名与完整类型声明链接"
---

# 任意值拷贝 copy API

`copy` 是 `@cat-kit/core` 提供的唯一深拷贝入口，从包根导入，对任意输入值返回深拷贝快照。

从 `@cat-kit/core` 导入。

```ts
declare function copy<T>(value: T): T
```

完整声明：[packages/core/dist/data/any.d.ts](../../../../packages/core/dist/data/any.d.ts)
