---
title: "@cat-kit/core 通用工具库"
description: 零外部依赖的 TypeScript 工具库，浏览器与 Node.js 双环境可用：深拷贝、数组与对象链式操作、运行时类型守卫、字节编解码与 schema 校验、浮点精度数值运算、日期处理、环境检测、树结构、防抖节流并发与状态订阅。
aliases: [cat-kit, catkit, cat-kit core, 工具函数库, javascript utils, lodash 替代]
keywords: [copy, 深拷贝, 类型守卫, arr, o, 链式操作, str, camelCase, joinUrlPath, transform, object, schema 校验, $n, 浮点精度, Dater, 日期格式化, getRuntime, 环境检测, debounce, 并发控制]
---

# @cat-kit/core 通用工具库

`@cat-kit/core` 是零外部依赖的 TypeScript 工具库，全部 API 仅从包根 `@cat-kit/core` 导入（无子路径入口）。覆盖深拷贝、数组与对象操作、运行时类型守卫、字节编解码与 schema 校验、浮点精度数值运算、日期处理、环境检测、树/森林结构、执行控制与浅层状态订阅；浏览器与 Node.js 双环境可用，仅提供 ESM 入口。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

要求运行环境支持 ESM 的 `import`；浏览器与 Node.js 均可使用。当前版本 `1.2.1`。

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `copy` | 深拷贝任意值，`structuredClone` 优先、Proxy 与异常时图遍历回退 | `packages/core/any/apis.md` |
| `last` | 返回数组最后一个元素 | `packages/core/array-object/apis.md` |
| `union` | 合并多个数组并用 `Set` 去重 | `packages/core/array-object/apis.md` |
| `unionBy` | 合并多个对象数组并按指定字段去重 | `packages/core/array-object/apis.md` |
| `eachRight` | 从右向左遍历数组 | `packages/core/array-object/apis.md` |
| `omitArr` | 丢弃数组中指定索引的元素 | `packages/core/array-object/apis.md` |
| `arr` | 包装数组为 `Arr` 链式操作对象 | `packages/core/array-object/apis.md` |
| `o` | 包装对象为 `CatObject` 链式操作对象 | `packages/core/array-object/apis.md` |
| `str` | 包装字符串，提供驼峰 / kebab 命名转换 | `packages/core/string-type/apis.md` |
| `$str` | 字符串工具集：`joinUrlPath` 拼接 URL 路径 | `packages/core/string-type/apis.md` |
| `getDataType` | 返回值的类型字符串（如 `'array'`、`'date'`） | `packages/core/string-type/apis.md` |
| `isObj` | 是否是普通对象（`[object Object]`） | `packages/core/string-type/apis.md` |
| `isArray` | 是否是数组，委托 `Array.isArray` | `packages/core/string-type/apis.md` |
| `isString` | 是否是字符串 | `packages/core/string-type/apis.md` |
| `isNumber` | 是否是 number（`NaN` 也算） | `packages/core/string-type/apis.md` |
| `isBlob` | 是否是 `Blob` | `packages/core/string-type/apis.md` |
| `isDate` | 是否是 `Date`（Invalid Date 也算） | `packages/core/string-type/apis.md` |
| `isFunction` | 是否是函数 | `packages/core/string-type/apis.md` |
| `isBool` | 是否是布尔值 | `packages/core/string-type/apis.md` |
| `isFile` | 是否是 `File` | `packages/core/string-type/apis.md` |
| `isFormData` | 是否是 `FormData` | `packages/core/string-type/apis.md` |
| `isSymbol` | 是否是 `symbol` | `packages/core/string-type/apis.md` |
| `isPromise` | 是否是 `Promise` | `packages/core/string-type/apis.md` |
| `isArrayBuffer` | 是否是 `ArrayBuffer` | `packages/core/string-type/apis.md` |
| `isUint8Array` | 是否是 `Uint8Array` | `packages/core/string-type/apis.md` |
| `isUint16Array` | 是否是 `Uint16Array` | `packages/core/string-type/apis.md` |
| `isUint32Array` | 是否是 `Uint32Array` | `packages/core/string-type/apis.md` |
| `isInt8Array` | 是否是 `Int8Array` | `packages/core/string-type/apis.md` |
| `isInt16Array` | 是否是 `Int16Array` | `packages/core/string-type/apis.md` |
| `isInt32Array` | 是否是 `Int32Array` | `packages/core/string-type/apis.md` |
| `isNull` | 是否是 `null` | `packages/core/string-type/apis.md` |
| `isUndef` | 是否是 `undefined` | `packages/core/string-type/apis.md` |
| `isEmpty` | 是否是空值（仅 `null` / `undefined`） | `packages/core/string-type/apis.md` |
| `str2u8a` | 字符串转 `Uint8Array`（UTF-8） | `packages/core/transform-validation/apis.md` |
| `u8a2str` | `Uint8Array` 转字符串（UTF-8） | `packages/core/transform-validation/apis.md` |
| `u8a2hex` | `Uint8Array` 转十六进制字符串 | `packages/core/transform-validation/apis.md` |
| `hex2u8a` | 十六进制字符串转 `Uint8Array` | `packages/core/transform-validation/apis.md` |
| `base642u8a` | Base64 字符串转 `Uint8Array` | `packages/core/transform-validation/apis.md` |
| `u8a2base64` | `Uint8Array` 转 Base64 字符串 | `packages/core/transform-validation/apis.md` |
| `obj2query` | 对象转 URL 查询串（JSON 值语义） | `packages/core/transform-validation/apis.md` |
| `query2obj` | URL 查询串转对象（与 `obj2query` 成对） | `packages/core/transform-validation/apis.md` |
| `transform` | 按转换链同步依次转换数据 | `packages/core/transform-validation/apis.md` |
| `object` | 创建对象 schema 校验器 | `packages/core/transform-validation/apis.md` |
| `optional` | 标记可选字段并支持缺省值 | `packages/core/transform-validation/apis.md` |
| `vString` | 字符串字段解析器 | `packages/core/transform-validation/apis.md` |
| `vNumber` | 有限数字字段解析器 | `packages/core/transform-validation/apis.md` |
| `vBoolean` | 布尔字段解析器 | `packages/core/transform-validation/apis.md` |
| `vDate` | 有效 `Date` 字段解析器 | `packages/core/transform-validation/apis.md` |
| `vArray` | 数组字段解析器 | `packages/core/transform-validation/apis.md` |
| `createValidator` | 从自定义 `Parser` 创建 `Validator` | `packages/core/transform-validation/apis.md` |
| `ValidationError` | 校验失败异常类（`parse` 抛出） | `packages/core/transform-validation/apis.md` |
| `n` | 包装数字为 `Num`，链式格式化与范围限制 | `packages/core/number/apis.md` |
| `$n` | 数字工具集：高精度四则、求和、表达式求值、格式化器 | `packages/core/number/apis.md` |
| `date` | 包装日期输入为 `Dater`，缺省为当前时间 | `packages/core/date/apis.md` |
| `Dater` | 日期类：解析、格式化、加减、对齐、比较、区间 | `packages/core/date/apis.md` |
| `getRuntime` | 返回运行时 `'browser'` / `'node'` / `'unknown'` | `packages/core/env/apis.md` |
| `isInBrowser` | 是否运行在浏览器 | `packages/core/env/apis.md` |
| `isInNode` | 是否运行在 Node.js | `packages/core/env/apis.md` |
| `getOSType` | 返回操作系统类型 | `packages/core/env/apis.md` |
| `getDeviceType` | 返回设备类型 | `packages/core/env/apis.md` |
| `getBrowserType` | 返回浏览器类型 | `packages/core/env/apis.md` |
| `getBrowserVersion` | 返回浏览器版本号 | `packages/core/env/apis.md` |
| `isMobile` | 是否是移动设备 | `packages/core/env/apis.md` |
| `isTablet` | 是否是平板设备 | `packages/core/env/apis.md` |
| `isDesktop` | 是否是桌面设备 | `packages/core/env/apis.md` |
| `isTouchDevice` | 是否支持触摸 | `packages/core/env/apis.md` |
| `getNodeVersion` | 返回 Node.js 版本号 | `packages/core/env/apis.md` |
| `getEnvironmentSummary` | 返回环境信息汇总对象 | `packages/core/env/apis.md` |
| `debounce` | 防抖：默认 `delay` 300ms、`immediate` true | `packages/core/optimize/apis.md` |
| `throttle` | 节流：仅 leading 触发，抑制期返回最近结果 | `packages/core/optimize/apis.md` |
| `sleep` | 等待指定毫秒的 `Promise` | `packages/core/optimize/apis.md` |
| `parallel` | 限并发执行任务数组，结果保持任务顺序 | `packages/core/optimize/apis.md` |
| `safeRun` | 捕获同步异常，可提供默认返回值 | `packages/core/optimize/apis.md` |
| `Observable` | 普通对象浅层属性订阅（Proxy 实现） | `packages/core/pattern/apis.md` |
| `dfs` | 树的深度优先遍历 | `packages/core/data-structure/apis.md` |
| `bfs` | 树的广度优先遍历 | `packages/core/data-structure/apis.md` |
| `TreeNode` | 树节点类：插入、移除、路径与祖先查询 | `packages/core/data-structure/apis.md` |
| `TreeManager` | 树管理器：遍历、查找、扁平化、可见后代 | `packages/core/data-structure/apis.md` |
| `ForestNode` | 森林节点类，支持移除根节点 | `packages/core/data-structure/apis.md` |
| `Forest` | 森林管理器：管理多棵树 | `packages/core/data-structure/apis.md` |

类型导出（仅类型，不可运行时导入）：`Num`、`CurrencyConfig`、`NumberFormatOptions`（number/apis.md）；`Parser`、`Validator`、`SafeParseResult`、`ValidationIssue`、`InferObjectSchema`、`OptionalOptions`（transform-validation/apis.md）；`OSType`、`DeviceType`、`BrowserType`、`EnvironmentSummary`（env/apis.md）；`ParallelOptions`（optimize/apis.md）；`PropHandler`、`ObserveOptions`（pattern/apis.md）；`ITreeNode`、`NodeCreator`、`TreeManagerOptionsBase`、`TreeManagerOptionsWithCreator`、`IForestNode`、`ForestNodeCreator`、`ForestOptionsBase`、`ForestOptionsWithCreator`（data-structure/apis.md）。

跨模块组合用法见 [examples.md](examples.md)。
