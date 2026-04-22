# 补齐公共 API TSDoc + 文档 / SKILL 逐 API 使用说明

## 补丁内容

plan-42（keyed items + smooth-scroll reconciliation）落地后，对 Virtualizer 的每个公共 API 做系统性的**文档化补齐**。纯注释与文档变更，运行时行为未改变；只走 `@cat-kit/fe: patch` bump。

### 1. 源码：为所有公共 API 补标准 TSDoc

`packages/fe/src/virtualizer/index.ts` 中此前只有 `VirtualizerOptions` 字段级与少量内部辅助有 TSDoc。本补丁为**全部**公共表面补齐符合标准的 TSDoc 块（`@param` / `@returns` / `@throws` / `@remarks` / `@example`）。

#### 类型别名

- `EstimateSize`：说明 index 范围、返回语义、`useMeasuredAverage` 接管时机、无副作用约束
- `VirtualAlign`：列出 `'auto' | 'start' | 'center' | 'end'` 四种对齐的具体行为
- `VirtualizerSubscriber`：明确「结构性变化」的字段集合、纯 offset 不触发的语义
- `GetItemKey`：稳定性约束（禁止 `Math.random()` / 时间戳 / 每次渲染新建引用）

#### 接口字段级注释

- `VirtualItem`：`start` / `end` / `size` 的单位、坐标基准（相对列表内容起点，不含 `paddingStart`）
- `VirtualRange`：不含 `overscan` 的语义，`null` 触发条件
- `VirtualSnapshot`：9 个字段逐条注释 + 顶层「同一引用在纯 offset 帧不变」警告（与 `subscribe` 行为呼应）
- `VirtualScrollOptions`：`align` 仅对 `scrollToIndex` 生效、`scrollToOffset` 按 `start` 语义
- `VirtualMeasurement`：越界静默忽略

#### 类方法（按表面顺序）

全部 17 个公共方法补齐 TSDoc：

| 方法 | 重点补充 |
| --- | --- |
| `constructor` | 不挂载 DOM、`initialOffset` / `initialViewport` 语义、示例 |
| `setOptions` | 同轮更新顺序（`getItemKey` 先于 `count`）、keyed↔non-keyed / keyed→keyed 的缓存清空语义 |
| `setCount` | 收缩 / 扩张 / 无变化三分支行为 |
| `setViewport` | 何时由 RO 自动同步、何时手动调用、offset clamp |
| `setOffset` | 「只更新逻辑 offset 不写 DOM」与 `scrollToOffset` 的区别 |
| `mount` | 传相同 / 不同 / `null` 元素的三种语义、订阅的三类事件源 |
| `unmount` | 不清测量缓存与订阅者、实例可复用 |
| `destroy` | 组件卸载必须调用、销毁后不得再用 |
| `subscribe` | 注册时立即同步调用一次、结构性变化判据、返回取消函数 |
| `measure` | 单条语义、越界静默忽略、与 `measureElement` 的选型 |
| `measureMany` | 批量补偿合并为一次 DOM 写入、首屏优先路径示例 |
| `measureElement` | RO / fallback、`null` 卸载、keyed 模式下 element 迁移 index 的行为 |
| `scrollToOffset` | `align` 无效、`behavior: 'smooth'` rAF 校准、未 mount 行为 |
| `scrollToIndex` | `align` 默认值、`count=0` no-op、smooth 漂移修正、**不要**同步读 `snapshot.offset` |
| `reset` | 不解绑容器、不清订阅者、优先 `getItemKey` 保留测量 |
| `getSnapshot` | 同一对象引用在纯 offset 帧保留不变、禁止 `===` 判重渲染 |
| `getItem` | `RangeError` 抛错条件、业务侧典型使用场景 |

### 2. 文档：`docs/content/packages/fe/virtualizer.md` 改写「API 参考」

原 `## API参考` 下只有三段：`构造参数`（类型块）、`常用实例方法`（几行调用代码）、`快照结构`（类型块）。信息密度低、缺失每个方法的参数 / 返回 / 行为说明。本补丁重写为：

- **构造参数**：保留类型块，增加每字段的 **默认值 + 说明** 表格
- **构造与生命周期**：`new Virtualizer(options?)` / `mount` / `unmount` / `destroy` 每方法一节，含签名、三类分支行为、Vue 生命周期示例
- **选项与尺寸更新**：`setOptions` / `setCount` / `setViewport` / `setOffset` 每方法一节，含同轮更新顺序、扩张 / 收缩分支
- **测量**：`measure` / `measureMany` / `measureElement` 每方法一节，含 RO 路径、首屏批量路径、Vue ref 回调示例
- **滚动**：`scrollToOffset` / `scrollToIndex` 每方法一节，含 behavior 分支 / align 默认值 / smooth 漂移修正 / `snapshot.offset` 行为
- **快照、订阅、读取**：`getSnapshot` / `subscribe` / `getItem` / `reset` 每方法一节，含同一引用稳定性、结构性变化判据、`RangeError`、何时选 `getItemKey` 替代 `reset`
- **快照结构**：保留类型块并逐字段加行内注释；补充「块状布局」渲染建议

### 3. SKILL：`skills/cat-kit-fe/references/virtualizer.md` 新增「公共 API 速查」

skill 原有 `## 使用备注` 是自由形态提示列表（适合 agent 临场查阅），缺少「按 API 名字查签名和关键行为」的入口。本补丁在 `## 使用备注` 之前插入 `## 公共 API 速查`，按 4 个维度分组成表：

1. 构造与生命周期：`new Virtualizer` / `mount` / `unmount` / `destroy`
2. 选项与尺寸更新：`setOptions` / `setCount` / `setViewport` / `setOffset`
3. 测量：`measure` / `measureMany` / `measureElement`
4. 滚动：`scrollToOffset` / `scrollToIndex`
5. 快照、订阅、读取：`getSnapshot` / `subscribe` / `getItem` / `reset`

每条记录 `签名 + 关键行为`（1-2 行），作为 agent 按 API 快速定位行为的入口；详细背景仍保留在 `## 使用备注` 列表中。

### 4. 生成物

`skills/cat-kit-fe/generated/virtualizer/index.d.ts` 与 `skills/cat-kit-fe/generated/index.d.ts` 会随 tsdown 一起把新 TSDoc 带到 `.d.ts` 里；`manifest.json` hash 同步刷新。

### 验证

- `bunx oxfmt --write packages/fe/src/virtualizer` 已格式化（3 个文件）
- `bunx oxlint packages/fe/src/virtualizer` 0 warnings / 0 errors
- `bunx vitest run packages/fe/test/virtualizer.test.ts` 30 条全部通过（纯文档补丁，不新增测试）
- `bun run build --filter=@cat-kit/fe` 构建通过，`dist/virtualizer/index.d.ts` 从 ~11 kB 增长到 21.86 kB（新 TSDoc 内容被 tsdown 完整保留到发布物）
- `bun run sync-cat-kit-skills-api` 已同步 skills 生成物（manifest hash 刷新、d.ts 注释刷新）
- `bunx changeset status` 5 份 changeset 全部解析通过，`@cat-kit/fe` 合并后仍为 minor bump（三份 patch 被 plan-42 的 minor changeset 吸收）

## 影响范围

- 修改：`packages/fe/src/virtualizer/index.ts`
  - 为类型别名 `EstimateSize` / `VirtualAlign` / `VirtualizerSubscriber` / `GetItemKey` 补顶层 TSDoc
  - 为接口 `VirtualItem` / `VirtualRange` / `VirtualSnapshot` / `VirtualScrollOptions` / `VirtualMeasurement` 补接口级与字段级 TSDoc
  - 为 `Virtualizer` 类的 17 个公共方法（含 constructor）补标准 TSDoc（`@param` / `@returns` / `@throws` / `@remarks` / `@example`）
  - 修复 `getItem` 方法在前次补丁中多出的一处结尾多余 `)` 字符
- 修改：`docs/content/packages/fe/virtualizer.md`
  - 「API 参考」章节从「构造参数 + 方法调用代码块 + 快照结构」重写为按职责分组的逐 API 使用说明（6 组、17 个方法）
  - 构造参数新增字段默认值 + 说明表格
  - 快照结构新增字段级行内注释与块状布局渲染建议
- 修改：`skills/cat-kit-fe/references/virtualizer.md`
  - `## 使用备注` 之前新增 `## 公共 API 速查`：按「构造与生命周期 / 选项与尺寸更新 / 测量 / 滚动 / 快照与订阅」5 组成表列出 17 个公共 API 的签名与关键行为
- 同步（由 `bun run sync-cat-kit-skills-api:build` 自动刷新）：
  - `skills/cat-kit-fe/generated/index.d.ts`
  - `skills/cat-kit-fe/generated/virtualizer/index.d.ts`
  - `skills/cat-kit-*/generated/manifest.json`（hash 刷新）
- 新增：`.changeset/virtualizer-public-api-docs.md`（`@cat-kit/fe: patch`）
