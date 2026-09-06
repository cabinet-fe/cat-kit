---
title: "@cat-kit/core 包概览"
description: "零外部依赖的通用基础工具包：数据处理、数值、日期、环境检测、树结构、执行控制、状态订阅"
keywords:
  - "@cat-kit/core"
  - 工具包
  - 数组工具
  - 日期处理
  - 环境检测
  - 树结构遍历
  - 防抖节流
  - 深拷贝
  - schema 校验
  - 类型守卫
aliases:
  - 零依赖工具库
  - javascript utils
  - 前端工具函数
  - lodash 替代
  - underscore 替代
---

# @cat-kit/core

`@cat-kit/core` 是通用基础工具包，零外部依赖，适用浏览器与 Node.js 双环境，提供数据处理（数组、对象、字符串、数值、类型守卫）、日期、环境检测、树/森林结构、执行控制（防抖、节流、延时、并发）与浅层状态订阅等能力。

**导入**：`import { ... } from '@cat-kit/core'`（仅包根）

## 如何选择

- 数组、对象、字符串、数值等通用数据任务优先使用本包。
- LRU / 文件缓存 / 记忆化 → `@cat-kit/be` 缓存
- 安全随机 ID → `@cat-kit/crypto`

## 主题

| 主题 | 说明 |
| --- | --- |
| [any](any/index.md) | 深拷贝任意值（structuredClone + 兼容回退） |
| [array-object](array-object/index.md) | 合并去重、尾元素、挑选、忽略、对象更新 |
| [string-type](string-type/index.md) | 命名转换、URL 路径、类型守卫 |
| [transform-validation](transform-validation/index.md) | 字节编码、查询串、转换链、schema 校验 |
| [number](number/index.md) | 小数运算、表达式、格式化、范围 |
| [date](date/index.md) | 解析、格式化、加减、对齐、比较、区间 |
| [env](env/index.md) | 运行时、系统、浏览器、设备 |
| [data-structure](data-structure/index.md) | 树/森林遍历与节点关系 |
| [optimize](optimize/index.md) | 防抖、节流、延时、限并发、safeRun |
| [pattern](pattern/index.md) | 浅层状态订阅 |
| [组合示例](examples.md) | 跨主题组合使用 |

## 边界

浏览器专属类型守卫与环境信息依赖对应全局能力。
