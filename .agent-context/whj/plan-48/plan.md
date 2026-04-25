# 在 SKILL.md 渲染中暴露 .agent-context 真实目录结构

> 状态: 已执行

## 目标

`packages/agent-context/src/skill/render.ts` 渲染出的 `SKILL.md` 只在硬约束里出现一次 `.agent-context/{scope}/plan-{number}` 字面，未系统说明工作区的真实目录布局，也未区分"创建态"与"归档态"的命名差异。代理在创建当前计划时，常因为看到 `done/plan-N-YYYYMMDD/` 的归档形态而错误模仿，产出 `plan-48-20260425` 之类的瞎名字。

修正目标：让代理读完 SKILL.md 就能明确：

- 当前计划目录名严格等于 `plan-{nextPlanNumber}`，禁止追加日期或任何后缀。
- `preparing/`、`done/`、`index.md` 等目录/文件的实际位置与用途。
- `done/plan-{number}-YYYYMMDD/` 是 `agent-context done` 自动生成的归档形态，禁止手动模仿。

## 内容

1. 修改 `packages/agent-context/src/skill/render.ts`：
   - 在 `renderNavigator()` 的"## 启动步骤"段之后、"## 路由"段之前，插入一段紧凑的"## 目录结构"，列出：
     - 当前计划：`${AC_ROOT_DIR}/{scope}/plan-{number}/`（仅 `plan-{nextPlanNumber}`，禁止追加日期或后缀）。
     - 待执行队列：`${AC_ROOT_DIR}/{scope}/preparing/plan-{number}/`。
     - 已归档：`${AC_ROOT_DIR}/{scope}/done/plan-{number}-YYYYMMDD/`（由 `agent-context done` 自动追加日期，禁止手动创建该形态）。
     - Scope 索引：`${AC_ROOT_DIR}/{scope}/index.md`；工作区配置：`${AC_ROOT_DIR}/.env`。
   - 调整"## 硬约束"中关于"任意时刻最多一个当前计划"的那一行，强化措辞：当前计划目录名严格 `plan-{nextPlanNumber}`，归档目录 `done/plan-{number}-YYYYMMDD` 仅由 `agent-context done` 生成。
   - 严格保证最终 `SKILL.md` 不超过 60 行、不超过 2500 字符（现有测试边界）。

2. 修改 `packages/agent-context/src/skill/protocols/plan.ts` 的"执行步骤"第 3 步，明确：
   - 当前计划目录名严格等于 `plan-{nextPlanNumber}`，preparing 计划目录名严格等于 `plan-{number}`，**禁止追加日期或任何后缀**；`done/` 下的 `plan-{number}-YYYYMMDD` 仅作历史参考，不得作为创建模板。

3. 更新 `packages/agent-context/test/render-skill.test.ts`：
   - 新增一条用例，断言 SKILL.md：
     - 包含"目录结构"段标题。
     - 同时出现 `plan-{number}` 与 `plan-{number}-YYYYMMDD` 字面，并显式提及"禁止"或"自动"以体现两种形态的差异。
     - 显式提及 `preparing` 与 `done`。
   - 复核既有 60 行 / 2500 字符上限断言仍通过。

4. 跑 `pnpm --filter @cat-kit/agent-context test -- render-skill` 确保所有用例通过。

## 影响范围

- 修改文件: `packages/agent-context/src/skill/render.ts`
- 修改文件: `packages/agent-context/src/skill/protocols/plan.ts`
- 修改文件: `packages/agent-context/test/render-skill.test.ts`

## 历史补丁
