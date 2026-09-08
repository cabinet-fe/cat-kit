---
title: "@cat-kit/be 调度 API（Scheduler CronExpression）"
description: "@cat-kit/be 调度模块 API 参考：Scheduler 注册 Cron / 延迟 / 周期任务并统一启停取消，CronExpression 与 parseCron 解析 5 位 Cron 表达式并查询下次执行时间。"
aliases: [调度 API, cron API, 定时任务 API, node-cron]
keywords: [Scheduler, CronExpression, parseCron, TaskInfo, TaskFunction, CronFieldConfig, schedule, once, interval, cancel, stop, getTask, getTasks, getNextDate, Cron 表达式, 定时任务, 周期任务, 延迟执行, 任务取消, Cron value out of range]
---

# @cat-kit/be 调度 API（Scheduler CronExpression）

`@cat-kit/be` 导出调度器类 `Scheduler`、Cron 解析器类 `CronExpression` 与便捷函数 `parseCron`。`Scheduler` 的注册与启停方法均为同步；任务函数支持同步或返回 `Promise`，任务体抛出的错误由调度器捕获并 `console.error`。

## 快速上手

```ts
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

// 每 30 秒执行一次
scheduler.interval('heartbeat', 30_000, () => {
  console.log('heartbeat')
})

scheduler.start() // 必须调用，否则任务不会执行
// 进程退出前：
scheduler.stop()
```

## API 签名

```ts
export type TaskFunction = () => void | Promise<void>

export interface TaskInfo {
  /** 任务 ID，注册时指定 */
  id: string
  /** 任务类型 */
  type: 'cron' | 'timeout' | 'interval'
  /** 下次执行时间；cron 任务找不到下次执行时间时缺省 */
  nextRun?: Date
  /** 任务函数是否正在执行 */
  running: boolean
}

export interface CronFieldConfig {
  /** 字段最小值 */
  min: number
  /** 字段最大值 */
  max: number
}

/**
 * 5 位 Cron 表达式解析器：分钟 小时 日 月 星期。
 * 支持字段：* 或 ?（任意值）、a-b（范围）、a/b（步长）、逗号列表、组合如 '9-17/2'。
 * 星期 0~6，0 为周日；表达式按本地时区求值。
 */
export class CronExpression {
  /** 非法表达式抛 Error：段数不为 5 抛 'Cron expression must have 5 parts' */
  constructor(expression: string)
  /** 从 from（默认当前时间）之后的下一分钟起逐分钟搜索，最多 100000 分钟 */
  getNextDate(from?: Date): Date | null
}

/** 等价于 new CronExpression(expression) */
export function parseCron(expression: string): CronExpression

export class Scheduler {
  /**
   * 注册 Cron 任务。id 重复抛 Error(`Task "id" already exists`)
   * cron 传字符串或 CronExpression 实例
   */
  schedule(id: string, cron: string | CronExpression, task: TaskFunction): void
  /** 注册延迟任务，delay 毫秒后执行一次并自动移除；delay < 0 抛 Error */
  once(id: string, delay: number, task: TaskFunction): void
  /** 注册周期任务，每 interval 毫秒执行；interval <= 0 抛 Error */
  interval(id: string, interval: number, task: TaskFunction): void
  /** 取消并移除任务；任务存在返回 true，否则 false */
  cancel(id: string): boolean
  /** 启动调度器；已在运行时调用为空操作 */
  start(): void
  /** 停止全部定时器；任务定义保留，可再次 start */
  stop(): void
  /** 查询单个任务信息；不存在返回 undefined */
  getTask(id: string): TaskInfo | undefined
  /** 查询全部任务信息 */
  getTasks(): TaskInfo[]
}
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `id` | `string` | — | 是 | 全局唯一；重复注册抛 `Error('Task "id" already exists')` |
| `cron` | `string \| CronExpression` | — | 是 | 字符串必须是 5 段；字段取值：分钟 0~59、小时 0~23、日 1~31、月 1~12、星期 0~6 |
| `delay` | `number` | — | 是 | 毫秒；负数抛 `Error('Delay must be greater than or equal to 0')` |
| `interval` | `number` | — | 是 | 毫秒；小于等于 0 抛 `Error('Interval must be greater than 0')` |
| `task` | `TaskFunction` | — | 是 | 同步函数或返回 `Promise` 的异步函数 |
| `from` | `Date` | `new Date()` | 否 | 搜索起点，秒与毫秒清零后从下一分钟开始 |
| `expression` | `string` | — | 是 | 5 段 Cron；解析失败抛 `Invalid cron step` / `Invalid cron range` / `Cron range start greater than end` / `Invalid cron value` / `Cron value out of range: a-b` 系列错误 |

## 方法与事件

`Scheduler` 方法均为同步，返回值见签名；任务执行行为：

- 任务触发时 `running` 置 `true`，函数（含 `await`）结束后置回 `false`
- 任务函数抛错或 Promise reject：被调度器捕获，输出 `Scheduler task "id" failed` 到 `console.error`，调度继续
- `schedule` 的 Cron 任务：每次执行完立即规划下一次；定时器已 `unref`，不阻止进程退出
- `once` 任务：执行完自动从任务表移除；`nextRun` 为注册或启动时刻加 `delay`
- `interval` 任务：执行完且调度器仍在运行才规划下一次；任务执行时间超过 `interval` 时下一次从执行结束后再等 `interval`
- `stop()` 后 `start()`：Cron 任务从当前时间重新规划；未执行的 `once` 任务重新等完整 `delay`；`interval` 任务重新等完整间隔
- `CronExpression.getNextDate(from)`：返回值秒与毫秒为 `0`；搜索满 100000 分钟（约 69 天）无匹配返回 `null`

## 典型示例

### 查询 Cron 下次执行时间

```ts
import { parseCron } from '@cat-kit/be'

// 每天凌晨 2 点
const nightly = parseCron('0 2 * * *')
const next = nightly.getNextDate(new Date('2024-01-01T10:30:00'))
console.log(next?.getHours(), next?.getMinutes()) // => 2 0（次日凌晨 2:00）

// 工作日每 15 分钟
const workday = parseCron('*/15 9-17 * * 1-5')
const nextWorkdayRun = workday.getNextDate(new Date('2024-01-01T08:50:00'))
console.log(nextWorkdayRun?.getDay()) // => 1（2024-01-01 是周一，09:00 首次命中）

// 非法表达式：超过字段范围
try {
  parseCron('61 * * * *')
} catch (err) {
  console.log((err as Error).message) // => 'Cron value out of range: 61-61'
}
```

### 三类任务混合编排

```ts
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

// 每天凌晨 2 点备份
scheduler.schedule('nightly-backup', '0 2 * * *', async () => {
  await runBackup()
})

// 启动 5 秒后预热一次
scheduler.once('warmup', 5_000, () => {
  console.log('cache warmed')
})

// 每 60 秒心跳
scheduler.interval('heartbeat', 60_000, () => {
  console.log('heartbeat')
})

async function runBackup(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 10))
}

scheduler.start()
console.log(scheduler.getTasks().map((t) => t.id)) // => ['nightly-backup', 'warmup', 'heartbeat']
```

### 取消任务与查询状态

```ts
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()
scheduler.interval('report', 10_000, () => console.log('report'))
scheduler.start()

const info = scheduler.getTask('report')
console.log(info?.type) // => 'interval'
console.log(info?.running) // => false（尚未触发）

console.log(scheduler.cancel('report')) // => true，任务被移除
console.log(scheduler.cancel('report')) // => false，已不存在

console.log(scheduler.getTask('missing')) // => undefined
scheduler.stop()
```

## 注意事项

> [!WARNING]
> - 本库 Cron 的「日」与「星期」同时受限时要求两者都匹配（AND）；标准 crontab 在两者都受限时是「任一匹配」（OR）。要表达「13 号或周五」须拆成两个任务。
> - 本库 Cron 任务（`schedule`）的定时器已 `unref`，不阻止进程退出；`once` 与 `interval` 任务的定时器未 `unref`，会阻止进程退出。
> - 本库任务函数抛错不会向上冒泡也不会终止调度，错误走 `console.error`；要接入错误上报需在任务函数内部自行 `try/catch`。
> - 本库 `once` 任务执行完毕后自动从任务表移除，`getTask` 返回 `undefined`；`stop()`/`start()` 不会让它再执行一次。
> - 本库 `getTasks()` 返回的 `nextRun` 是规划时刻的快照；`stop()` 后 `nextRun` 保留旧值，`running` 只反映「正在执行」。
> - 本库 Cron 表达式是 5 位（分钟 小时 日 月 星期），不是 6 位含秒的 Quartz 格式。

## 常见问题

### 报错 `Task "backup" already exists`

原因：同一 `Scheduler` 实例上用相同 `id` 重复注册。修复：换 `id`，或先 `cancel` 旧任务再注册。

```ts
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()
scheduler.interval('backup', 60_000, () => console.log('run'))

scheduler.cancel('backup')
scheduler.interval('backup', 30_000, () => console.log('run with new interval')) // 正常注册
scheduler.start()
scheduler.stop()
```

### 报错 `Cron expression must have 5 parts`

原因：表达式不是 5 段，常见于把 Quartz 的 6 位表达式（多一个秒位）直接传入。修复：去掉秒位。

```ts
import { parseCron } from '@cat-kit/be'

// 错误：'0 0 2 * * *'（6 段）
const cron = parseCron('0 2 * * *') // 每天 02:00
console.log(cron.getNextDate() !== null) // => true
```
