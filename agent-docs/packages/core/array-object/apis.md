---
title: "数组与对象工具 API"
description: "@cat-kit/core 数组与对象工具的函数签名：union/unionBy/last/eachRight/omitArr/arr/o"
---

# 数组与对象工具 API

本篇列出数组与对象工具的公开函数签名与链式包装方法清单，均从 `@cat-kit/core` 包根导入。

从 `@cat-kit/core` 导入。`Arr` / `CatObject` 为返回类型，**不可**作为命名导入。

## 数组函数

```ts
declare function last<T extends any[]>(arr: [...T]): Last<T>
declare function union<T>(...arrList: T[][]): T[]
declare function unionBy<T extends Record<string, any>>(
  key: string,
  ...arrList: T[][]
): T[]
declare function eachRight<T>(
  arr: T[],
  cb: (v: T, i: number, arr: T[]) => void
): void
declare function omitArr<T>(arr: T[], indexes: number | number[]): T[]
declare function arr<T>(arr: T[]): Arr<T>
```

`Arr<T>` 方法：`eachRight`、`omit`、`find`、`last`（getter）、`move`、`groupBy`。

## 对象包装

```ts
declare function o<O extends Record<string, any>>(object: O): CatObject<O>
```

`CatObject` 方法：`keys`、`each`、`pick`、`omit`、`extend`、`deepExtend`、`merge`、`get`、`set`。

完整声明：

- [packages/core/dist/data/array.d.ts](../../../../packages/core/dist/data/array.d.ts)
- [packages/core/dist/data/object.d.ts](../../../../packages/core/dist/data/object.d.ts)
