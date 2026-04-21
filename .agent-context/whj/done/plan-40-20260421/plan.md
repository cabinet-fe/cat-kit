# Virtualizer 增加 gap、精简 API、优化性能

> 状态: 已执行

## 目标

- **功能补齐**：为 `@cat-kit/fe` 的 `Virtualizer` 增加与 CSS flex/grid 语义一致的 `gap` 配置，统一虚拟位置与视觉间距，避免使用方手动叠 `margin` 时与虚拟偏移错位。
- **API 精简**：收敛 `Virtualizer` 公共 API，移除纯冗余的便利接口（`onChange`、`resizeItem`、`getItems`、`getRange`、`getTotalSize`），将快照派发的入口统一为 `subscribe` + `getSnapshot`，降低维护与心智负担。
- **性能修正**：消除当前实现的可观察性能毛刺——`ResizeObserver` 未做批量化、`setCount` / `paddingEnd` 过度失效、滚动结束判定仅依赖 `setTimeout` 抖动、无意义 notify——并在可用时改用现代 `scrollend` 事件。
- **注释增强**：为 `Virtualizer` 与相关类型添加定位清晰、只表达意图与约束的中文 JSDoc，避免叙述式冗余注释。
- **同步文档与技能**：将上述破坏性变更同步到 `docs/content/packages/fe/virtualizer.md`、例子文件与 `skills/cat-kit-fe` 生成产物，保持三方一致。

## 内容

### 1. 新增 `gap` 配置（packages/fe/src/virtualizer/index.ts）

- 在 `VirtualizerOptions` 接口新增字段 `gap?: number`，语义：相邻两项之间的间隔（px），**不作用于首尾**，与 CSS `gap` 对齐；默认 `0`。
- `Virtualizer` 新增私有属性 `private gap = 0`。
- 在 `applyOptions` 中处理 `options.gap`：
  - 规整为 `Math.max(0, Math.round(options.gap))`。
  - 变更时调用 `this.invalidateFrom(0)`。
- 改造 `ensureMeasurements` 布局循环：
  - 第 `index === 0` 项：`start = this.paddingStart`（不变）。
  - 第 `index ≥ 1` 项：`start = this.ends[index - 1] + this.gap`。
- `getTotalSize` 不变（它基于最后一项 `end + paddingEnd`；`gap` 已在项间累积到 `end`）。

### 2. 精简公共 API（破坏性变更）

必须在同一提交内完成以下全部移除，不保留兼容层：

- 移除 `VirtualizerOptions.onChange` 字段；移除 `private onChange?: VirtualizerSubscriber`；移除 `applyOptions` 中对 `options.onChange` 的赋值；修改 `notify()` 只遍历 `this.subscribers`。
- 移除公有方法 `resizeItem(index, size)`（纯 `measure` 别名）。
- 移除公有方法 `getItems()`、`getRange()`、`getTotalSize()`（均能通过 `getSnapshot()` 读取）。
- `getTotalSize` 降级为 `private`，仅用于 `recompute` / `clampOffset`。
- `getItem(index: number): VirtualItem` **保留不动**（索引随机访问，快照不提供此能力）。
- `setOptions`、`setCount`、`setViewport`、`setOffset`、`mount`、`unmount`、`destroy`、`subscribe`、`measure`、`measureElement`、`scrollToOffset`、`scrollToIndex`、`reset`、`getSnapshot` 均保留。

### 3. 性能修正

#### 3.1 `ResizeObserver` 批量化

- 将 `measure(index, size)` 内部拆分为两个步骤：
  - 新增 `private applyMeasurement(index: number, size: number): boolean`：仅更新 `measuredSizes` 并在尺寸变化时调用 `invalidateFrom(index)`，返回是否发生变更。
  - 公共 `measure(index, size)` 保留"单项测量并立即 recompute"的语义，内部调用 `applyMeasurement` 后再 `recompute`。
- 改造 `ensureItemObserver` 的 callback：
  - 在单次 entries 循环内连续调用 `applyMeasurement`，统计是否存在任意一项尺寸变化。
  - 循环结束后仅在存在变更时触发一次 `recompute`，不是每个 entry 都重算。

#### 3.2 滚动结束判定使用 `scrollend` + `setTimeout` 兜底

- 在 `mount(element)` 时探测 `'onscrollend' in element`：
  - 支持：同时注册 `scroll` 和 `scrollend` 监听；`scrollend` 回调负责将 `isScrolling` 置为 `false` 并 `recompute`；不再依赖 `setTimeout`。
  - 不支持：保留现有 `setTimeout(DEFAULT_SCROLL_END_DELAY)` 路径。
- 抽取 `private markScrollEnd()` 私有方法统一执行"isScrolling=false + recompute"，两条路径共用。
- `unmount` 时：移除 `scroll` 监听、若注册过则移除 `scrollend` 监听、清理 setTimeout。

#### 3.3 `setCount` 失效范围收窄

- 当前 `setCount` 调用 `invalidateFrom(0)`，代价 O(count)。重构后：
  - 记录旧 count `const prev = this.count`。
  - `pruneCaches()` 对增长情况也正确处理（目前 `starts.length = this.count` 能够向下截断，但增长时会写入 undefined；后续 `ensureMeasurements` 会按 dirtyIndex 填充，所以是正确的）。
  - 若 `count > prev`：`invalidateFrom(prev)`（只计算新增尾部）。
  - 若 `count < prev`：设置 `dirtyIndex = Math.min(dirtyIndex, count)`（现有数据仍有效，不触发重算）。
  - 若 `count === prev`：不动。

#### 3.4 `paddingEnd` 不再无谓失效

- `applyOptions` 中处理 `options.paddingEnd`：仅赋值规整后的 `paddingEnd`，**移除** `invalidateFrom(0)` 调用（`paddingEnd` 只影响 `getTotalSize` 的尾部加项，不改变任何 item 的 `start`/`end`/`size`）。
- `paddingStart`、`estimateSize`、`gap` 变更仍需 `invalidateFrom(0)`，保持不变。

#### 3.5 `notify` 去抖

- 在 `recompute()` 生成新 snapshot 前，保留上一次 snapshot 的引用 `prev = this.snapshot`。
- 比较以下关键字段是否全部等价：`totalSize`、`offset`、`viewportSize`、`isScrolling`、`horizontal`、`range?.startIndex`、`range?.endIndex`、`beforeSize`、`afterSize`、`items.length`、首项的 `index`/`start`/`size`、末项的 `index`/`start`/`size`。
- 若全部等价：保持 `this.snapshot = prev`，**不**触发 `notify()`。
- 若任一不等：写入新 snapshot 并 `notify()`。
- 首次计算（`prev.items.length === 0` 且 `prev.range === null`）与 destroy 前的 `reset` 仍按原逻辑推送一次。

### 4. 注释梳理

- 文件顶部：添加简短模块注释，说明"定位：Vue composable/框架适配层的核心，仅负责位置计算、测量派发与快照广播；不持有 DOM 渲染职责"。
- `VirtualizerOptions`、`VirtualItem`、`VirtualRange`、`VirtualSnapshot` 四个接口：对每个字段加一行中文 JSDoc，仅说明语义与默认值。
- `Virtualizer` 的每个 public 方法加一段 JSDoc：覆盖用途、关键副作用（是否触发 notify、是否改变 offset、是否重新测量），不写"调用某某方法"这类叙述注释。
- `handleScroll`、`ensureItemObserver`、`observeContainer`、`markScrollEnd` 四个私有方法加简短注释，说明批量化/兜底策略。
- 所有注释遵循 `AGENTS.md` 约束：不添加叙述式无意义注释（如"// 遍历 entries"）。

### 5. 测试同步（packages/fe/test/virtualizer.test.ts）

- 替换：`virtualizer.getTotalSize()` → `virtualizer.getSnapshot().totalSize`；`virtualizer.getItems()` → `virtualizer.getSnapshot().items`。
- `subscribe` 用例保持断言 `[60, 80]`；由于新增 notify 去抖，逐一确认用例中每次 `measure` 都会导致 `totalSize` 变化，因此断言不变。
- 新增用例 `它应该在 gap 配置下让相邻项产生等距间隔`：
  - 构造 `count=5, estimateSize=() => 10, gap=4, paddingStart=6, paddingEnd=3`。
  - 断言 `getItem(0).start === 6`、`getItem(1).start === 20`、`getItem(2).start === 34`。
  - 断言 `getSnapshot().totalSize === 6 + 10*5 + 4*4 + 3 === 75`。
- 新增用例 `notify 在无变化时不应重复推送`：
  - 构造 `count=3, estimateSize=() => 20`，先 `setViewport(60)`。
  - `subscribe` 收集 snapshot，记录初始条数 N。
  - 连续两次 `setOffset(0)`；断言订阅推送次数仍为 N（即一次都没有新增）。

### 6. 文档同步

#### 6.1 `docs/content/packages/fe/virtualizer.md`

- `VirtualizerOptions` 代码块：
  - 移除 `onChange?: (snapshot: VirtualSnapshot) => void` 行。
  - 在 `estimateSize` 行下新增 `gap?: number`。
- 「常用实例方法」代码块：当前不包含被移除的方法，保持原样；核对是否使用 `onChange` 描述并清理。
- 「Vue 封装建议」列表：将 "使用 `subscribe` 或 `onChange` 把快照同步到 `ref`" 改为 "使用 `subscribe` 把快照同步到 `ref`"。
- 在「构造参数」段落下方补一小段说明 `gap` 的语义（与 CSS gap 一致，只作用于相邻项）。

#### 6.2 `docs/examples/fe/virtualizer/basic.vue`

- 核对当前示例没有使用 `onChange` / `resizeItem` / `getItems` / `getRange` / `getTotalSize`；若已未使用则**不改**；若发现使用则改为 `subscribe` / `measure` / `getSnapshot`。

#### 6.3 `skills/cat-kit-fe`

- `references/virtualizer.md` 保持不动（只索引 typings）。
- `generated/virtualizer/index.d.ts` 由脚本重建，在 implement 阶段运行 `bun run sync-cat-kit-skills-api:build` 刷新。

### 7. Changeset 录入

- 在仓库根执行 `bun run changeset`，创建条目：
  - 范围：`@cat-kit/fe`
  - bump：`minor`（fixed 组内破坏性小改 + 新增能力，按现有 0.x 规则）
  - 描述：中文概述四点变更（gap 配置 / API 精简 / 性能优化 / 注释增强），并明确列出被移除的 API 名称。

### 8. 自检

- `bun --cwd packages/fe run test ./test/virtualizer.test.ts` 全部通过。
- `bunx oxlint packages/fe/src/virtualizer/index.ts packages/fe/test/virtualizer.test.ts` 无新增告警。
- `bunx oxfmt --write packages/fe/src/virtualizer/index.ts packages/fe/test/virtualizer.test.ts docs/content/packages/fe/virtualizer.md`
- `bun --cwd packages/fe run build` 通过，生成的 `dist/*.d.ts` 无 `onChange` / `resizeItem` / `getItems` / `getRange` / `getTotalSize`。

## 影响范围

- `packages/fe/src/virtualizer/index.ts`：新增 `gap` 字段与 `private gap` 属性；移除 `onChange`、`resizeItem`、`getItems`、`getRange` 公共 API；`getTotalSize` 降级为 private；新增 `applyMeasurement`、`markScrollEnd`、`handleScrollEnd`、`isEquivalentSnapshot`、`scrollEndListenerAttached`；`mount`/`unmount` 支持 `scrollend` 事件；`setCount` 改为增量失效；`paddingEnd` 变更不再触发全量失效；为接口字段与公共方法补充中文 JSDoc。
- `packages/fe/test/virtualizer.test.ts`：将旧 `getTotalSize()` / `getItems()` 调用替换为 `getSnapshot().totalSize` / `getSnapshot().items`；新增 `gap` 布局用例与 `notify` 去抖用例。
- `docs/content/packages/fe/virtualizer.md`：`VirtualizerOptions` 代码块移除 `onChange` 行并新增 `gap` 行；补充 `gap` 语义说明；Vue 封装建议中的 `onChange` 改为 `subscribe` 单一入口。
- `skills/cat-kit-fe/generated/virtualizer/index.d.ts`：由 `sync-cat-kit-skills-api:build` 自动重建，与新 `dist/virtualizer/index.d.ts` 保持一致。
- `.changeset/virtualizer-gap-and-slim-api.md`：新增 changeset，`@cat-kit/fe` minor，中文描述四点变更与被移除 API。

## 历史补丁
