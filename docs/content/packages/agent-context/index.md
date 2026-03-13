---
title: Agent Context
description: '@cat-kit/agent-context 为 AI 编程助手安装统一的 ac-workflow Skill'
outline: deep
---

# Agent Context

`@cat-kit/agent-context` 用来把 `ac-workflow` 安装到不同 AI 工具中，让它们围绕同一份 `.agent-context/` 计划目录协作。

它适合需要多轮执行、阶段切换和归档留痕的任务。CLI 负责安装与校验，Skill 负责识别 `init / plan / replan / implement / patch / rush / done` 这些动作。

## 生命周期

```mermaid
flowchart TD
    init[init 初始化上下文]
    plan[plan 创建计划]
    replan[replan 重做未执行计划]
    implement[implement 实施当前计划]
    patch[patch 补增量修改]
    done[done 归档当前计划]
    rush[rush 创建并立即实施]

    init --> plan
    init --> rush
    plan -->|调整未执行计划| replan
    plan -->|直接开始实施| implement
    replan --> implement
    implement -->|追加增量修改| patch
    implement -->|无需补丁，直接完成| done
    patch --> done
    rush -->|单计划快速处理| done
```

## 页面导航

- [Action 说明](./actions)
- [AI 协作场景](./collaboration)
- [CLI 命令](./cli)
