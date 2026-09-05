---
title: "@cat-kit/be 任务调度 API"
description: "CronExpression、parseCron、Scheduler 签名与选项"
---

# 任务调度 API

调度模块全部类与函数的 TypeScript 签名，类型定义以 `packages/be/dist/scheduler/` 下的声明文件为准。

```ts
declare class CronExpression {
  constructor(expression: string)
  getNextDate(from?: Date): Date | null
}

declare function parseCron(expression: string): CronExpression

declare class Scheduler {
  schedule(id: string, cron: string | CronExpression, task: TaskFunction): void
  once(id: string, delay: number, task: TaskFunction): void
  interval(id: string, interval: number, task: TaskFunction): void
  cancel(id: string): boolean
  start(): void
  stop(): void
  getTask(id: string): TaskInfo | undefined
  getTasks(): TaskInfo[]
}
```

## 关键类型

| 类型 | 说明 |
| --- | --- |
| `TaskFunction` | `() => void \| Promise<void>` |
| `TaskInfo` | `id`、`type`（`'cron' \| 'timeout' \| 'interval'`）、`nextRun?`、`running` |
| `once` | `delay` 毫秒后执行一次，小于 0 抛错 |
| `interval` | 每 `interval` 毫秒重复执行，小于等于 0 抛错 |
| `schedule` | 接受 Cron 字符串或 `CronExpression` 实例 |

## 类型声明

签名与选项的权威定义：[cron.d.ts](../../../../packages/be/dist/scheduler/cron.d.ts)、[scheduler.d.ts](../../../../packages/be/dist/scheduler/scheduler.d.ts)。
