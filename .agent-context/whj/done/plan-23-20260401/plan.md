# plan 协议增加完成后 review 询问

> 状态: 已执行

## 目标

在 plan 协议的执行步骤末尾增加一步 AskUserQuestion，计划创建完成后询问用户是否立即进行 review。因 review 由独立子代理执行，无需新建会话或清除上下文。

## 内容

1. 在 `.agents/skills/ac-workflow/actions/plan.md` 的执行步骤第 5 步（自检）之后，新增第 6 步：通过 AskUserQuestion 询问用户是否对刚创建的计划进行 review，选项包含：1) 立即 review（推荐）2) 跳过 review。附注说明 review 由独立子代理执行，不影响当前上下文。

## 影响范围

- `.agents/skills/ac-workflow/actions/plan.md`

## 历史补丁
