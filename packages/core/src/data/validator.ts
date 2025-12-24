/**
 * 校验问题描述
 */
export interface ValidationIssue {
  /**
   * 问题路径（对象字段路径，使用 `.` 连接）
   *
   * @example
   * - `name`
   * - `profile.birthday`
   * - `items.0.id`
   */
  path: string

  /**
   * 人类可读的错误信息
   */
  message: string
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; issues: ValidationIssue[] }

/**
 * 解析器：将 unknown 解析为目标类型，失败时返回 issues
 */
export type Parser<T> = (input: unknown) => SafeParseResult<T>

/**
 * 解析失败异常（用于 `parse()`）
 */
export class ValidationError extends Error {
  readonly issues: ReadonlyArray<ValidationIssue>

  constructor(issues: ValidationIssue[]) {
    super(issues[0]?.message ?? 'Validation error')
    this.name = 'ValidationError'
    this.issues = issues
  }
}

export interface Validator<T> {
  /**
   * 安全解析：失败不抛错，返回 issues
   */
  safeParse(input: unknown): SafeParseResult<T>

  /**
   * 解析：失败抛出 `ValidationError`
   */
  parse(input: unknown): T
}

/**
 * 从 Parser 创建 Validator
 */
export function createValidator<T>(parser: Parser<T>): Validator<T> {
  return {
    safeParse: parser,
    parse(input: unknown): T {
      const result = parser(input)
      if (result.success) return result.data
      throw new ValidationError(result.issues)
    }
  }
}

type InferParser<P> = P extends Parser<infer T> ? T : never

/**
 * 从对象 schema 推断输出类型
 */
export type InferObjectSchema<S extends Record<string, Parser<any>>> = {
  [K in keyof S]: InferParser<S[K]>
}

function prefixIssues(
  issues: ValidationIssue[],
  prefix: string
): ValidationIssue[] {
  if (!prefix) return issues
  return issues.map(i => ({
    ...i,
    path: i.path ? `${prefix}.${i.path}` : prefix
  }))
}

/**
 * 对象校验器：按字段 schema 校验并返回（会尽量收集所有字段错误）
 *
 * @example
 * ```ts
 * const user = object({
 *   id: number(),
 *   name: string(),
 *   age: optional(number())
 * })
 *
 * const result = user.safeParse({ id: 1, name: 'cat' })
 * if (result.success) {
 *   result.data.id // number
 * }
 * ```
 */
export function object<S extends Record<string, Parser<any>>>(
  schema: S
): Validator<InferObjectSchema<S>> {
  const parser: Parser<InferObjectSchema<S>> = (input: unknown) => {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      return {
        success: false,
        issues: [{ path: '', message: '期望是对象' }]
      }
    }

    const data = input as Record<string, unknown>
    const issues: ValidationIssue[] = []
    const out: Record<string, unknown> = {}

    for (const [key, fieldParser] of Object.entries(schema)) {
      const result = fieldParser(data[key])
      if (result.success) {
        out[key] = result.data
      } else {
        issues.push(...prefixIssues(result.issues, key))
      }
    }

    if (issues.length > 0) {
      return { success: false, issues }
    }

    return { success: true, data: out as InferObjectSchema<S> }
  }

  return createValidator(parser)
}

export interface OptionalOptions<T> {
  /**
   * 缺省值（当输入为 undefined 时生效）
   */
  default?: T | (() => T)
}

/**
 * 可选字段：当输入为 undefined 时通过（返回 undefined 或 default）
 */
export function optional<T>(
  parser: Parser<T>,
  options?: OptionalOptions<T>
): Parser<T | undefined> {
  return (input: unknown) => {
    if (input === undefined) {
      const def = options?.default
      const value = typeof def === 'function' ? (def as () => T)() : def
      return { success: true, data: value as T | undefined }
    }
    return parser(input)
  }
}

export function vObject<S extends Record<string, Parser<any>>>(
  schema: S
): Validator<InferObjectSchema<S>> {
  return object(schema)
}

export function vOptional<T>(
  parser: Parser<T>,
  options?: OptionalOptions<T>
): Parser<T | undefined> {
  return optional(parser, options)
}

export function vString(): Parser<string> {
  return (input: unknown) => {
    if (typeof input === 'string') return { success: true, data: input }
    return { success: false, issues: [{ path: '', message: '期望是字符串' }] }
  }
}

export function vNumber(): Parser<number> {
  return (input: unknown) => {
    if (typeof input === 'number' && Number.isFinite(input)) {
      return { success: true, data: input }
    }
    return { success: false, issues: [{ path: '', message: '期望是有限数字' }] }
  }
}

export function vBoolean(): Parser<boolean> {
  return (input: unknown) => {
    if (typeof input === 'boolean') return { success: true, data: input }
    return { success: false, issues: [{ path: '', message: '期望是布尔值' }] }
  }
}

export function vDate(): Parser<Date> {
  return (input: unknown) => {
    if (input instanceof Date && !Number.isNaN(input.getTime())) {
      return { success: true, data: input }
    }
    return {
      success: false,
      issues: [{ path: '', message: '期望是有效 Date' }]
    }
  }
}

export function vArray<T>(item: Parser<T>): Parser<T[]> {
  return (input: unknown) => {
    if (!Array.isArray(input)) {
      return { success: false, issues: [{ path: '', message: '期望是数组' }] }
    }

    const issues: ValidationIssue[] = []
    const out: T[] = []

    for (let i = 0; i < input.length; i++) {
      const r = item(input[i])
      if (r.success) {
        out.push(r.data)
      } else {
        issues.push(...prefixIssues(r.issues, String(i)))
      }
    }

    if (issues.length > 0) return { success: false, issues }
    return { success: true, data: out }
  }
}
