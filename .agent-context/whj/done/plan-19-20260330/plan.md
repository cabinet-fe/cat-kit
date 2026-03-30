# @cat-kit/core 代码审视与改进项

> 状态: 已执行

## 目标

在**不新增外部依赖**、保持现有公共 API 稳定的前提下，整理 `@cat-kit/core` 的可改进点：修正文档/类型与边界行为、对齐 `AGENTS.md` 中「纯函数」表述与实际 API、补齐高风险路径的测试与实现细节，使核心库更易维护、行为更可预期。

## 内容

### 1. 文档与规范对齐

- 在 `packages/core/AGENTS.md`（或模块级注释）中明确：**链式包装类**（`o()` / `arr()` / `str()` / `n()` / `date()`）、**定时器**、**Observable** 等允许副作用；与「数据处理独立函数尽量纯」分层说明，避免与全局「纯函数」条目冲突。
- 修正 `packages/core/src/data/string.ts` 中导出函数 `str` 的 JSDoc 示例：避免 `const str = str('...')` 与函数名同名遮蔽（改为 `const s = str('...')` 等）。
- `packages/core/src/env/env.ts`：`getEnvironmentSummary` 的返回类型为 `Record<string, any>`，与已声明的 `EnvironmentSummary` 联合类型不一致；收敛为联合类型或明确文档说明为何使用宽类型。

### 2. 边界行为与健壮性

- `hex2u8a`（`transform.ts`）：对空串、奇数长度、非十六进制字符的处理策略（抛错 vs 截断 vs 返回空）予以定义并实现；避免依赖 `match(...)!` 的非空断言导致运行时异常。
- `query2obj`（`transform.ts`）：`split('=')` 仅取第一段作为 value，含 `=` 的 query 值会错误截断；改为仅分割第一个 `=`，或使用 `URLSearchParams` 语义（需权衡零依赖与浏览器/Node 兼容性）。
- `debounce`（`optimize/timer.ts`）：`clearTimeout` 后仍将 `timer` 设为 `undefined`（或改用单一「待执行句柄」状态），消除「已清除但变量仍为非 undefined」的隐患，并补测试：`immediate=true` 时连续快速调用、以及在 trailing 触发后的再次调用行为与当前预期一致。

### 3. API 一致性与可发现性（可选 Breaking 需单独决策）

- `type.ts` 中 `isBol` 与常见命名 `isBool`：评估是否增加别名导出并标注 `@deprecated`，或仅在文档中强调历史命名。
- `validator.ts`：`object` 与 `vObject`、`optional` 与 `vOptional` 重复：在 JSDoc 中标明推荐用法（例如对外文档统一 `object` / `optional`），减少重复认知负担。

### 4. 测试补齐

- 为 `packages/core/src/env/env.ts` 增加 `packages/tests/core/env.test.ts`（或等价路径）：至少覆盖 `getRuntime` / `isInNode` / `isInBrowser` 在 Vitest(Node) 下的行为；其余 UA 相关函数可用最小 mock 或文档注明「仅浏览器环境有意义」。
- 为上述 `hex2u8a`、`query2obj`、`debounce` 变更补充/调整用例，锁定行为。

### 5. 低优先级（记录即可，不必一次做完）

- `CatObject.extend` / `deepExtend` 中 `return console.warn(...)`：副作用与返回值怪异；长期可改为不依赖 `console` 的静默跳过或返回 `Result` 类型（牵涉 API 设计，单独计划更稳妥）。
- `unionBy`：当去重字段值为对象时 `Set` 按引用去重；在 JSDoc 中注明适用场景（原始值主键）。
- `number.ts` 中 `$n.minus` 循环变量 `i` 与 `ints.slice(1)` 的组合可读性一般；可在独立重构中改为 `reduce` 或显式索引，避免误读。

## 影响范围

- `packages/core/AGENTS.md`
- `packages/core/src/data/string.ts`
- `packages/core/src/env/env.ts`
- `packages/core/src/data/transform.ts`
- `packages/core/src/optimize/timer.ts`
- `packages/core/src/data/type.ts`
- `packages/core/src/data/validator.ts`
- `packages/tests/core/transform.test.ts`
- `packages/tests/core/timer.test.ts`
- `packages/tests/core/type.test.ts`
- `packages/tests/core/env.test.ts`（新建）

## 历史补丁
