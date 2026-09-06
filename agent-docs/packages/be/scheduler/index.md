---
title: "@cat-kit/be 任务调度"
description: "Cron 表达式解析、延迟执行与周期任务调度"
keywords:
  - CronExpression
  - parseCron
  - Scheduler
  - schedule
  - once
  - interval
  - Cron 表达式
  - 周期任务
  - 延迟执行
  - 定时任务
aliases:
  - cron 解析
  - 任务调度器
  - crontab
  - 定时器
---

# 任务调度

调度模块提供 Cron 解析（`CronExpression`、`parseCron`）与任务调度器 `Scheduler`：支持 Cron 表达式任务（`schedule`）、一次性延迟任务（`once`）与周期任务（`interval`），统一启动、停止、取消与查询。

详情见 [API](apis.md) 与 [示例](examples.md)。

## 注意事项

- Cron 表达式为标准五段：`分钟 小时 日 月 星期`，按本地时区计算；日与周字段需同时匹配；支持范围、步长与列表
- `getNextDate` 最多向前搜索 100_000 分钟，找不到返回 `null`
- 任务 ID 必须唯一，重复注册会报错；任务异常会被 `console.error` 捕获并继续，不会重抛
- `stop()` 停止调度但保留任务，可 `start()` 恢复；已开始执行中的任务不会被 `stop()` 或 `cancel()` 中断

## 类型定义

- `CronExpression`、`parseCron`、`CronFieldConfig`
- `Scheduler`、`TaskInfo`、`TaskFunction`
