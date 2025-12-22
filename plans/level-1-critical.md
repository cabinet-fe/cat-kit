# Level 1 - 紧急/必须修复 (Critical)

本文档详细描述了需要紧急修复的代码问题，这些问题可能导致功能无法使用或代码质量严重不足。

---

## CORE-001: Validator 类为空实现

### 问题位置

`packages/core/src/data/validator.ts`

### 问题描述

Validator 类被导出但仅有空实现，没有任何实际功能。

### 当前代码

```typescript
class Validator {}
```

### 影响

- 用户导入后无法使用任何验证功能
- 违反了 AGENTS.md 中"纯函数要求"的编码规范
- 占用导出命名空间却无实际功能

### 建议修复方案

**方案 A：实现完整的验证器**

````typescript
/**
 * 验证器类型
 */
export type ValidatorFn<T = any> = (value: T) => boolean | string

/**
 * 验证规则
 */
export interface ValidationRule<T = any> {
  validator: ValidatorFn<T>
  message?: string
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 数据验证器
 * @example
 * ```ts
 * const validator = new Validator()
 *   .required('名称不能为空')
 *   .minLength(2, '名称至少2个字符')
 *   .maxLength(20, '名称最多20个字符')
 *
 * const result = validator.validate('张三')
 * // { valid: true, errors: [] }
 * ```
 */
export class Validator<T = any> {
  private rules: ValidationRule<T>[] = []

  /**
   * 添加必填规则
   */
  required(message = '该字段为必填项'): this {
    this.rules.push({
      validator: v => v !== null && v !== undefined && v !== '',
      message
    })
    return this
  }

  /**
   * 添加最小长度规则
   */
  minLength(min: number, message?: string): this {
    this.rules.push({
      validator: v => typeof v === 'string' && v.length >= min,
      message: message ?? `长度不能少于${min}个字符`
    })
    return this
  }

  /**
   * 添加最大长度规则
   */
  maxLength(max: number, message?: string): this {
    this.rules.push({
      validator: v => typeof v === 'string' && v.length <= max,
      message: message ?? `长度不能超过${max}个字符`
    })
    return this
  }

  /**
   * 添加自定义规则
   */
  custom(validator: ValidatorFn<T>, message = '验证失败'): this {
    this.rules.push({ validator, message })
    return this
  }

  /**
   * 执行验证
   */
  validate(value: T): ValidationResult {
    const errors: string[] = []

    for (const rule of this.rules) {
      const result = rule.validator(value)
      if (result === false) {
        errors.push(rule.message ?? '验证失败')
      } else if (typeof result === 'string') {
        errors.push(result)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
````

**方案 B：删除空类，提供独立验证函数**

如果不需要类形式的验证器，可以删除 Validator 类，改为提供独立的验证函数：

```typescript
/**
 * 验证是否为空
 */
export function isRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== ''
}

/**
 * 验证邮箱格式
 */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

// ... 更多验证函数
```

### 优先级说明

此问题属于 Level 1，因为：

- 导出的类无任何实现，影响用户信任度
- 代码库完整性问题

---

## CORE-002: parallel 函数未实现真正的并行处理

### 问题位置

`packages/core/src/optimize/parallel.ts`

### 问题描述

parallel 函数仅是 map 的简单封装，没有实现真正的并行控制功能。

### 当前代码

```typescript
export function parallel<T>(tasks: (() => T)[]): T[] {
  return tasks.map(task => task())
}
```

### 影响

- 函数命名与实际功能不符
- 无法控制并发数量
- 对于异步任务没有意义
- 违反了"optimize"模块应提供性能优化工具的定位

### 建议修复方案

````typescript
/**
 * 并行执行选项
 */
export interface ParallelOptions {
  /** 最大并发数，默认无限制 */
  concurrency?: number
  /** 单个任务失败时是否继续执行其他任务 */
  continueOnError?: boolean
}

/**
 * 并行执行结果
 */
export interface ParallelResult<T> {
  results: (T | undefined)[]
  errors: Array<{ index: number; error: unknown }>
}

/**
 * 并行执行异步任务
 *
 * @param tasks - 任务函数数组
 * @param options - 并行选项
 * @returns Promise<结果数组>
 *
 * @example
 * ```ts
 * // 并发控制：最多同时执行3个请求
 * const results = await parallel(
 *   urls.map(url => () => fetch(url)),
 *   { concurrency: 3 }
 * )
 *
 * // 批量处理数据
 * const processed = await parallel(
 *   items.map(item => () => processItem(item)),
 *   { concurrency: 5, continueOnError: true }
 * )
 * ```
 * @complexity 时间复杂度 O(n)，空间复杂度 O(n)
 */
export async function parallel<T>(
  tasks: Array<() => T | Promise<T>>,
  options: ParallelOptions = {}
): Promise<ParallelResult<T>> {
  const { concurrency = Infinity, continueOnError = false } = options
  const results: (T | undefined)[] = new Array(tasks.length)
  const errors: Array<{ index: number; error: unknown }> = []

  if (concurrency === Infinity) {
    // 无并发限制，直接并行执行所有任务
    const promises = tasks.map(async (task, index) => {
      try {
        results[index] = await task()
      } catch (error) {
        errors.push({ index, error })
        if (!continueOnError) {
          throw error
        }
      }
    })
    await Promise.all(promises)
  } else {
    // 有并发限制，使用队列控制
    let currentIndex = 0
    const executeNext = async (): Promise<void> => {
      while (currentIndex < tasks.length) {
        const index = currentIndex++
        const task = tasks[index]!
        try {
          results[index] = await task()
        } catch (error) {
          errors.push({ index, error })
          if (!continueOnError) {
            throw error
          }
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(concurrency, tasks.length) },
      () => executeNext()
    )
    await Promise.all(workers)
  }

  return { results, errors }
}

/**
 * 同步并行执行（原始实现，保持向后兼容）
 * @deprecated 请使用异步版本 parallel()
 */
export function parallelSync<T>(tasks: Array<() => T>): T[] {
  return tasks.map(task => task())
}
````

### 优先级说明

此问题属于 Level 1，因为：

- 函数名称与实际功能严重不符，可能误导用户
- optimize 模块的核心功能缺失

---

## HTTP-001: Requestor 类未实现

### 问题位置

`packages/http/src/requestor.ts`

### 问题描述

Requestor 类被导出但仅有空壳实现，没有任何实际功能。

### 当前代码

```typescript
export class Requestor {
  abort(): void {}

  constructor() {}
}
```

### 影响

- 用户无法使用 Requestor 功能
- 文件占用空间但无实际作用
- 导出列表中包含无用类

### 建议修复方案

**方案 A：实现 Requestor 类**

根据 AGENTS.md 中的架构设计，Requestor 可能是用于管理单个请求的类：

````typescript
import type { RequestConfig, HTTPResponse } from './types'
import type { HttpEngine } from './engine/engine'

/**
 * 单个请求的管理器
 *
 * 用于管理单个 HTTP 请求的生命周期，支持取消、重试等功能
 *
 * @example
 * ```ts
 * const requestor = new Requestor(engine, '/api/users', config)
 *
 * // 发送请求
 * const response = await requestor.send()
 *
 * // 或者在需要时取消
 * requestor.abort()
 * ```
 */
export class Requestor<T = any> {
  private controller: AbortController
  private engine: HttpEngine
  private url: string
  private config: RequestConfig
  private promise: Promise<HTTPResponse<T>> | null = null
  private aborted = false

  constructor(engine: HttpEngine, url: string, config: RequestConfig = {}) {
    this.engine = engine
    this.url = url
    this.config = config
    this.controller = new AbortController()
  }

  /**
   * 发送请求
   */
  async send(): Promise<HTTPResponse<T>> {
    if (this.aborted) {
      throw new Error('请求已被取消')
    }

    if (this.promise) {
      return this.promise
    }

    this.promise = this.engine.request<T>(this.url, {
      ...this.config,
      signal: this.controller.signal
    })

    return this.promise
  }

  /**
   * 取消请求
   */
  abort(): void {
    if (!this.aborted) {
      this.aborted = true
      this.controller.abort()
    }
  }

  /**
   * 检查请求是否已取消
   */
  get isAborted(): boolean {
    return this.aborted
  }
}
````

**方案 B：删除未实现的类**

如果 Requestor 不在当前版本计划中，建议：

1. 从 `index.ts` 中移除导出
2. 删除 `requestor.ts` 文件
3. 在 AGENTS.md 中记录为待实现功能

### 优先级说明

此问题属于 Level 1，因为：

- 导出的类无任何实现，影响用户使用
- 代码库完整性问题

---

## 修复建议执行顺序

1. **CORE-001** - 工作量小，影响范围明确
2. **HTTP-001** - 决定是实现还是删除
3. **CORE-002** - 工作量较大，需要设计和测试

## 预估工作量

| 问题编号 | 预估时间 | 复杂度 |
| -------- | -------- | ------ |
| CORE-001 | 2-4 小时 | 中     |
| CORE-002 | 4-8 小时 | 高     |
| HTTP-001 | 1-4 小时 | 中     |

**总计**: 约 1-2 个工作日
