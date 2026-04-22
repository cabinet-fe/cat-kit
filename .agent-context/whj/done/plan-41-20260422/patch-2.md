# 纯 JS 接管 tbody 行节点池，虚拟表格脱离 Vue 响应式渲染

## 补丁内容

用户要求在 Vue 场景下最大化减少整个组件树的重新渲染、用 JS 原生 API 触发样式变更，并最大化减少样式变更数量。据此重写 `docs/examples/fe/virtualizer/table.vue`：

1. **tbody 完全脱离 Vue 响应式**：`<tbody ref="tbodyEl" v-once></tbody>` 模板里只渲染一次空节点，由 JS 原生 DOM API 管理前后 spacer + 行节点。`v-once` 显式告诉编译器该节点永不参与 patch，即便父组件其它响应式数据（`targetIndex` 输入框）变更也不会误清空 tbody 子树。
2. **行节点池永久缓存**：每个 `index` 创建一次 `<tr>` + 所有 `<td>` 并把 `textContent` 写死，保存进 `Map<number, HTMLTableRowElement>`；此后该节点永远不会被销毁也不会重写内容，滚动时只做 `insertBefore` / `removeChild` 移动。
3. **最小 DOM 样式变更**：新旧 range 只有「前端头部扩展/收缩」和「尾端尾部扩展/收缩」四类差集，每次 snapshot 最多做 O(overscan) 次 insert/remove；前后 spacer 只更新 `style.height` 两次，样式变更数量与 range 变化量线性相关。
4. **一次性 `measureMany` 全量行高**：因示例行高来自数据层确定值，在 `onMounted` 里直接 `measureMany(rows.map((r, i) => ({ index: i, size: r.height })))`，跳过 ResizeObserver / 逐行测量路径；`perf` 面板的 "已测/总数" 和 "平均行高" 也一次性直写。
5. **Scoped 样式兼容**：JS 创建的 `<tr>` / `<td>` 不带 `data-v-xxx`，将 tbody 内部规则改为 `.grid :deep(tbody ...)` 穿透选择器，保留原视觉样式。
6. **保留 patch-1 的 rAF 合帧与 perf 面板 DOM 直写**：订阅回调仍按 `requestAnimationFrame` 合帧为单次 `applySnapshot`；FPS/minFPS/帧耗时/notify 等指标依旧走 `writePerf` 低频直写，不经由 Vue reactive。

同步更新文档与技能说明：
- `docs/content/packages/fe/virtualizer.md`：重写 demo 说明，记录实测性能（压测期间 CPU ≤5%、FPS 稳定 120、剖面无 Vue patch 热路径），并在 Vue 封装建议里新增「极致性能场景让框架只渲染一次静态骨架」条目。
- `skills/cat-kit-fe/references/virtualizer.md`：补充两条最佳实践 —— 宿主框架只渲染一次静态骨架 + 原生 DOM 增量维护节点池；以及一次性 `measureMany` 的前提条件。

## 实测验证（浏览器调试）

- 页面 `/cat-kit/packages/fe/virtualizer.html` 正常加载；初次 snapshot 后 `已测/总数=2000/2000`，`平均行高=45 px`，证明一次性 measureMany 生效。
- 点击「暴力滚动 × 50」触发 5 秒 top↔bottom 往返压测；在 `browser_profile_start/stop` 采样的 18.12s 窗口里，**96% idle / 4% CPU**；Top self-time 仅剩 `requestAnimationFrame` (native)、`tickFps`、`writePerf` 这些 perf 面板自身开销，**完全没有 Vue render/patch/diff 相关热路径**。
- 压测结束后 FPS 120 / MIN FPS 24（来自初始 DOM 布局阶段）/ 帧耗时 8.3ms / notify 1200；远距离跳转（Top → 末行）和局部滚动均正确渲染，DOM diff 边界逻辑验证通过。

## 影响范围

- 修改文件: `/Users/whj/codes/cat-kit/docs/examples/fe/virtualizer/table.vue`
- 修改文件: `/Users/whj/codes/cat-kit/docs/content/packages/fe/virtualizer.md`
- 修改文件: `/Users/whj/codes/cat-kit/skills/cat-kit-fe/references/virtualizer.md`
