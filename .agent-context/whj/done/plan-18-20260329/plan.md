# 提取 actions.ts 协议模板到独立文件

> 状态: 已执行

## 目标

将 `packages/agent-context/src/content/actions.ts` 中 6 个 `render*` 函数提取到 `actions/` 子目录的独立文件中，使每个协议模板可独立维护，同时保持对外导出接口不变。

## 内容

1. 在 `packages/agent-context/src/content/` 下创建 `actions/` 目录。
2. 将 6 个 render 函数分别提取到对应文件中：
   - `actions/init.ts` → `renderInit()`
   - `actions/plan.ts` → `renderPlan()`
   - `actions/replan.ts` → `renderReplan()`
   - `actions/implement.ts` → `renderImplement()`
   - `actions/patch.ts` → `renderPatch()`
   - `actions/rush.ts` → `renderRush()`
3. 创建 `actions/index.ts` 作为聚合入口，导出 `ACTION_NAMES` 和 `ACTION_RENDERERS`（与原 `actions.ts` 的导出签名完全一致）。
4. 删除原 `actions.ts` 文件。
5. 更新 `index.ts` 中的导入路径：`'./actions.js'` → `'./actions/index.js'`（`moduleResolution: "bundler"` 下带 `.js` 后缀的路径不会触发目录索引解析）。
6. 运行类型检查与构建，确保无错误。

## 影响范围

- 修改文件: `packages/agent-context/src/content/index.ts`
- 修改文件: `packages/agent-context/src/content/actions/init.ts`
- 修改文件: `packages/agent-context/src/content/actions/plan.ts`
- 修改文件: `packages/agent-context/src/content/actions/replan.ts`
- 修改文件: `packages/agent-context/src/content/actions/implement.ts`
- 修改文件: `packages/agent-context/src/content/actions/patch.ts`
- 修改文件: `packages/agent-context/src/content/actions/rush.ts`
- 删除文件: `packages/agent-context/src/content/actions.ts`
- 新增文件: `packages/agent-context/src/content/actions/index.ts`
- 新增文件: `packages/agent-context/src/content/actions/init.ts`
- 新增文件: `packages/agent-context/src/content/actions/plan.ts`
- 新增文件: `packages/agent-context/src/content/actions/replan.ts`
- 新增文件: `packages/agent-context/src/content/actions/implement.ts`
- 新增文件: `packages/agent-context/src/content/actions/patch.ts`
- 新增文件: `packages/agent-context/src/content/actions/rush.ts`
- 修改文件: `packages/agent-context/src/content/index.ts`

## 历史补丁

- patch-1: AskUserQuestion 模板集中定义
- patch-2: AskUserQuestion 从预定义模板改为动态生成规范
