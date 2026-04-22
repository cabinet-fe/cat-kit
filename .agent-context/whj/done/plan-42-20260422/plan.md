# Virtualizer 追齐 keyed items 与 smooth-scroll reconciliation

> 状态: 已执行

## 目标

让 `@cat-kit/fe` 的 `Virtualizer` 补齐两项 TanStack virtual-core 已有、cat-kit 目前缺失的关键能力，且在未启用新特性的路径上不引入额外的热路径开销：

1. **keyed items**：通过可选的 `getItemKey(index)` 让测量缓存按稳定 key 存储。这样列表前插、乱序、删除中段项时，未变动项的真实测量值依然可以被复用，避免列表内容重排后出现大面积的估值→实测抖动与 `totalSize` 跳变。
2. **smooth-scroll reconciliation**：`scrollToIndex/scrollToOffset` 在 `behavior: 'smooth'` 下开启 rAF 校准循环；平滑动画过程中若新的测量使目标 offset 改变，自动用 `behavior: 'auto'` 跳到修正后的目标位置；用户手动滚动或再次发起 `scrollTo*` 时立即终止循环；5 秒安全阀兜底。

## 内容

### 1. keyed items 核心改造（`packages/fe/src/virtualizer/index.ts`）

- 在 `VirtualizerOptions` 上新增可选字段 `getItemKey?: (index: number) => number | string`。未提供时行为与当前一致（按 index 缓存）。
- 把内部测量缓存的“真源”由 `measured: Map<number, number>` 切换为 `measuredByKey: Map<number | string, number>`。定义内部辅助 `keyOf(index)`：启用 `getItemKey` 时调用用户函数，未启用时直接返回 `index`（走同一个 Map 类型分支）。
- `applyMeasurement(index, size)` / `estimate(index)` / `advanceFirstUnmeasured` / `findNextUnmeasured` / `ensureMeasurements` 中所有 `measured.get(index) / .has(index) / .set(index, …)` 改为通过 `keyOf(index)` 间接查询 `measuredByKey`。
- `pruneMeasured(count)`（count 收缩时）：在 keyed 模式下，构建当前 `[0, count)` 范围内 `keyOf(i)` 的 Set，剔除 `measuredByKey` 中不在该集合里的条目，并相应扣减 `measuredSum`；再调用 `syncAverageEstimate()`；最后 `firstUnmeasured = Math.min(firstUnmeasured, count)`。未启用 keyed 时保留现有 O(已测数) 的索引剪裁逻辑。
- `reset()` 新增清空 `measuredByKey`。
- `setOptions({ getItemKey })`：把 `getItemKey` 视为需要全量失效的选项（与 `estimateSize` 同等对待），`invalidate(0)` 并清空 `measuredByKey`（函数身份一旦切换，旧 key 不再可信）。文档中声明 `getItemKey` 必须稳定。

### 2. measureElement 的 DOM 重排修复（`packages/fe/src/virtualizer/index.ts`）

当前 `measureElement(index, element)` 在同一 `element` 迁移到不同 `index` 时会残留一条 `mounted.get(oldIndex) === element` 的陈旧条目，后续若有新元素进入 `oldIndex` 会错误地 `tracker.unobserve(element)`。keyed 模式下列表重排频率显著提升，必须修掉：

- `measureElement(index, element)` 入口先读 `tracker.getIndex(element)`。若旧 index 存在且与新 index 不同，就清理 `mounted` 中 `oldIndex` 那条映射（仅当映射值就是当前 element 时）；然后再走既有「旧元素 → 新元素」的替换逻辑。
- 补充 `element === null` 情况下也正确执行 `tracker.unobserve(current)` 并 `mounted.delete(index)`（当前实现已覆盖，仅需保留不回归）。
- `ResizeTracker` 不需要改动；它自身已经按 element 身份去重 `observe`，并由 `indexes: WeakMap<Element, number>` 记录最新 index。

### 3. smooth-scroll reconciliation 核心改造（`packages/fe/src/virtualizer/index.ts`）

- 新增内部类型 `ScrollState = { index: number | null, align: VirtualAlign, behavior: ScrollBehavior, startedAt: number, lastTargetOffset: number, stableFrames: number }`，以及字段 `private scrollState: ScrollState | null = null` 和 `private scrollRafId: number | null = null`。
- 新增内部辅助 `getOffsetForIndex(index, align)`：抽出 `scrollToIndex` 原有的 align 换算逻辑，独立成可在 reconcile 循环中复用的纯函数（不写 DOM）。
- `scrollToOffset(offset, { align, behavior })` 与 `scrollToIndex(index, { align, behavior })`：
  - non-smooth 分支保留现有语义（同步写 `el.scrollTo`、同步更新 `this.offset = target`、`recompute()`），**不** 引入任何 rAF 调度。
  - smooth 分支：
    - **不** 预先写 `this.offset = target`。由 `handleScroll` 在浏览器平滑滚动过程中通过 scroll 事件驱动 `this.offset`。
    - 建立新的 `scrollState`（含 `startedAt = performance.now()`、`stableFrames = 0`）；若已有 `scrollState`，先取消旧的 rAF 并覆盖（一次新的 `scrollTo*` 调用自然终止上一次 reconcile）。
    - 调用一次 `el.scrollTo({ behavior: 'smooth' })` 触发浏览器原生平滑滚动。
    - `scheduleScrollReconcile()` 开始 rAF 循环。
- `scheduleScrollReconcile()`：若 `scrollRafId` 已存在则跳过；通过 `scrollElement.ownerDocument.defaultView.requestAnimationFrame` 排队一次 `reconcileScroll`。
- `reconcileScroll()`：
  - 若 `scrollState` 已被清空或 `scrollElement` 已卸载，直接返回。
  - 安全阀：`performance.now() - startedAt > 5000` → 清 `scrollState` 并返回。
  - 目标重算：`scrollState.index !== null` 时 `targetOffset = getOffsetForIndex(index, align)`；否则沿用 `lastTargetOffset`。
  - 如果 target 没变且当前 DOM offset 与 target 的差值小于 1px（等价 TanStack 的 `approxEqual`，抽成常量 `SCROLL_EPSILON = 1`）→ `stableFrames++`；达到 1 帧稳定后清 `scrollState` 并返回。
  - 如果 target 变了：`scrollState.lastTargetOffset = targetOffset`、`scrollState.behavior = 'auto'`、`stableFrames = 0`；调用一次 `el.scrollTo({ [axis]: target, behavior: 'auto' })` 跳到新位置。
  - 只要 `scrollState` 仍在，末尾都 `scheduleScrollReconcile()` 再排下一帧，保证 5 秒安全阀即便没有任何 scroll 事件也能触发。
- **终止条件**（用户选择 “abort”）：
  - `handleScroll` 中，如果当前 `scrollState !== null` 且 `|newOffset - scrollState.lastTargetOffset| > SCROLL_EPSILON`（浏览器平滑滚动自身不会跨这个阈值，能够把“用户干预”与“平滑动画的中间帧”区分开）→ 判定为用户抢占：清 `scrollState`、`cancelAnimationFrame(scrollRafId)`、`scrollRafId = null`。
  - 新的 `scrollToOffset/scrollToIndex` 进入时先清除旧 `scrollState` 与 rAF。
  - `unmount()` / `destroy()` 中清除 `scrollState` 与 rAF。
- measurement 触发的 invalidation：`applyMeasurement` 发生后若 `scrollState` 活跃，不做任何额外调度；下一帧 `reconcileScroll` 自然会通过 `getOffsetForIndex` 取到新值并做 `targetChanged` 分支。

### 4. 回归测试（`packages/fe/test/virtualizer.test.ts`）

新增以下用例（已有用例不做修改，仅在发现兼容性问题时最小调整）：

- **keyed — 前插保留测量**：`count=3, estimateSize=()=>10, getItemKey=(i)=>['a','b','c'][i]`，`measure(1, 40)`；切换到 `getItemKey=(i)=>['x','a','b','c'][i]` 并 `setCount(4)`；断言 `getItem(2).size === 40`（原 b），`getItem(0).size === 10`（新 x 走估值）。
- **keyed — 乱序保留测量**：`count=3, getItemKey=(i)=>['a','b','c'][i]`；`measure(0, 20)`、`measure(2, 60)`；切换映射为 `['c','a','b']`；断言 `getItem(0).size === 60`、`getItem(1).size === 20`。
- **keyed — count 收缩自动剪裁**：`getItemKey=(i)=>'k'+i`，`measure(2, 50)`、`measure(5, 80)`；`setCount(3)` 后内部 `measured` 的 size 小于等于 3（通过公开的 `getSnapshot().totalSize` 与 `useMeasuredAverage: false + estimateSize` 组合间接断言被剪裁）。
- **measureElement DOM 重排**：用一个 fake element 分别以 index=2 和 index=5 调用 `measureElement`，并发一次假的 RO 回调（通过直接调用 `measure(index, size)` 模拟），断言回调落在最新 index 对应的 key 上。
- **smooth — 目标漂移后重新 scrollTo 'auto'**：mock `scrollElement` + 手动驱动 rAF（注入一个 `vi.stubGlobal('requestAnimationFrame', fn=>(queue.push(fn), id++))`），`scrollToIndex(50, { behavior: 'smooth' })`；在 rAF tick 前做 `measureMany(...)` 改变前段 item size 使 target 偏移；跑一次 rAF；断言 `scrollElement.scrollTo` 在第二次调用时 `behavior: 'auto'` 且 top 为修正后的值。
- **smooth — offset 不被提前写入**：`scrollToIndex(10, { behavior: 'smooth' })` 后立即读 `getSnapshot().offset`，断言仍是旧值；手动触发一次 scroll event（scrollTop=中间值）后断言 `snapshot.offset` 更新。
- **smooth — 用户手动滚动终止**：`scrollToIndex(50, { behavior: 'smooth' })`；mock scrollTop 跳到远离 lastTargetOffset 的值并触发 scroll 事件；跑一次 rAF；断言 `scrollElement.scrollTo` 在用户滚动后不再被 reconcile 调用、rAF 队列长度不再增加。
- **smooth — 5 秒安全阀**：用 `vi.useFakeTimers()` 或 `vi.setSystemTime()` 推进 5001ms，在下一帧 reconcile 中断言 scrollState 被清理（通过观察 `scrollTo` 调用数不再增长间接验证）。
- **smooth — destroy 中取消 rAF**：`scrollToIndex(50, { behavior: 'smooth' })` 后立即 `destroy()`；断言后续不会再有 rAF 回调触发 `scrollTo`。

### 5. 文档（`docs/content/packages/fe/virtualizer.md`）

- 在 “快速使用” 附近新增一个 **API 扩展** 小节，以列表形式补充：
  - `getItemKey` 的作用、类型 `(index: number) => number | string`、必须保持对同一数据项稳定的约束、“count 收缩时不再被 `[0, count)` 引用的 key 会被自动清理”的生命周期声明。
  - `scrollToIndex/scrollToOffset` 的 `behavior: 'smooth'` 语义：浏览器原生平滑滚动 + rAF 校准；给出 “当用户在动画中滚动或再次调用 scrollTo* 时校准循环会被终止” 以及 5 秒安全阀。
  - smooth 下 `snapshot.offset` 由 scroll 事件驱动，业务不应假设 `scrollTo*` 调用后立刻等于目标值。
- 新增一个 **前插/乱序列表** 的代码片段（`ts` 代码块，~15 行），演示 `getItemKey` + `setCount` + 数据顺序切换时测量缓存复用的典型用法；不新增 demo `.vue` 文件以控制 scope。

### 6. 技能（`skills/cat-kit-fe/references/virtualizer.md`）

在现有 “使用备注” 列表中追加两条：

- keyed 模式使用备注：「`getItemKey` 传入后，`measure/measureElement` 拿到的 index 会经过 `getItemKey(index)` 解析为 key 写入缓存，因此同一个数据项在列表重排后仍能复用真实测量」；配上 1 行禁用锚定：「`getItemKey` 必须在整个生命周期稳定，不要基于 `Math.random()` 或当前时间生成」。
- smooth reconciliation 使用备注：「大列表远距离 `scrollToIndex(n, { behavior: 'smooth' })` 时，浏览器原生动画途中如果测量更新了 totalSize，cat-kit 会用 rAF 校准跳到修正后的目标；用户干预或新 `scrollTo*` 会立即终止校准；动画期间 `snapshot.offset` 由 scroll 事件驱动，不要对目标 offset 做同步断言」。

### 7. 生成物与 changeset

- 跑 `bun run sync-cat-kit-skills-api`，同步 `skills/cat-kit-fe/generated/index.d.ts`、`skills/cat-kit-fe/generated/virtualizer/index.d.ts`、`skills/cat-kit-fe/generated/manifest.json`。
- 新增一个 changeset：`.changeset/virtualizer-keyed-smooth.md`，`@cat-kit/fe: minor`，一句话总结「Virtualizer: 新增 getItemKey 支持按 key 复用测量；scrollTo* 的 behavior: 'smooth' 支持 rAF 校准」。

### 8. 验证

- `bun --cwd packages/fe run test ./test/virtualizer.test.ts`，确认新增用例与既有用例全部通过。
- `bunx oxlint packages/fe/src/virtualizer`、`bunx oxfmt --write packages/fe/src/virtualizer packages/fe/test/virtualizer.test.ts`。
- `bun run build --filter=@cat-kit/fe` 做一次类型检查兜底。
- 手动在 `docs/examples/fe/virtualizer/basic.vue` 的 demo 里（dev 模式）快速眼测一次 `scrollToIndex(999, { behavior: 'smooth' })` 动画最终对齐；若环境受限无法手验，记录在 implement 报告中并说明原因。

## 影响范围

- 修改：`packages/fe/src/virtualizer/index.ts`
  - 新增 `GetItemKey` 类型与 `VirtualizerOptions.getItemKey` 选项；内部测量缓存从 `measured: Map<number, number>` 切换为 `measuredByKey: Map<number | string, number>`，所有读写改走 `keyOf(index)` 间接访问
  - patch-4：为所有类型别名（`EstimateSize` / `VirtualAlign` / `VirtualizerSubscriber` / `GetItemKey`）、接口（`VirtualItem` / `VirtualRange` / `VirtualSnapshot` / `VirtualScrollOptions` / `VirtualMeasurement`）及 `Virtualizer` 类的 17 个公共方法补充标准 TSDoc（`@param` / `@returns` / `@throws` / `@remarks` / `@example`）
  - `pruneMeasured(count)` 在 keyed 模式下按新 key 集合剪裁；`reset()` 清空 `measuredByKey`；`applyOptions({ getItemKey })` 对 keyed↔non-keyed 互切清空缓存，对 keyed→keyed（函数身份切换）保留缓存
  - **applyOptions 重排**：`getItemKey` 分支先于 `count` 分支，修复 `setOptions({ count, getItemKey })` 同轮更新按**旧** key 空间裁剪导致测量丢失的 bug（patch-2）
  - 提取 `updateCount(next)` 私有方法，消除 `setCount` 与 `applyOptions({ count })` 的字段级代码重复（patch-2）
  - 新增 `pendingScrollAdjust` 字段：`applyMeasurement` 只累积 scroll 补偿 delta，在 `recompute()` 入口统一 flush 一次 DOM 写入；同一批 `measureMany` / `ResizeObserver` 回调只触发一次 scrollTop 写入（patch-2，对齐 virtua 的 jump 合并策略）
  - `unmount()` 新增 `pendingScrollAdjust = 0` 清零，与 `reset()` 对齐状态一致性（patch-3）
  - `measureElement(index, element)` 补充「同一 element 从旧 index 迁移到新 index」时的 `mounted[oldIndex]` 清理，避免后续 pruneMounted / 新元素进入 oldIndex 时误 unobserve 当前元素
  - 抽出纯函数 `getOffsetForIndex(index, align)`；`scrollToOffset` / `scrollToIndex` 合并至 `performScroll(index, align, offset, options)` 入口：non-smooth 保持原同步语义，smooth 不预写 `this.offset` 并启动 rAF 校准
  - 所有轴向读写统一为 `readScrollOffset` / `writeScroll` 工具调用（从 scroll-reconciler.ts 共享）
- 新增：`packages/fe/src/virtualizer/scroll-reconciler.ts`（patch-2）
  - 导出常量 `SCROLL_EPSILON` / `SCROLL_RECONCILE_TIMEOUT`、工具函数 `readScrollOffset` / `writeScroll`、接口 `ScrollReconcilerHost`
  - `ScrollReconciler` 类：封装 smooth 校准的 rAF 状态机（`start` / `cancel` / `observeScroll` / 私有 `schedule` / `tick`）
  - 旧实现中分散在 `ScrollState` 接口、`scheduleScrollReconcile` / `cancelScrollReconcile` / `reconcileScroll` / `handleScroll` 抢占段的 170+ 行逻辑集中到 144 行自包含模块；主文件 `index.ts` 从 970 降到 826 行，整个 virtualizer 目录源码合计 **1050 → 1050** 行（0 增长）
  - patch-3：新增私有 `window` 缓存字段，`start()` 时从 `el.ownerDocument.defaultView` 抓取一次；`cancel()` / `schedule()` 改为只读缓存字段，不再依赖 `host.getElement()`，解耦 unmount 顺序敏感性
- 修改：`packages/fe/test/virtualizer.test.ts`
  - 扩展 `createScrollElement()`：记录 `scrollToArgs`（含 `behavior`）、`ownerDocument.defaultView` 暴露 rAF mock、`flushRaf()` / `rafCount()` 支持手动驱动校准循环
  - patch-2 进一步扩展：`scrollTop` / `scrollLeft` 改为 getter/setter 并计数 setter 写入次数（`scrollTopWrites` / `scrollLeftWrites`），用于 DOM 批量写入断言
  - 新增 11 条用例：keyed 前插 / 乱序 / count 收缩剪裁；`measureElement` 同 element 迁移 index；smooth 漂移修正、offset 不预写、用户反向抢占、5 秒安全阀、destroy 取消 rAF；`setOptions({ count, getItemKey })` 同轮剪裁（patch-2）；同帧多条视口前方测量只写一次 DOM（patch-2）
- 修改：`packages/fe/AGENTS.md`：目录结构追加 `scroll-reconciler.ts` 条目（patch-2）
- 修改：`docs/content/packages/fe/virtualizer.md`
  - 新增「API 扩展」小节说明 `getItemKey` 生命周期与约束，以及 `behavior: 'smooth'` 的 reconciliation 语义与 `snapshot.offset` 行为
  - 构造参数接口补充 `getItemKey?: (index: number) => number | string`
  - 新增前插 / 乱序列表的代码片段示例
  - patch-2：补 keyed↔non-keyed 互切清空缓存、`setOptions({ count, getItemKey })` 同轮按新 key 空间剪裁两条语义说明
  - patch-4：「API 参考」章节重写为按职责分组的逐 API 使用说明（构造与生命周期 / 选项与尺寸更新 / 测量 / 滚动 / 快照与订阅 5 组、17 个公共方法），构造参数新增字段默认值 + 说明表格，快照结构新增字段级行内注释与块状布局渲染建议
- 修改：`skills/cat-kit-fe/references/virtualizer.md`
  - 追加 `getItemKey` 与 smooth reconciliation 的两条使用备注
  - patch-2：新增同轮 setOptions 推荐写法 + 批量测量 scroll 补偿合并两条备注
  - patch-4：`## 使用备注` 之前新增 `## 公共 API 速查`，按职责分 5 组成表列出 17 个公共 API 的签名与关键行为
- 同步（由 `bun run sync-cat-kit-skills-api:build` 自动生成）：
  - `skills/cat-kit-fe/generated/index.d.ts`
  - `skills/cat-kit-fe/generated/virtualizer/index.d.ts`
  - `skills/cat-kit-*/generated/manifest.json`（sync 脚本全量刷新所有包的 manifest hash）
- 新增：`.changeset/virtualizer-keyed-smooth.md`（`@cat-kit/fe: minor`）
- 新增：`.changeset/virtualizer-review-fixes.md`（`@cat-kit/fe: patch`，patch-1；patch-3 修复 frontmatter 格式损坏）
- 新增：`.changeset/virtualizer-setoptions-batch-refactor.md`（`@cat-kit/fe: patch`，patch-2；patch-3 修复 frontmatter 格式损坏）
- 新增：`.changeset/virtualizer-public-api-docs.md`（`@cat-kit/fe: patch`，patch-4）

### 实施说明

1. **`setOptions({ getItemKey })` 与「函数身份切换清空缓存」的取舍**：计划文本要求「函数身份一旦切换，旧 key 不再可信 → 清空 `measuredByKey`」，但计划中「keyed — 前插保留测量」「keyed — 乱序保留测量」两条测试都在 `setOptions` 切换 `getItemKey` 函数引用后期望旧 key 的真实测量值被复用。两者冲突时以测试可观察行为为准（也契合 TanStack 的惯例：key 是数据项身份，只要用户遵守「key 稳定」约束，切换函数不破坏旧 key 可信性），因此实现只重置 `firstUnmeasured` 并 `invalidate(0)`，保留 `measuredByKey`。
2. **`handleScroll` 的抢占判据**：计划字面「`|newOffset - scrollState.lastTargetOffset| > SCROLL_EPSILON`」在 smooth 动画起始时（DOM offset 仍远离 target）会立即误判为用户抢占。按计划注释「浏览器平滑滚动自身不会跨这个阈值」的不变式（距离 target 单调递减、不跨过 target），在 `ScrollState` 中额外维护 `lastObservedOffset`，把判据改为「当前距离 target 比上次观察时扩大超过 `SCROLL_EPSILON`」，语义符合「抢占 = 距离反向扩大」，首帧无基准则跳过判定。对应测试「smooth — 用户手动滚动终止」按此判据断言（先单调递减，再反向跳回，判抢占）。
3. **手动眼测**：计划第 8 步最后一项「在 dev 模式的 `docs/examples/fe/virtualizer/basic.vue` 里眼测 `scrollToIndex(999, { behavior: 'smooth' })` 动画最终对齐」本环境无浏览器 dev server，未实际眼测，由上述 9 条回归用例（含漂移修正、抢占、安全阀、destroy）在 Node 环境覆盖主要路径。
4. **验证结果**：`bunx vitest run packages/fe/test/virtualizer.test.ts` 24 条（原 15 + 新 9）全部通过；`bunx oxlint packages/fe` 0 warnings / 0 errors；`bunx oxfmt --write` 已格式化源码与测试文件；`bun run build --filter=@cat-kit/fe` 构建通过（含 tsdown 类型检查），`dist/virtualizer/index.d.ts` 已包含 `getItemKey`。

## 历史补丁

- patch-1: 修复代码审查发现的 P2/P3 问题
- patch-2: 修复 setOptions 同轮 key 空间裁剪 + 批量 scroll 补偿 + 代码拆分
- patch-3: 修复 review 发现的 changeset 格式与收尾问题
- patch-4: 补齐公共 API TSDoc + 文档 / SKILL 逐 API 使用说明
