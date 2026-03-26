# Skill 内容适配 SCOPE 目录结构

## 补丁内容

plan-8 引入了 SCOPE 目录隔离，实际目录结构变为 `.agent-context/{scope}/plan-{N}/`，但 `content/index.ts` 和 `content/actions.ts` 中生成的 Skill 内容仍引用旧的无 scope 路径（如 `.agent-context/plan-{number}/`）。导致 `sync` 命令无法检测到 Skill 需要更新。

修改内容：

- `content/index.ts`：目录结构图增加 `.env`、`.gitignore`、`{scope}/` 层级；全局约束中的当前计划路径补充 `{scope}/`；编号规则说明限定在 scope 内。
- `content/actions.ts`：`renderPlan` 中计划写入路径和多计划拆分路径补充 `{scope}/`；`renderReplan` 中默认作用域路径和禁止重写提示补充 `{scope}/`；`renderImplement` 中当前计划路径补充 `{scope}/`。

## 影响范围

- 修改文件: `packages/agent-context/src/content/index.ts`
- 修改文件: `packages/agent-context/src/content/actions.ts`
