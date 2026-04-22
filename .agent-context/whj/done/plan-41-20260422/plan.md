# 优化 Virtualizer 表格示例性能

> 状态: 已执行

## 目标

定位 `@cat-kit/fe` 的 `Virtualizer` 与 `docs/examples/fe/virtualizer/table.vue` 中导致性能低下的真实瓶颈，修复不必要的重算、测量或渲染开销，在不破坏现有 API 语义的前提下提升大表格 demo 的滚动流畅度，并同步补齐测试、文档与技能说明。

## 内容

1. 复查 `packages/fe/src/virtualizer/index.ts`、`docs/examples/fe/virtualizer/table.vue` 及相关测试，定位性能瓶颈属于核心类、示例接入方式，还是两者叠加，并明确需要保持不变的行为边界。
2. 在 `Virtualizer` 核心或示例中实施针对性优化，消除滚动期间不必要的同步布局读取、全量重算、重复通知或高频响应式更新，同时保证可见范围、总尺寸、滚动锚点与测量流程行为正确。
3. 为本次优化补充或更新 `packages/fe/test/virtualizer.test.ts` 中能覆盖回归风险的测试，确保性能相关修正不会引入范围计算、测量去重或通知时机错误。
4. 同步更新 `docs/content/packages/fe/virtualizer.md`、相关 demo 文案，以及 `skills/cat-kit-fe/` 下与 virtualizer 对应的技能内容，使仓库文档与技能说明反映新的性能模型、最佳实践和使用约束。
5. 运行与本次改动直接相关的测试、格式化或静态检查命令，验证修改有效；若存在无法在当前环境完成的验证项，明确记录原因与风险。

## 影响范围

- `packages/fe/src/virtualizer/index.ts`
- `packages/fe/test/virtualizer.test.ts`
- `docs/examples/fe/virtualizer/table.vue`
- `docs/content/packages/fe/virtualizer.md`
- `skills/cat-kit-fe/references/virtualizer.md`

## 历史补丁

- patch-1: 平滑 perf 面板并合帧提交虚拟列表快照
- patch-2: 纯 JS 接管 tbody 行节点池，虚拟表格脱离 Vue 响应式渲染
- patch-3: 稳定条纹类替换 nth-of-type 并消除 snapshot 分配抖动
