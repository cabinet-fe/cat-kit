# 方向反转：把测试/文档/生成件对齐到源码 API

## 补丁内容

用户指出 plan-43 原实施方向错了：源码 `Virtualizer` 的公开 API（`connect` / `disconnect` / `buffer`）是用户主动保留的版本，不应被改动；真正与文档/测试不一致的是测试、文档、demo、skills 生成件这一侧，它们还停留在早先的 `mount` / `unmount` / `overscan` 命名。

本补丁执行反向对齐：

1. **还原源码**：`git checkout HEAD -- packages/fe/src/virtualizer/index.ts`，把上一次误改的公开 API 完整回退到 `connect(element)` / `disconnect()` / `buffer`（默认值 `4`）。同时清理源码 JSDoc 中仍残留的旧名（`mount` / `unmount` / `mount 会` / `onMounted(() => virtualizer.mount(...))`），使注释与实际方法名一致。不改动任何运行期行为。

2. **测试对齐源码 API**：`packages/fe/test/virtualizer.test.ts`
   - `overscan:` 全量替换为 `buffer:`（12 处，均为 `new Virtualizer({...})` / `smoothMount` 配置项）
   - `virtualizer.mount(` 全量替换为 `virtualizer.connect(`（4 处）
   - 测试标题：`应该根据 viewport 与 offset 计算虚拟项并应用 overscan` → `...并应用 buffer`；`应该支持 mount 到容器并驱动滚动同步` → `应该支持 connect 到容器并驱动滚动同步`
   - 内部 `smoothMount` 辅助函数名保留（只是测试局部名，与公开 API 无关）；`mounted` 字符（`mounted 映射`、`onMounted`、`onBeforeUnmount` 等）保留

3. **文档对齐源码 API**：`docs/content/packages/fe/virtualizer.md`
   - `overscan` 全量替换为 `buffer`（选项表格、代码示例、接口定义、`VirtualSnapshot` 注释中的 `已含 overscan 扩张` 等 6 处）
   - `virtualizer.mount(` / `virtualizer.unmount(` 以及 API 标题 `#### virtualizer.mount(element): this` 与 `#### virtualizer.unmount(): this` 同步改名为 `connect` / `disconnect`
   - 行文中 `unmount()` / `unmount` 反引号化 API 字眼统一替换为 `disconnect()` / `disconnect`；保留 Vue 生命周期钩子名 `onMounted` / `onBeforeUnmount` / `onUnmounted` 与内部 `mounted` 映射描述不变
   - 终止条件段落中 `用户...、unmount()` → `用户...、disconnect()`；介绍段的 API 枚举 `mount` → `connect`

4. **示例对齐源码 API**：
   - `docs/examples/fe/virtualizer/basic.vue`：`virtualizer.mount(viewportEl.value)` → `virtualizer.connect(viewportEl.value)`
   - `docs/examples/fe/virtualizer/table.vue`：`if (el) virtualizer.mount(el)` → `if (el) virtualizer.connect(el)`

5. **技能（skills）生成件与授权参考对齐**：
   - `skills/cat-kit-fe/references/virtualizer.md`：公共 API 速查表里 `.mount(element)` / `.unmount()` / `.destroy()` 中所有 `mount` / `unmount` 字眼切换为 `connect` / `disconnect`
   - `skills/cat-kit-fe/generated/virtualizer/index.d.ts` 与 `skills/cat-kit-<pkg>/generated/manifest.json`：通过 `cd packages/fe && bunx tsdown` 重新构建 fe 的 `dist/*.d.ts`，随后在仓库根运行 `bun run sync-cat-kit-skills-api` 把全部包 dist 的 d.ts 镜像刷新到 `skills/cat-kit-<pkg>/generated/`；这一步也同步刷新各包 `manifest.json` 的 `generatedAt` 时间戳

## 验收

- `cd packages/fe && bunx vitest run --globals test/virtualizer.test.ts` → **30/30 通过**
- `rg -n "\bmount\(|\bunmount\(|\boverscan\b" packages/fe/test packages/fe/src docs/content/packages/fe docs/examples/fe/virtualizer skills/cat-kit-fe/references skills/cat-kit-fe/generated/virtualizer` → 无 Virtualizer 语义下的旧 API 残留（保留 Vue 钩子 `onMounted` / `onBeforeUnmount` / `onUnmounted` 与内部私有 `mounted` 映射的描述）

## 影响范围

- 修改文件: `packages/fe/src/virtualizer/index.ts`（仅 JSDoc / 注释字面量；公开 API 与运行期行为保持 HEAD 版本）
- 修改文件: `packages/fe/test/virtualizer.test.ts`
- 修改文件: `docs/content/packages/fe/virtualizer.md`
- 修改文件: `docs/examples/fe/virtualizer/basic.vue`
- 修改文件: `docs/examples/fe/virtualizer/table.vue`
- 修改文件: `skills/cat-kit-fe/references/virtualizer.md`
- 重新生成: `packages/fe/dist/**/*.d.ts` / `packages/fe/dist/**/*.js` 等（由 `bunx tsdown` 产出，非业务代码）
- 重新生成: `skills/cat-kit-<pkg>/generated/**`（由 `bun run sync-cat-kit-skills-api` 产出，非业务代码）
