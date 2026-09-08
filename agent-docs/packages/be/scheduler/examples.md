---
title: "@cat-kit/be 定时任务编排场景"
description: 用 @cat-kit/be 的 Scheduler 与 CronExpression 为后台服务编排定时任务：Cron 备份、周期心跳、启动预热、任务取消与优雅停机。
aliases: [定时任务编排, 后台任务, cron 场景, 任务调度示例]
keywords: [Scheduler, schedule, once, interval, cancel, start, stop, getTasks, CronExpression, parseCron, getNextDate, Cron 表达式, 定时备份, 心跳, 预热, 优雅停机, 任务查询]
---

# @cat-kit/be 定时任务编排场景

本方案用 `@cat-kit/be` 的 `Scheduler` 为一个后台服务编排三类定时任务——按 Cron 触发的夜间备份、固定间隔的心跳上报、启动后一次性的缓存预热——并用 `getTasks` 做运行观测、用 `cancel` 与 `stop` 实现优雅停机。Cron 触发时刻用 `parseCron(...).getNextDate()` 提前展示。

## 场景

- 何时用本方案：单个 Node.js 进程内需要多个定时任务，统一启停、可查询状态、任务体是异步函数。
- 何时不用：需要任务持久化（进程重启后接续执行）、分布式锁或失败重试策略时，本模块只做进程内触发，改用带存储的任务队列；只查 Cron 下次执行时间而不跑任务时直接用 `parseCron`，见 `packages/be/scheduler/apis.md`。

## 完整示例

```ts
// src/jobs.ts
import { Scheduler, parseCron } from '@cat-kit/be'

interface JobLog {
  id: string
  ranAt: string
}

const jobLog: JobLog[] = []

async function backupDatabase(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 20)) // 模拟备份耗时
  jobLog.push({ id: 'backup', ranAt: new Date().toISOString() })
}

async function main(): Promise<void> {
  // 启动前先向运维展示备份任务的下次触发时刻
  const nextBackup = parseCron('0 2 * * *').getNextDate()
  console.log('next backup at', nextBackup?.toString()) // => 下次 02:00:00 的时间串

  const scheduler = new Scheduler()

  // 1. Cron 任务：每天 02:00 备份；定时器已 unref，不阻止进程退出
  scheduler.schedule('backup', '0 2 * * *', async () => {
    await backupDatabase()
  })

  // 2. 延迟任务：启动 3 秒后预热一次，执行完自动移除
  scheduler.once('warmup', 3_000, () => {
    jobLog.push({ id: 'warmup', ranAt: new Date().toISOString() })
  })

  // 3. 周期任务：每 30 秒心跳；任务内自行捕获错误并上报
  scheduler.interval('heartbeat', 30_000, () => {
    try {
      jobLog.push({ id: 'heartbeat', ranAt: new Date().toISOString() })
    } catch (err) {
      console.error('heartbeat failed', err) // 调度器外兜底，避免依赖 console.error 默认行为
    }
  })

  scheduler.start()
  console.log(scheduler.getTasks().map((t) => t.id)) // => ['backup', 'warmup', 'heartbeat']

  // 4. 优雅停机：Ctrl+C 时先取消心跳，再停掉整个调度器
  process.on('SIGINT', () => {
    scheduler.cancel('heartbeat')
    scheduler.stop()
    console.log('scheduler stopped, jobs ran:', jobLog.map((j) => j.id))
    process.exit(0)
  })
}

void main()
```

运行后约 3 秒：

```bash
bun run src/jobs.ts
# next backup at Tue Jan 02 2024 02:00:00 GMT+0800 (China Standard Time)
# [ 'backup', 'warmup', 'heartbeat' ]
# （3 秒后 warmup 执行并从任务表移除；每 30 秒输出一次心跳）
```

Ctrl+C 退出时输出 `scheduler stopped, jobs ran: [...]`。

## 要点说明

- 三类任务对应三种触发语义：`schedule` 挂日历时刻、`once` 延迟一次、`interval` 固定间隔；一个 `Scheduler` 实例统一 `start` / `stop`。
- `scheduler.start()` 必须显式调用：注册只入表不排程，运行中再注册的任务会立即排程。
- `warmup` 用 `once`：执行完自动从任务表移除，`getTask('warmup')` 随后返回 `undefined`，无需手工清理。
- 心跳任务内部 `try/catch`：调度器对任务异常的默认处理是 `console.error`，要上报监控系统就必须在任务体内自行捕获。
- `SIGINT` 处理里先 `cancel('heartbeat')` 再 `stop()`：`interval` 定时器未 `unref`，不显式清理会阻止 `process.exit` 之外的正常退出路径。

## 注意事项

> [!WARNING]
> - 本库 Cron 任务在「日」与「星期」同时受限时按 AND 匹配；标准 crontab 按 OR——从 crontab 迁移的表达式要逐条核对这两个字段。
> - 本库任务只存在进程内存中：进程退出即全部丢失；`stop()` 保留任务定义，`start()` 后恢复触发，但重启进程后需要重新注册。
> - 本库任务执行不排队：上一次还没跑完时定时器已到点，下一次仍会在当前次结束后按计划触发，`interval` 的下一次从执行结束再计时。
> - 本库 `once` 的 `delay` 为负数、`interval` 的间隔小于等于 `0` 都在注册时抛错；Cron 字符串非法在 `schedule` 注册时抛错。
