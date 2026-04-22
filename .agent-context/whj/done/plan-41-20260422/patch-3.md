# 稳定条纹类替换 nth-of-type 并消除 snapshot 分配抖动

## 补丁内容

用户反馈在 Apple M5 芯片上，表格 demo 滚动 FPS 无法稳定到 120Hz。定位到两个真实瓶颈：

### 瓶颈 1（首要）：`:nth-of-type(even)` 条纹随滚动级联重绘

`docs/examples/fe/virtualizer/table.vue` 原 CSS：

```css
.grid :deep(tbody tr:not(.spacer)) { background: var(--vp-c-bg); }
.grid :deep(tbody tr:not(.spacer):nth-of-type(even)) { background: var(--vp-c-bg-soft); }
```

`:nth-of-type(even)` 按 DOM **兄弟位序**判定，而非数据索引。tbody 结构是 `[beforeSpacer, row_a, row_b, ..., afterSpacer]`；每次滚动触发 `removeChild` / `insertBefore` 都让剩余数据行的兄弟位序整体 ±1，`:nth-of-type(even)` 命中集合整体翻转，浏览器被迫对所有可见行**重算样式并重绘所有子 td**。

在 20 列 × 约 20 行的可见区下，一次滚动位移放大为 ~400 个 td 背景色切换的 paint 工作，在 120Hz（每帧 ~8.3ms）预算下极易抖掉。这是 M5 上掉帧的首要原因。

**修复**：条纹改用**基于数据索引**的稳定类：

- `ensureRow(index)` 在创建 `<tr>` 时按 `index & 1` 打 `row-stripe` 类；节点缓存一次创建永不变更。
- CSS 改为匹配该稳定类：`.grid :deep(tbody tr.row-stripe) { background: var(--vp-c-bg-soft); }`。

滚动中只有真正新增/移除的几行会 paint，其余行样式完全不动。

### 瓶颈 2（次要）：recompute 纯 offset 变化路径每帧分配新 snapshot

`Virtualizer.recompute()` 在「结构未变、仅 offset/isScrolling 变化」分支里原本做 `this.snapshot = { ...this.snapshot, offset, isScrolling }`。该分支不 notify 订阅者，只是更新 `getSnapshot()` 的读视图；但在高刷滚动下每秒可能被调用上百次，持续制造 GC 压力。

**修复**：就地赋值 `this.snapshot.offset` / `this.snapshot.isScrolling`。因为该分支不 notify，订阅者不会看到中间态；`getSnapshot()` 的读者本就期望「最新一次计算结果」，语义等价，分配压力归零。

### 测试与文档

- `packages/fe/test/virtualizer.test.ts` 新增一条「纯 offset 变化时 snapshot 引用保持稳定」的断言，锁住上面的优化行为。全部 15 条测试通过。
- `docs/content/packages/fe/virtualizer.md`：在表格示例说明里新增一条强制约束——虚拟列表的条纹必须用数据索引稳定类，不得用 `:nth-of-type` / `:nth-child`。
- `skills/cat-kit-fe/references/virtualizer.md`：同步补充「禁止位置相关伪类条纹」和「`getSnapshot()` 引用稳定性」两条最佳实践。

### 验证

- `bun --filter @cat-kit/fe test virtualizer` → 15/15 通过。
- `bunx oxlint` 三个变更源文件 → 0 warnings / 0 errors。
- `bunx oxfmt --check` → 已格式化。

运行时 FPS 复测需要在实际浏览器中点「暴力滚动 × 50」观测，受宿主环境影响不在纯自动化验证范围内。

## 影响范围

- 修改文件: `/Users/whj/codes/cat-kit/docs/examples/fe/virtualizer/table.vue`
- 修改文件: `/Users/whj/codes/cat-kit/packages/fe/src/virtualizer/index.ts`
- 修改文件: `/Users/whj/codes/cat-kit/packages/fe/test/virtualizer.test.ts`
- 修改文件: `/Users/whj/codes/cat-kit/docs/content/packages/fe/virtualizer.md`
- 修改文件: `/Users/whj/codes/cat-kit/skills/cat-kit-fe/references/virtualizer.md`
