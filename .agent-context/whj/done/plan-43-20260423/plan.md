# virtualizer 测试/文档对齐源码 connect/disconnect/buffer API

> 状态: 已执行

## 目标

`packages/fe/test/virtualizer.test.ts` 当前 30 条用例有 11 条失败，根因是测试、文档、demo、skills 生成件这一侧仍沿用早先的 `mount` / `unmount` / `overscan` 命名，而源码 `Virtualizer` 的公开 API 早已由用户保留为 `connect(element)` / `disconnect()` / `buffer`。此计划把非源码一侧（测试、`docs/content/packages/fe/virtualizer.md`、demo、skills 的 `references/*.md` 与 `generated/*.d.ts`）整体对齐到源码的权威命名，恢复测试绿灯；源码公开 API 保持不变。

## 内容

1. 保持 `packages/fe/src/virtualizer/index.ts` 的公开 API 与运行期行为不变：`connect(element)` / `disconnect()` / `buffer?: number`（默认 4）。若源码 JSDoc 中残留过渡期旧名（`mount` / `unmount`），作为文档清理一并改回以保持注释与方法签名自洽。

2. `packages/fe/test/virtualizer.test.ts`：
   - 所有 `overscan:` 配置键改为 `buffer:`
   - 所有 `virtualizer.mount(` 改为 `virtualizer.connect(`
   - 测试标题 `应该根据 viewport 与 offset 计算虚拟项并应用 overscan` → `...并应用 buffer`；`应该支持 mount 到容器并驱动滚动同步` → `应该支持 connect 到容器并驱动滚动同步`
   - 局部辅助函数名 `smoothMount`、内部字段 `mounted` 映射字面量保留不变

3. `docs/content/packages/fe/virtualizer.md`：
   - `overscan` 字面量（选项表、示例代码、接口 `VirtualizerOptions.overscan?: number`、`VirtualSnapshot` 注释 `已含 overscan 扩张` / `不含 overscan 的原始命中范围`）统一改为 `buffer`
   - 行文与 API 标题中作为 Virtualizer 实例方法出现的 `mount` / `unmount` 改为 `connect` / `disconnect`；保留 Vue 生命周期钩子 `onMounted` / `onBeforeUnmount` / `onUnmounted` 与内部 `mounted` 映射相关表述

4. demo 示例：
   - `docs/examples/fe/virtualizer/basic.vue`：`virtualizer.mount(viewportEl.value)` → `virtualizer.connect(viewportEl.value)`
   - `docs/examples/fe/virtualizer/table.vue`：`if (el) virtualizer.mount(el)` → `if (el) virtualizer.connect(el)`

5. skills：
   - `skills/cat-kit-fe/references/virtualizer.md` 公共 API 速查表里 `.mount(element)` / `.unmount()` / `.destroy()` 对应说明中 `mount` / `unmount` 字眼改为 `connect` / `disconnect`
   - `skills/cat-kit-fe/generated/` 下的 `.d.ts` 与 `manifest.json` 由构建脚本产生，通过 `cd packages/fe && bunx tsdown` 重建 fe 的 `dist/**/*.d.ts`，随后在仓库根运行 `bun run sync-cat-kit-skills-api` 同步所有包的 `skills/cat-kit-<pkg>/generated/`

6. 验收：
   - `cd packages/fe && bunx vitest run --globals test/virtualizer.test.ts` → 30/30 通过
   - 全仓 `rg -n "\bmount\(|\bunmount\(|\boverscan\b" packages/fe/test packages/fe/src docs/content/packages/fe docs/examples/fe/virtualizer skills/cat-kit-fe/references skills/cat-kit-fe/generated/virtualizer` → 无 Virtualizer 语义下的旧 API 残留

## 影响范围

- `packages/fe/src/virtualizer/index.ts`（仅 JSDoc / 注释字面量的旧名清理；公开 API 与运行期逻辑保持 HEAD 版本）
- `packages/fe/test/virtualizer.test.ts`
- `docs/content/packages/fe/virtualizer.md`
- `docs/examples/fe/virtualizer/basic.vue`
- `docs/examples/fe/virtualizer/table.vue`
- `skills/cat-kit-fe/references/virtualizer.md`
- 重新生成: `packages/fe/dist/**`（`bunx tsdown` 产出，非业务代码）
- 重新生成: `skills/cat-kit-<pkg>/generated/**`（`bun run sync-cat-kit-skills-api` 产出，非业务代码）

## 历史补丁

- patch-1: 方向反转：把测试/文档/生成件对齐到源码 API
