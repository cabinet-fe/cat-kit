# ac-workflow 协议改进

> 状态: 已执行

## 目标

改进 ac-workflow 工作流协议，使其：

1. 影响范围排除 `.agent-context/` 目录下的文件
2. 存在已执行计划时，智能判断新需求与当前计划的关联性，相关则引导 patch，无关则提示先归档

## 内容

1. **actions.ts — 影响范围排除**
   - `renderImplement()` 步骤 5：补充 `.agent-context/` 排除说明
   - `renderPatch()` 步骤 5（回写 plan.md）：补充排除说明
   - `renderRush()` 步骤 4：补充排除说明

2. **actions.ts — 智能消歧**
   - `renderPlan()` 前置检查：将"存在已执行计划→拒绝"改为关联性判断
   - `renderRush()` 前置检查：同上

3. **index.ts — renderNavigator 更新**
   - 消歧 blockquote：改为关联/无关两条分支
   - 全局约束：新增影响范围排除约束

4. **SKILL.md — 同步更新已安装版本**

## 影响范围

- 修改文件: `packages/agent-context/src/content/actions.ts`
- 修改文件: `packages/agent-context/src/content/index.ts`
- 修改文件: `.cursor/skills/ac-workflow/SKILL.md`
- 修改文件: `.cursor/skills/ac-workflow/actions/rush.md`
- 修改文件: `.agent/skills/ac-workflow/actions/rush.md`

## 历史补丁

- patch-1: 优化 rush 执行步骤结构
- patch-2: 增加执行纪律约束
