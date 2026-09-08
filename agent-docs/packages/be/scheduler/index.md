---
title: "@cat-kit/be 调度模块总览"
description: "@cat-kit/be 调度模块总览：CronExpression 解析 5 位 Cron 表达式，Scheduler 统一管理 Cron 任务、一次性延迟任务与周期任务。"
aliases: [scheduler, 任务调度, cron 解析, 定时任务, crontab]
keywords: [Scheduler, CronExpression, parseCron, TaskInfo, TaskFunction, CronFieldConfig, schedule, once, interval, cancel, start, stop, getNextDate, Cron 表达式, 定时任务, 周期任务, 延迟执行, 任务取消]
---

# @cat-kit/be 调度模块总览

调度模块从 `@cat-kit/be` 包根导出类 `CronExpression`（解析 5 位 Cron 表达式并查询下次执行时间）、便捷函数 `parseCron` 与任务调度器 `Scheduler`。`Scheduler` 支持三种任务：`schedule`（Cron 触发）、`once`（延迟一次）、`interval`（固定间隔重复），统一由 `start` / `stop` / `cancel` 控制并用 `getTask` / `getTasks` 查询。

## 安装

```bash
bun add @cat-kit/be
```

调度相关导出从包根导入：

```ts
import { Scheduler, CronExpression, parseCron } from '@cat-kit/be'
```

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `Scheduler` | 任务调度器：注册 Cron / 延迟 / 周期任务，启动、停止、取消与查询 | `packages/be/scheduler/apis.md` |
| `TaskInfo` | 任务运行信息：`id`、`type`、`nextRun?`、`running` | `packages/be/scheduler/apis.md` |
| `TaskFunction` | 任务函数类型 `() => void \| Promise<void>` | `packages/be/scheduler/apis.md` |
| `CronExpression` | 5 位 Cron 表达式解析器：`getNextDate(from?)` 查询下次执行时间 | `packages/be/scheduler/apis.md` |
| `parseCron` | 等价于 `new CronExpression(expression)` 的便捷函数 | `packages/be/scheduler/apis.md` |
| `CronFieldConfig` | Cron 字段取值范围配置 `{ min, max }` | `packages/be/scheduler/apis.md` |

选型规则：按日历时刻触发（每天 2 点、工作日每小时）用 `schedule` + Cron；「N 毫秒后跑一次」用 `once`；「每 N 毫秒跑一次」用 `interval`；只要查询下次执行时间不跑任务，直接用 `parseCron(...).getNextDate()`。完整签名见 `packages/be/scheduler/apis.md`，端到端场景见 `packages/be/scheduler/examples.md`。
