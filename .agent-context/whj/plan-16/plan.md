# 优化 agent-context SKILL init 并验证工作流

> 状态: 已执行

## 目标

解决从零开始项目时 init 流程有时不询问架构和技术栈偏好的问题，并对整体工作流（SKILL）进行全面检查验证，确保各 action 文件清晰、可执行、逻辑一致。

## 内容

### 阶段一：优化 init.md

1. **定位问题根因**：读取现有 `init.md`，分析"已从描述中获取的可跳过"条件导致跳过架构/技术栈提问的场景。

2. **修改 init.md（新项目分支）**：
   - 将「技术栈与版本」「架构偏好（目录结构、模式、框架选型）」设为**新项目必问项**，明确标注不可因描述部分涵盖而整体跳过
   - 区分"可基于描述补充"（无需从零问）和"必须主动确认"（架构/技术栈决策）
   - 增加示例引导：说明哪些问题属于高价值决策类，必须在计划前澄清

3. **同步所有平台 SKILL 文件**：更新以下路径下的 `actions/init.md`（当前均为 `M` 状态，与根版本保持一致）：
   - `.agent/skills/ac-workflow/actions/init.md`
   - `.codex/skills/ac-workflow/actions/init.md`
   - `.cursor/skills/ac-workflow/actions/init.md`
   - `.claude/skills/ac-workflow/actions/init.md`

### 阶段二：整体工作流验证

4. **逐一审查 action 文件**（init / plan / replan / implement / patch / rush）：
   - 步骤描述是否足够明确，agent 可无歧义执行？
   - 前置检查是否覆盖关键边界条件？
   - 各 action 之间的状态衔接是否一致？

5. **同步修复发现的问题**：对审查中发现的描述不清、步骤缺失、歧义较大的地方进行优化，同步到所有平台版本。

6. **输出验证报告**：总结修改内容，说明各 action 的质量状态，标注遗留风险（如有）。

## 影响范围

- `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/SKILL.md`
- `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/actions/init.md`
- `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/actions/patch.md`
- `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/actions/rush.md`
- `/Users/whj/Codes/cat-kit/.agent/skills/ac-workflow/SKILL.md`
- `/Users/whj/Codes/cat-kit/.agent/skills/ac-workflow/actions/init.md`
- `/Users/whj/Codes/cat-kit/.agent/skills/ac-workflow/actions/patch.md`
- `/Users/whj/Codes/cat-kit/.agent/skills/ac-workflow/actions/rush.md`
- `/Users/whj/Codes/cat-kit/.cursor/skills/ac-workflow/SKILL.md`
- `/Users/whj/Codes/cat-kit/.cursor/skills/ac-workflow/actions/init.md`
- `/Users/whj/Codes/cat-kit/.cursor/skills/ac-workflow/actions/patch.md`
- `/Users/whj/Codes/cat-kit/.cursor/skills/ac-workflow/actions/rush.md`
- `/Users/whj/Codes/cat-kit/.claude/skills/ac-workflow/SKILL.md`
- `/Users/whj/Codes/cat-kit/.claude/skills/ac-workflow/actions/init.md`
- `/Users/whj/Codes/cat-kit/.claude/skills/ac-workflow/actions/patch.md`
- `/Users/whj/Codes/cat-kit/.claude/skills/ac-workflow/actions/rush.md`
- `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/install.ts`
- `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/sync.ts`
- `/Users/whj/Codes/cat-kit/packages/agent-context/src/content/actions.ts`
- `/Users/whj/Codes/cat-kit/packages/agent-context/src/content/index.ts`
- `/Users/whj/Codes/cat-kit/packages/agent-context/src/context/indexer.ts`
- `/Users/whj/Codes/cat-kit/packages/tests/agent-context/content.test.ts`

## 历史补丁
- patch-1: 回填 agent-context Skill 模板源并补回归验证
