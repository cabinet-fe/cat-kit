# @cat-kit/core 公开 API 与原生能力对照及收敛

> 状态: 已执行

## 目标

在**不新增外部依赖**、默认保持公共 API 稳定的前提下，厘清 `@cat-kit/core` 中与原生/标准库重叠或可误用的导出：用文档与可选实现调整减少「重复造轮子」的认知成本；对确有 long-term 价值的别名与历史命名制定 deprecate / major 移除路径。

## 内容

### 1. 文档：与原生对照（无 breaking）

- 在 `packages/core/AGENTS.md` 增加简短小节 **「与原生 API 对照」**，至少覆盖：
  - `last`：运行时可与 `Array.prototype.at(-1)` 对照；说明保留理由为 **tuple 尾元素类型推断**。
  - `union` / `eachRight` / `omitArr`：给出等价原生写法或一句说明「便利/风格封装」。
  - `sleep`：注明等价于 `new Promise((r) => setTimeout(r, ms))`。
  - `isArray`：说明与 `Array.isArray` 的关系，并倾向推荐 **`Array.isArray` 作为「是否为数组」的权威判断**（若后续改实现见步骤 2）。
- 在 `packages/core/src/data/transform.ts` 的 `obj2query` / `query2obj` JSDoc（或 AGENTS 交叉引用）中明确：**非** `URLSearchParams` 的常规表单语义（值经 JSON 序列化等），避免被误替换为原生而行为变化。
- 在 `packages/core/src/data/transform.ts` 的 `str2u8a` / `u8a2str` JSDoc 中说明：现代环境的 `TextEncoder`/`TextDecoder` 与本函数 **跨环境统一入口** 的定位差异。

### 2. 可选实现调整：`isArray`（需全量测试）

- 评估将 `isArray` 实现改为委托 `Array.isArray`（或与之一致的行为），避免 `Object.prototype.toString` 路径与跨 realm 等边缘差异。
- 在 `packages/tests/core/type.test.ts`（或对应文件）补充/调整用例，确认与现有对外承诺一致后再合入。

### 3. 长期 breaking 清单（单独 major 或统一发版时执行）

- 停止导出或移除 `isBol`（已有 `isBool` + `@deprecated`，见 `type.ts`）。
- 收敛 `validator` 对外名称：优先文档与示例仅使用 `object` / `optional`；major 时移除 `vObject` / `vOptional` 或改为内部别名不导出（以包导出表为准）。

### 4. 环境 API 文档化（无 breaking，除非另开 breaking 变更）

- 在 `packages/core/src/env/env.ts` 或 AGENTS 中文档化 `getRuntime`：**先检测 `window`**，在 Electron 等同时存在 `window` 与 `process` 时结果为 `browser`；若未来调整优先级，须 major + 迁移说明。

### 5. `safeRun`（低优先级、非原生替代类）

- 可选：为 `safeRun` 增加可选 `onError` 回调或文档中强调「吞错不利于调试」；不作为本计划必完成项。

## 影响范围

- `packages/core/AGENTS.md`（新增「与原生 API 对照」）
- `packages/core/src/data/type.ts`（`isArray` 委托 `Array.isArray`；移除 `isBol`）
- `packages/core/src/data/validator.ts`（移除 `vObject` / `vOptional` 导出）
- `packages/core/src/data/transform.ts`（`obj2query` / `query2obj` / `str2u8a` / `u8a2str` JSDoc）
- `packages/core/src/env/env.ts`（`getRuntime` 经 `globalThis` 探测并补充文档）
- `packages/tests/core/type.test.ts`、`packages/tests/core/validator.test.ts`
- `docs/content/packages/core/data.md`（`isBool` 示例与索引）

## 历史补丁
