---
title: "@cat-kit/be 任务调度示例"
description: "Cron 表达式查询下次执行时间、周期与 Cron 任务调度"
keywords:
  - parseCron
  - Scheduler
  - schedule
  - interval
  - getNextDate
  - Cron 任务
  - 周期调度
  - 内存巡检
aliases:
  - 任务调度示例
  - cron 示例
  - 定时任务示例
  - node-cron
---

# 任务调度示例

典型用法：用 `parseCron` 查询下次执行时间，用 `Scheduler` 注册周期与 Cron 任务并启动。

```ts
import { Scheduler, getMemoryInfo, parseCron } from '@cat-kit/be'

const next = parseCron('*/5 * * * *').getNextDate()
void next

const scheduler = new Scheduler()
scheduler.interval('memory-check', 60_000, () => {
  console.log(getMemoryInfo().usedPercent)
})
scheduler.schedule('nightly', '0 2 * * *', async () => {
  /* ... */
})
scheduler.start()
```

相关文档：[任务调度](index.md)、[任务调度 API](apis.md)、[系统信息](../system/index.md)。
