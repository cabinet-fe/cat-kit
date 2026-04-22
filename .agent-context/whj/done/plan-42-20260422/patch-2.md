# 修复 setOptions 同轮 key 空间裁剪 + 批量 scroll 补偿 + 代码拆分

## 补丁内容

针对 plan-42 实施后追加需求做三组增量修复：

### 1. P0：`setOptions({ count, getItemKey })` 同轮更新按旧 key 空间裁剪缓存

**根因**：`applyOptions` 中 `if (o.count !== undefined)` 分支先于 `getItemKey` 分支执行，`updateCount -> pruneMeasured` 用**旧** `getItemKey` 构造 `alive` 集合，将新映射下仍存活的测量条目误删。最小复现（新增回归用例 `setOptions({ count, getItemKey }) 同轮更新应按新 key 空间剪裁缓存`）：

```ts
const v = new Virtualizer({ count: 10, getItemKey: (i) => 'k' + i })
v.measure(5, 50)
v.setOptions({ count: 3, getItemKey: (i) => ['k0', 'k1', 'k5'][i]! })
// 旧实现：alive = {k0,k1,k2}（旧 getItemKey）→ k5 被误删
// 新实现：alive = {k0,k1,k5}（新 getItemKey）→ k5 保留
expect(v.getItem(2).size).toBe(50)
```

**修复**：在 `applyOptions` 中把 `getItemKey` 分支提到 `count` 分支**之前**。由于 `count` 与 `getItemKey` 同轮更新时，`getItemKey` 先行应用，`updateCount -> pruneMeasured` 自然使用新 key 空间构造 alive 集合。其余字段顺序保持不变。

**DoD**：已新增回归用例并通过；`getItemKey` 切换语义三条用例（前插 / 乱序 / keyed↔non-keyed 清空）仍全部通过。

### 2. P1：批量测量的 scroll 补偿合并为一次 DOM 写入

**背景**：旧 `applyMeasurement` 中「视口前方项尺寸变化 → 反向补偿 scrollTop 抑制抖动」的路径每条测量都直接 `el.scrollTop = this.offset`。同一批 `measureMany()` / `ResizeObserver` 回调里若有多条视口前方项同时变化（例如首屏多张图片一起解码完），会产生多次 `scrollTop` 写入。虚拟滚动同类库（如 virtua）通过 jump 合并把这一点压到每帧一次。

**修复**：
- 新增字段 `pendingScrollAdjust: number`，在 `applyMeasurement` 里只做「逻辑 offset 推进 + 累积器加法」，不再直接写 DOM。
- 在 `recompute()` 入口统一 flush：若 `pendingScrollAdjust !== 0` 且 `scrollElement` 仍在，就按当前轴向写一次 `scrollLeft` / `scrollTop`。
- 所有公共 mutation（`measure` / `measureMany` / `setCount` / `setOptions` / ResizeObserver 回调）最终都走 `recompute()`，天然确保每批只写一次；`reset()` 与 `unmount()` 在其它分支就会清空状态，不需要额外 flush。

**测试**：新增 `批量测量 scroll adjustment > 同帧多条视口前方项测量应只写一次 DOM scrollTop`。通过在 mock `scrollElement` 上把 `scrollTop` / `scrollLeft` 改写成 getter/setter 并计数 setter 调用次数，断言 10 条视口前方测量只触发 1 次 DOM 写入、`scrollTop` 最终值为累积后的 `offset`。

### 3. P2：拆分 + 去重 + 精简（净体积持平）

**动机**：用户要求「代码精简和拆分、容易阅读、不增加体积、禁止任何意义上的代码和 API 重复」。盘点到的重复 / 臃肿点：

- `setCount` 与 `applyOptions` 的 count 分支函数体几乎字字相同（pruneMeasured + sizes/starts 长度裁剪 + invalidate / dirtyIndex + pruneMounted）。
- `el.scrollTo({ [this.horizontal ? 'left' : 'top']: target, behavior })` 与 `this.horizontal ? el.scrollLeft : el.scrollTop` 在主类中重复 4+ 次。
- `ScrollState` 接口 / `scheduleScrollReconcile` / `cancelScrollReconcile` / `reconcileScroll` / `handleScroll` 抢占段构成一个自包含状态机，塞在 Virtualizer 类里稀释主线语义。
- 主类 header 与内部多处注释重复阐述「smooth 校准设计」。

**修复**：

- 提取私有方法 `Virtualizer.updateCount(next)`，返回是否发生变化；`setCount` 与 `applyOptions({ count })` 都复用它，消除字段级重复。
- 新增 `packages/fe/src/virtualizer/scroll-reconciler.ts`：
  - 导出常量 `SCROLL_EPSILON` / `SCROLL_RECONCILE_TIMEOUT`、工具函数 `readScrollOffset` / `writeScroll`、接口 `ScrollReconcilerHost`、类 `ScrollReconciler`（方法 `start` / `cancel` / `observeScroll` / `active` + 私有 `schedule` / `tick`）。
  - `ScrollReconciler` 通过 `Host` 注入「取元素 / 取轴向 / 目标重算 / clamp」四个能力，完全不感知 Virtualizer 内部字段。
- Virtualizer 主类：
  - 去掉 `ScrollState` / `SCROLL_EPSILON` / `SCROLL_RECONCILE_TIMEOUT` / `scrollState` / `scrollRafId` / `scheduleScrollReconcile` / `cancelScrollReconcile` / `reconcileScroll` / `handleScroll` 抢占段。
  - 构造函数实例化 `ScrollReconciler` 并传入闭包形式的 host。
  - `performScroll` 瘦身：smooth 分支仅 `reconciler.start(index, align, target)`，不再包含 state 构造 / rAF 排程 / 首帧早退等细节。
  - `handleScroll` 改为 `reconciler.observeScroll(nextOffset)` 一行。
  - `unmount` / `reset` 统一调用 `reconciler.cancel()`。
  - 三处 `el.scrollLeft / scrollTop` / `el.scrollTo({ [axis]: … })` 替换为 `readScrollOffset` / `writeScroll` 工具；`handleScroll` / `syncFromElement` / `performScroll` 三处均受益。
- 压缩 Virtualizer 主 header、applyOptions / pruneMeasured / measureElement / recompute 结构等分散的多行注释，同步移除与 scroll-reconciler.ts 重复的「smooth 校准设计说明」段。

**体积**：
- 旧：`packages/fe/src/virtualizer/{index.ts,resize-tracker.ts}` = 970 + 80 = **1050 行**。
- 新：`index.ts` + `resize-tracker.ts` + `scroll-reconciler.ts` = 826 + 80 + 144 = **1050 行**。
- 净增长 **0 行**；主文件从 970 降到 826，smooth 校准相关 170+ 行的状态机逻辑被集中到 144 行的新模块里。

**公共 API 影响**：无。`Virtualizer` 的构造签名、字段方法返回值、`VirtualizerOptions` / `VirtualSnapshot` / `VirtualScrollOptions` / `GetItemKey` 等类型签名完全保留；`scroll-reconciler.ts` 不参与 npm exports。

### 4. 文档与技能同步

- `docs/content/packages/fe/virtualizer.md` 「API 扩展 > getItemKey」补两条：keyed↔non-keyed 互切会清空缓存、`setOptions({ count, getItemKey })` 同轮更新按**新** getItemKey 做剪裁。
- `skills/cat-kit-fe/references/virtualizer.md` 补两条「使用备注」：同轮 setOptions 的推荐写法、批量 `measureMany` / ResizeObserver 回调的 scroll 补偿合并。
- `packages/fe/AGENTS.md` 目录结构追加 `scroll-reconciler.ts`。

### 验证

- `bunx vitest run packages/fe/test/virtualizer.test.ts` 30 条（原 28 + 新 2）全部通过。
- `bunx oxlint packages/fe/src/virtualizer packages/fe/test/virtualizer.test.ts` 0 warnings / 0 errors。
- `bunx oxfmt --write` 已格式化 4 个文件。
- `bun run build --filter=@cat-kit/fe` 构建通过（含 tsdown 类型检查），`dist/virtualizer/scroll-reconciler.js` 为内部 chunk、未暴露到公共 exports。
- `bun run sync-cat-kit-skills-api` 已同步 fe 生成物（`index.d.ts` / `virtualizer/index.d.ts` 跟随源码注释变化刷新；公共类型签名无变化）。

## 影响范围

- 修改：`packages/fe/src/virtualizer/index.ts`
  - `applyOptions` 重排：`getItemKey` 先于 `count`，修复同轮更新 key 空间裁剪的错序 bug
  - 新增私有 `updateCount(next)`，消除 `setCount` 与 `applyOptions({ count })` 的代码重复
  - 新增字段 `pendingScrollAdjust`；`applyMeasurement` 由「立即 `el.scrollTop = …`」改为累积；`recompute()` 入口统一 flush 一次 DOM 写入
  - 移除 `ScrollState` / `SCROLL_EPSILON` / `SCROLL_RECONCILE_TIMEOUT` / `scrollState` / `scrollRafId` / `scheduleScrollReconcile` / `cancelScrollReconcile` / `reconcileScroll`；`performScroll` smooth 分支 / `handleScroll` 抢占段改为调用 `ScrollReconciler`
  - 轴向读写统一为 `readScrollOffset` / `writeScroll` 工具调用
  - 精简 header 与多处分散注释，删除与 scroll-reconciler.ts 重复的 smooth 校准说明
- 新增：`packages/fe/src/virtualizer/scroll-reconciler.ts`（`ScrollReconciler` 类 + `ScrollReconcilerHost` 接口 + 常量 + `readScrollOffset` / `writeScroll` 工具）
- 修改：`packages/fe/test/virtualizer.test.ts`
  - 扩展 `createScrollElement()`：`scrollTop` / `scrollLeft` 改为 getter/setter 并计数 setter 写入次数（`scrollTopWrites` / `scrollLeftWrites`）
  - 新增用例 `setOptions({ count, getItemKey }) 同轮更新应按新 key 空间剪裁缓存`
  - 新增 `describe('批量测量 scroll adjustment')` 及其 `同帧多条视口前方项测量应只写一次 DOM scrollTop` 用例
- 修改：`docs/content/packages/fe/virtualizer.md`（`getItemKey` 章节补同轮 setOptions 语义与 keyed↔non-keyed 清空语义）
- 修改：`skills/cat-kit-fe/references/virtualizer.md`（新增 2 条使用备注）
- 修改：`packages/fe/AGENTS.md`（目录结构补 `scroll-reconciler.ts`）
- 同步（由 `bun run sync-cat-kit-skills-api` 自动刷新）：
  - `skills/cat-kit-fe/generated/index.d.ts`
  - `skills/cat-kit-fe/generated/virtualizer/index.d.ts`
  - `skills/cat-kit-*/generated/manifest.json`（hash 刷新）
- 新增：`.changeset/virtualizer-setoptions-batch-refactor.md`（`@cat-kit/fe: patch`）
