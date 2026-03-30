# @cat-kit/core - 核心工具

零外部依赖的基础工具包，提供数据处理、数据结构、日期、性能优化等功能。通用环境（Browser + Node.js）。

## 目录结构

```
packages/core/src/
├── data/              # 数据处理工具
│   ├── array.ts       # 数组操作
│   ├── string.ts      # 字符串操作
│   ├── object.ts      # 对象操作
│   ├── number.ts      # 数字操作
│   ├── type.ts        # 类型工具/守卫
│   ├── validator.ts   # 验证器
│   ├── transform.ts   # 数据转换
│   └── index.ts
├── data-structure/    # 数据结构
│   ├── tree.ts        # 树结构
│   ├── forest.ts      # 森林（多棵树）
│   └── index.ts
├── date/              # 日期处理
│   └── date.ts
├── env/               # 环境检测
│   └── env.ts
├── optimize/          # 性能优化
│   ├── parallel.ts    # 并行执行
│   ├── safe.ts        # 安全包装器
│   ├── timer.ts       # 定时器（防抖/节流）
│   └── index.ts
├── pattern/           # 设计模式
│   └── observer.ts    # 观察者模式
└── index.ts           # 主导出文件
```

**当 `core/src` 中添加文件、文件意义变更时同步上面的目录结构！**

## 约束

- **禁止添加任何外部依赖**（除了 TypeScript 类型定义）
- **副作用与纯度分层**：
  - `data/` 下以独立函数为主的转换、校验、类型判断等，尽量保持**纯函数**（无副作用、相同输入相同输出）。
  - **链式包装**（如 `o()`、`arr()`、`str()`、`n()`、`date()`）在实例上提供可变或惰性语义，**不保证纯**。
  - **定时器**（`debounce` / `throttle` / `sleep`）、**Observable** 等与时间与订阅相关，**必然含副作用**。
- 独立函数导出，支持按需引入
- 所有公共 API 通过 `src/index.ts` 统一导出

## 与原生 API 对照

部分 API 与标准库/原生写法接近，说明如下（减少「重复造轮子」的误判）：

| API                   | 与原生关系                                     | 说明                                                                  |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| `last`                | 运行时可写作 `arr.at(-1)`                      | 保留主要为 **tuple 尾元素** 的类型推断                                |
| `union`               | 可用 `Set` / 展开合并等实现                    | 便利与风格封装                                                        |
| `eachRight`           | 等价于自尾向头的 `for` 循环                    | 遍历风格封装                                                          |
| `omitArr`             | 可用 `filter` + 索引集合实现                   | 便利封装                                                              |
| `sleep`               | 等价于 `new Promise((r) => setTimeout(r, ms))` | 语义化异步暂停                                                        |
| `isArray`             | 委托 `Array.isArray`                           | 与原生结论一致；仅需判断时也可用 `Array.isArray`                      |
| `object` / `optional` | 无单一原生对等物                               | 校验 schema 组合的唯一公开命名（旧名 `vObject` / `vOptional` 已移除） |

`obj2query` / `query2obj` 非 `URLSearchParams` 常规语义（见 `transform.ts` JSDoc）。`str2u8a` / `u8a2str` 优先 `TextEncoder` / `TextDecoder`，Node 下回退 `Buffer`，作为跨环境统一入口。

`getRuntime` 先检测 `globalThis.window` 再 `globalThis.process`，Electron 等并存时结果为 `browser`（见 `env/env.ts`）。
