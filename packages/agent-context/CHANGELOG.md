# @cat-kit/agent-context

## 2.0.1

### Patch Changes

- 76a074d: 增加实用性
- 33d14d0: Make the generated `ac-workflow` Skill more context-friendly and less noisy:

  - Rewrite `SKILL.md` description with user-intent phrasing (protocol names + negative triggers) and keep it under 500 chars.
  - Collapse startup steps to a single command: `node <SKILL_DIR>/scripts/get-context-info.js` now emits the JSON context **and** performs structure validation inline, exiting non-zero on errors.
  - Add `agent-context context` CLI subcommand as the CLI-side equivalent of the bundled script.
  - Move `ask-user-question.md` and new `_principles.md` out of `render.ts` into `src/skill/references/*.md`; they are copied to `dist` via `tsdown` and read back at render time.
  - `references/ask-user-question.md` now includes an explicit "when NOT to ask" redline and caps consecutive interactive questions.
  - Extract shared professional principles to `references/_principles.md`; `plan` / `implement` / `patch` / `replan` / `review` protocols link to it instead of duplicating.
  - Replace "always ask to review" with complexity-threshold gated prompts in `plan` / `implement` / `patch` / `rush`.
  - `rush` explicitly disables forced reverse interviewing—tasks that need it should go through `plan`.
  - Routing table in `SKILL.md` now exposes `rush` as a valid entry in any plan state (not just `null`).
  - Relax `patch` relatedness pre-check: default to continue, only ask when the user explicitly signals a new unrelated request.

- 5a0d3b6: 优化技能描述, 减少上下文占用

## 2.0.0

### Major Changes

- b0c2948: 修复技能脚本缺失问题

## 1.4.5

### Patch Changes

- 829f71b: 扩展变更

## 1.4.4

### Patch Changes

- 407e248: 更新包构建

## 1.4.3

### Patch Changes

- f3ae461: 优化协议
