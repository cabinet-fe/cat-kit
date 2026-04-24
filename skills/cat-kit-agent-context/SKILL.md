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

[`generated/`](generated/) 下 **`.d.ts`** 与 npm `dist` 一致；发布物里的 ESM JavaScript 文件统一使用 `.js` 后缀，其中 Skill 安装依赖的上下文脚本会发布在 `dist/skill/scripts/get-context-info.js`。

**运行环境**：Node.js（CLI / 工具链）。

## Skill 产物约定

`agent-context install` 生成的 `ac-workflow` 对齐 Agent Skills 渐进式披露：

- `SKILL.md` 是短导航入口，负责触发、上下文脚本、`agent-context validate` 和状态路由
- 完整协议正文位于 `references/*.md`，确定动作后只读取对应文件
- 准备调用提问工具时再读取 `references/ask-user-question.md`
- 上下文状态与编号来自 `scripts/get-context-info.js` 输出，不让代理自行扫描目录推断
- `description` 需要避免普通 coding、code review、planning 或单纯 `AGENTS.md` 修改误触发

## 更多

- [references/workspace.md](references/workspace.md)
- [examples.md](examples.md)
