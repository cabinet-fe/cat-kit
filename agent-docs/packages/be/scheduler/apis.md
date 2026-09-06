---
title: "@cat-kit/be 任务调度 API"
description: "CronExpression、parseCron、Scheduler 签名与选项"
keywords:
  - 定时任务
  - Cron 表达式
  - 周期任务
  - 延迟执行
  - 任务取消
  - scheduler
  - 定时器管理
aliases:
  - cron
  - 定时调度
  - setInterval 替代
  - 任务计划
---

# 任务调度 API

调度模块全部类与函数的 TypeScript 签名。

## API 签名

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

## 类型定义

| 类型 | 说明 |
| --- | --- |
| `TaskFunction` | `() => void \| Promise<void>` |
| `TaskInfo` | `id`、`type`（`'cron' \| 'timeout' \| 'interval'`）、`nextRun?`、`running` |
| `once` | `delay` 毫秒后执行一次，小于 0 抛错 |
| `interval` | 每 `interval` 毫秒重复执行，小于等于 0 抛错 |
| `schedule` | 接受 Cron 字符串或 `CronExpression` 实例 |
