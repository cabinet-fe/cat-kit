# 修复 http 包类型错误

## 补丁内容

`plan-36` 实施后，运行 `tsc --noEmit` 时 `packages/http` 与 `packages/tests/http` 仍存在类型错误，分为三类：

1. **插件 `name` 字段必填导致的测试回归（计划直接引入的回归）**
   - `packages/tests/http/client.test.ts` 中以匿名对象形式构造的插件 fixture（共 10 处）缺失 `name` 字段，触发 `TS2741`。
   - 修复：为每个 fixture 补 `name`（`noop` / `before-request` / `after-respond` / `plugin-1` / `plugin-2` / `on-error` / `retry-ctx` / `retry-merge` / `recover` / `recover-first` / `recover-second` / `retry-loop`），保持 name 语义贴合用例。

2. **pre-existing TS 严格模式问题（影响 http 包信号，顺带修复）**
   - `packages/http/src/engine/fetch.ts(231)`：`new Blob([bytes])` 的 `Uint8Array<ArrayBufferLike>` 无法赋给 `BlobPart`（`Uint8Array<ArrayBuffer>` 才匹配，差异来自 TS 5.7+ 对 `SharedArrayBuffer` 的区分）。在传入 `Blob` 的这一处用 `as BlobPart` 收敛（运行时等价，仅类型层修正），避免多余复制。
   - `packages/tests/http/engine.test.ts`：`MockXHR` 的 `_method` / `_url` 两个私有字段只写不读，触发 `TS6133`。两个字段对断言没有任何作用，删除字段声明并将 `open()` 的形参改为下划线开头表示未使用，保持类型干净。
   - `packages/tests/http/plugins.test.ts`：导入名 `MethodOverridePlugin` / `TokenPlugin` 与源包导出的 `HTTPMethodOverridePlugin` / `HTTPTokenPlugin` 不匹配（`TS2724` / `TS2305`）。为最小改动，将 import 改成别名（`HTTPMethodOverridePlugin as MethodOverridePlugin`、`HTTPTokenPlugin as TokenPlugin`），测试主体不动。plan-36 原标注为「历史遗留、不在本计划范围」，但本补丁目标是"**彻底消除** http 包相关的类型错误"，因此一并修正。

3. **`packages/tests/tsconfig.json` 的 composite 项目 file list 问题**
   - 在 `composite: true` 下，通过 `@cat-kit/http/src` 等别名源码直接引入的文件必须列入 `include`；否则触发 `TS6307 "File ... is not listed within the file list of project"`，报满 5 条。
   - 修复：`include` 扩展为 `**/*.test.ts` + 各现存工作区包的 `../<pkg>/src/**/*.ts`（`be` / `cli` / `core` / `fe` / `http`），与 `packages/tests/AGENTS.md` 中「测试范围」保持一致（已删除的 `excel` / `maintenance` 不加入）。
   - 注：`packages/be/**` 与 `packages/tests/be|core` 下仍存在其它 pre-existing 类型错误（`lru-cache` / `cron` / `config.test` / `tree.test` 等），这些均与 plan-36 无关，且明确超出 http 包范围，本补丁**不改动**。

## 影响范围

- 修改文件:
  - `packages/http/src/engine/fetch.ts`
  - `packages/tests/http/client.test.ts`
  - `packages/tests/http/engine.test.ts`
  - `packages/tests/http/plugins.test.ts`
  - `packages/tests/tsconfig.json`
