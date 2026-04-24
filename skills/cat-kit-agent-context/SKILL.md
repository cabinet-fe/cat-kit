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
- `SKILL.md` 是短导航入口：**一条**启动命令（`node <SKILL_DIR>/scripts/get-context-info.js`，同时完成格式校验）、按状态 + 用户意图查路由表、再读取协议
- 完整协议正文位于 `references/*.md`，确定动作后只读取对应文件
- `references/ask-user-question.md` 含"何时禁止提问"红线与反向追问方法，协议不写死 host 工具名
- `references/_principles.md` 是规划 / 实施 / 审查角色的共享专业素养基线，协议内只引用不重复
- 上下文状态与编号来自 `scripts/get-context-info.js` 输出（JSON + 退出码），代理**禁止自行扫描目录推断**
- `scripts/validate-context.js` 仅在主脚本启动失败时作为独立校验 fallback
- `description` 需要避免普通 coding、code review、planning 或单纯 `AGENTS.md` 修改误触发
- 协议末尾的 `review` 追问使用复杂度阈值触发（影响范围、对外 API、数据库、安全敏感等），不再每次询问
- `rush` 场景下禁止触发强制反向追问；任务若需要反向追问，转走 `plan`
- `agent-context context` / `skill-eval` 提供 CLI 等价接入点；`prompt-gen` 默认生成通用模板，个人偏好走 `--profile whj`

## 更多

- [references/workspace.md](references/workspace.md)
- [examples.md](examples.md)
