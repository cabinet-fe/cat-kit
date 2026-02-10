# 任务调度

## 介绍

本页介绍 `@cat-kit/be` 的任务调度能力，支持 Cron、延时任务与定时任务编排。

## 快速使用

```typescript
import { Scheduler, parseCron } from '@cat-kit/be'

const scheduler = new Scheduler()
const cron = parseCron('*/5 * * * *')

scheduler.schedule('health-check', cron, async () => {
  console.log('running')
})

scheduler.start()
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 概述

任务调度模块包含以下核心组件：

- **Scheduler** - 任务调度器类，统一管理所有任务
- **CronExpression** / **parseCron** - Cron 表达式解析器，支持标准的 5 位 Cron 表达式

**主要特性：**

- ✅ 支持 Cron 表达式任务
- ✅ 支持延迟执行任务（执行一次）
- ✅ 支持定时执行任务（重复执行）
- ✅ 任务查询和管理
- ✅ 任务取消和停止
- ✅ 计算下次执行时间

## Cron 表达式

### parseCron

解析 Cron 表达式，创建可计算下一次执行时间的 `CronExpression` 实例。这是一个便捷函数，等同于 `new CronExpression(expression)`。

**适用场景：**
- 解析和验证 Cron 表达式
- 计算任务的下次执行时间
- 动态创建 Cron 任务

#### 基本用法

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

#### Cron 表达式格式

Cron 表达式由 5 个字段组成，用空格分隔：

```
分钟 小时 日 月 星期
 0    0   *  *   *
```

**字段说明：**

- **分钟** (0-59) - 小时中的分钟
- **小时** (0-23) - 一天中的小时
- **日** (1-31) - 月份中的日期
- **月** (1-12) - 一年中的月份
- **星期** (0-6) - 一周中的星期（0 表示星期日）

**支持的语法：**

- `*` - 匹配所有值
- `?` - 不指定值（仅用于日和星期字段）
- `,` - 列表值，如 `1,3,5` 表示 1、3、5
- `-` - 范围值，如 `1-5` 表示 1 到 5
- `/` - 步长值，如 `*/5` 表示每 5 个单位，`1-10/2` 表示 1 到 10 之间每 2 个单位

**常用示例：**

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

// 工作日上午 9 点到下午 5 点执行
parseCron('0 9-17 * * 1-5')

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

#### API参考

```typescript
class CronExpression {
  constructor(expression: string)
  getNextDate(from?: Date): Date | null
}
```

**方法说明：**

- `getNextDate(from?)` - 计算下一次执行时间
  - `from` - 起始时间，默认当前时间
  - 返回下一次执行时间，如果无法计算则返回 `null`

## 任务调度器

### Scheduler

任务调度器类，支持 Cron 任务、延迟任务和定时任务。所有任务都需要先添加到调度器，然后调用 `start()` 启动调度器。

**适用场景：**
- 定时任务执行
- 数据清理
- 健康检查
- 报表生成
- 延迟任务处理

#### 基本用法

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

#### API参考

```typescript
class Scheduler {
  // 添加 Cron 任务
  schedule(id: string, cron: string | CronExpression, task: TaskFunction): void

  // 添加延迟任务（执行一次）
  once(id: string, delay: number, task: TaskFunction): void

  // 添加定时任务（重复执行）
  interval(id: string, interval: number, task: TaskFunction): void

  // 取消任务
  cancel(id: string): boolean

  // 启动调度器
  start(): void

  // 停止调度器
  stop(): void

  // 获取任务信息
  getTask(id: string): TaskInfo | undefined

  // 获取所有任务信息
  getTasks(): TaskInfo[]
}
```

**方法说明：**

- `schedule(id, cron, task)` - 添加 Cron 任务
  - `id` - 任务唯一标识
  - `cron` - Cron 表达式字符串或 `CronExpression` 实例
  - `task` - 要执行的任务函数（可以是异步函数）

- `once(id, delay, task)` - 添加延迟任务（执行一次）
  - `id` - 任务唯一标识
  - `delay` - 延迟时间（毫秒）
  - `task` - 要执行的任务函数

- `interval(id, interval, task)` - 添加定时任务（重复执行）
  - `id` - 任务唯一标识
  - `interval` - 执行间隔（毫秒）
  - `task` - 要执行的任务函数

- `cancel(id)` - 取消任务
  - `id` - 任务唯一标识
  - 返回是否成功取消

- `start()` - 启动调度器，开始执行所有任务

- `stop()` - 停止调度器，停止所有任务

- `getTask(id)` - 获取指定任务的信息

- `getTasks()` - 获取所有任务的信息

**任务信息：**

```typescript
interface TaskInfo {
  id: string                    // 任务 ID
  type: 'cron' | 'timeout' | 'interval' // 任务类型
  nextRun?: Date                // 下次执行时间
  running: boolean              // 是否正在运行
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

### 任务重试

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

async function executeWithRetry(task: () => Promise<void>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await task()
      return
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      console.log(`任务失败，${1000 * (i + 1)}ms 后重试...`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

scheduler.schedule('retry-task', '0 * * * *', async () => {
  await executeWithRetry(async () => {
    await riskyOperation()
  })
})

scheduler.start()
```

## 最佳实践

1. **任务 ID 唯一性**：确保每个任务都有唯一的 ID，避免冲突
2. **错误处理**：在任务函数中处理错误，避免任务失败影响调度器
3. **优雅关闭**：在应用关闭时调用 `stop()`，确保任务正常结束
4. **任务监控**：定期检查任务状态，确保任务正常执行
5. **避免长时间任务**：如果任务执行时间较长，考虑使用队列或异步处理
6. **资源清理**：在任务中及时释放资源，避免内存泄漏
7. **日志记录**：记录任务的执行情况，便于问题排查
