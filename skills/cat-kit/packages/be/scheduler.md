# be — 任务调度

## 何时使用

在单个 Node.js 进程内安排 Cron、一次性延迟或固定间隔任务，或只计算 Cron 的下一次时间时使用。

## 如何选择

- `Scheduler.schedule(id, cron, task)`：按 5 段 Cron 表达式运行。
- `Scheduler.once(id, delay, task)`：延迟指定毫秒后运行一次。
- `Scheduler.interval(id, interval, task)`：每隔指定毫秒运行。
- `CronExpression` / `parseCron`：验证表达式并通过 `getNextDate(from?)` 计算下一次时间。
- `start` / `stop` / `cancel` / `getTask(s)`：控制任务并查询状态。

## 最小示例

```ts
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()
scheduler.schedule('cleanup', '0 3 * * *', async () => {
  await cleanupExpiredFiles()
})
scheduler.start()
```

## 约束与边界

- 上例中的实例变量应保持存活；任务添加后仍需调用 `start()`。
- 任务 ID 必须唯一，重复添加会抛错而不是覆盖。`once` 的延迟可为 0，`interval` 必须大于 0。
- Cron 格式固定为“分 时 日 月 周”五段，支持 `*`、`?`、范围、步长和列表；按进程本地时间计算。
- `stop()` 清除计时器但保留任务，可再次 `start()`；`cancel(id)` 才会移除任务。
- 任务抛错会被记录，周期调度继续。此调度器不提供跨进程持久化或分布式锁。

## 精确类型入口

[Scheduler](../../generated/be/scheduler/scheduler.d.ts) · [CronExpression](../../generated/be/scheduler/cron.d.ts)
