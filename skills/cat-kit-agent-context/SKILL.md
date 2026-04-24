---
name: cat-kit-agent-context
description: >
  Documents @cat-kit/agent-context CLI, ac-workflow Skill installation output, and workspace metadata. Use when integrating agent-context, syncing installed skills, explaining .agent-context protocols, or checking package constants.
---

# @cat-kit/agent-context

## 安装

```bash
npm add @cat-kit/agent-context
```

## 查证 API

[`generated/`](generated/) 下 **`.d.ts`** 与 npm `dist` 一致；发布物里的 ESM JavaScript 文件统一使用 `.js` 后缀，其中 Skill 安装依赖的脚本会发布在 `dist/skill/scripts/`。

**运行环境**：Node.js（CLI / 工具链）。

## Skill 产物约定

`agent-context install` 生成的 `ac-workflow` 对齐 Agent Skills 渐进式披露：

- 默认只渲染 `.agents/skills/ac-workflow/` 作为 canonical source；`--tools` 只创建可选兼容入口
- 兼容入口优先 symlink / junction 到 canonical source，不支持 symlink 或已有普通目录时按 copy fallback 同步
- `SKILL.md` 是短导航入口，负责触发、上下文脚本、`agent-context validate` 和状态路由
- 完整协议正文位于 `references/*.md`，确定动作后只读取对应文件
- 准备调用交互式提问工具时再读取 `references/ask-user-question.md`，协议不写死 host 工具名
- 上下文状态与编号来自 `scripts/get-context-info.js` 输出，不让代理自行扫描目录推断
- `scripts/validate-context.js` 是全局 CLI / `npx` 都不可用时的 bundled validate fallback
- `description` 需要避免普通 coding、code review、planning 或单纯 `AGENTS.md` 修改误触发
- `agent-context skill-eval` 会读取触发 fixture 并输出 description 长度与 should-trigger / should-not-trigger 覆盖
- `prompt-gen` 默认生成通用模板；个人偏好走 `--profile whj`

## 更多

- [references/workspace.md](references/workspace.md)
- [examples.md](examples.md)
