# 任务调度

任务调度模块提供了 Cron 表达式解析和任务调度器功能。

## Cron 表达式

### parseCron

解析 Cron 表达式，创建可计算下一次执行时间的 CronExpression 实例。

```typescript
import { parseCron } from '@cat-kit/be'

// 解析 Cron 表达式
const cron = parseCron('0 0 * * *') // 每天凌晨执行

// 计算下一次执行时间
const nextRun = cron.getNextDate()
console.log('下次执行时间:', nextRun)

// 从指定时间开始计算
const nextRun = cron.getNextDate(new Date('2024-01-01'))
```

#### API

```typescript
function parseCron(expression: string): CronExpression
```

**Cron 表达式格式：**

```
分钟 小时 日 月 星期
 0    0   *  *   *
```

**字段说明：**

- **分钟** (0-59)
- **小时** (0-23)
- **日** (1-31)
- **月** (1-12)
- **星期** (0-6, 0 表示星期日)

**支持的语法：**

- `*` - 匹配所有值
- `?` - 不指定值（仅用于日和星期字段）
- `,` - 列表值，如 `1,3,5`
- `-` - 范围值，如 `1-5`
- `/` - 步长值，如 `*/5` 或 `1-10/2`

**示例：**

```typescript
// 每分钟执行
parseCron('* * * * *')

// 每小时的第 0 分钟执行
parseCron('0 * * * *')

// 每天凌晨执行
parseCron('0 0 * * *')

// 每周一凌晨执行
parseCron('0 0 * * 1')

// 每 5 分钟执行
parseCron('*/5 * * * *')

// 工作日上午 9 点执行
parseCron('0 9 * * 1-5')

// 每月 1 号凌晨执行
parseCron('0 0 1 * *')
```

### CronExpression

Cron 表达式实例，可以计算下一次执行时间。

```typescript
import { parseCron } from '@cat-kit/be'

const cron = parseCron('0 0 * * *')

// 获取下一次执行时间
const nextRun = cron.getNextDate()
if (nextRun) {
  console.log('下次执行:', nextRun)
} else {
  console.log('没有下一次执行时间')
}

// 从指定时间开始计算
const nextRun = cron.getNextDate(new Date('2024-01-01'))
```

#### API

```typescript
class CronExpression {
  constructor(expression: string)
  getNextDate(from?: Date): Date | null
}
```

**方法：**

- `getNextDate(from?)` - 计算下一次执行时间
  - `from` - 起始时间，默认当前时间
  - 返回下一次执行时间，如果无法计算则返回 `null`

## 任务调度器

### Scheduler

任务调度器类，支持 Cron 任务、延迟任务和定时任务。

```typescript
import { Scheduler } from '@cat-kit/be'

// 创建调度器
const scheduler = new Scheduler()

// Cron 任务（每天凌晨执行）
scheduler.schedule('daily-cleanup', '0 0 * * *', async () => {
  console.log('执行每日清理任务')
})

// 延迟执行（5秒后执行一次）
scheduler.once('delayed-task', 5000, () => {
  console.log('延迟任务执行')
})

// 定时执行（每30秒执行一次）
scheduler.interval('heartbeat', 30000, () => {
  console.log('心跳检测')
})

// 启动调度器
scheduler.start()

// 获取任务信息
const task = scheduler.getTask('daily-cleanup')
console.log('下次执行时间:', task?.nextRun)

// 获取所有任务
const tasks = scheduler.getTasks()

// 取消任务
scheduler.cancel('heartbeat')

// 停止调度器
scheduler.stop()
```

#### API

```typescript
class Scheduler {
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

**方法：**

- `schedule(id, cron, task)` - 添加 Cron 任务
- `once(id, delay, task)` - 添加延迟任务（执行一次）
- `interval(id, interval, task)` - 添加定时任务（重复执行）
- `cancel(id)` - 取消任务
- `start()` - 启动调度器
- `stop()` - 停止调度器
- `getTask(id)` - 获取任务信息
- `getTasks()` - 获取所有任务信息

**任务信息：**

```typescript
interface TaskInfo {
  id: string              // 任务 ID
  type: 'cron' | 'timeout' | 'interval' // 任务类型
  nextRun?: Date          // 下次执行时间
  running: boolean        // 是否正在运行
}
```

## 使用示例

### 定时清理任务

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

// 每天凌晨清理临时文件
scheduler.schedule('cleanup-temp', '0 0 * * *', async () => {
  console.log('开始清理临时文件...')
  await cleanupTempFiles()
  console.log('清理完成')
})

// 每小时清理缓存
scheduler.schedule('cleanup-cache', '0 * * * *', async () => {
  await cleanupCache()
})

scheduler.start()
```

### 健康检查

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

// 每 30 秒执行一次健康检查
scheduler.interval('health-check', 30000, async () => {
  const health = await checkHealth()
  if (!health.ok) {
    await sendAlert(health)
  }
})

scheduler.start()
```

### 延迟任务

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

// 5 秒后发送通知
scheduler.once('send-notification', 5000, () => {
  sendNotification('任务已完成')
})

scheduler.start()
```

### 任务管理

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

// 添加任务
scheduler.schedule('task1', '0 * * * *', async () => {
  // 任务逻辑
})

scheduler.start()

// 查看任务状态
const task = scheduler.getTask('task1')
if (task) {
  console.log(`任务 ${task.id} 状态:`)
  console.log(`  类型: ${task.type}`)
  console.log(`  下次执行: ${task.nextRun}`)
  console.log(`  正在运行: ${task.running}`)
}

// 列出所有任务
const tasks = scheduler.getTasks()
console.log(`共有 ${tasks.length} 个任务`)

// 取消任务
scheduler.cancel('task1')

// 停止所有任务
scheduler.stop()
```

### 优雅关闭

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

scheduler.schedule('periodic-task', '*/5 * * * *', async () => {
  // 定期任务
})

scheduler.start()

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('正在停止调度器...')
  scheduler.stop()
  console.log('调度器已停止')
  process.exit(0)
})
```

### 错误处理

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

scheduler.schedule('risky-task', '0 * * * *', async () => {
  try {
    await riskyOperation()
  } catch (error) {
    console.error('任务执行失败:', error)
    // 发送告警
    await sendAlert(error)
  }
})

scheduler.start()
```

### 动态任务管理

```typescript
import { Scheduler, parseCron } from '@cat-kit/be'

const scheduler = new Scheduler()

// 动态添加任务
function addDynamicTask(id: string, cronExpression: string) {
  const cron = parseCron(cronExpression)
  scheduler.schedule(id, cron, async () => {
    console.log(`执行任务: ${id}`)
  })

  if (!scheduler.getTask(id)) {
    scheduler.start()
  }
}

// 添加多个任务
addDynamicTask('task1', '0 0 * * *')
addDynamicTask('task2', '0 12 * * *')
addDynamicTask('task3', '*/30 * * * *')
```

