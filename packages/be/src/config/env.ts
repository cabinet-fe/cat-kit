import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * 环境变量记录类型
 */
export type EnvRecord = Record<string, string>

/**
 * 加载环境变量选项
 */
export interface LoadEnvOptions {
  /** 工作目录，默认使用 `process.cwd()` */
  cwd?: string
  /**
   * 当前运行模式，如 development / production
   *
   * 会根据模式加载对应的 `.env.${mode}` 和 `.env.${mode}.local` 文件
   */
  mode?: string
  /**
   * 自定义加载顺序
   *
   * 如果不指定，默认加载顺序为：
   * 1. `.env`
   * 2. `.env.local`
   * 3. `.env.${mode}` (如果指定了 mode)
   * 4. `.env.${mode}.local` (如果指定了 mode)
   */
  files?: string[]
  /**
   * 是否覆盖 process.env 中已有的值
   * @default false
   */
  override?: boolean
  /**
   * 是否写入 process.env
   * @default true
   */
  injectToProcess?: boolean
}

const ENV_COMMENT_REG = /^\s*#/
const ENV_EXPORT_REG = /^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)?$/

function parseValue(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const slice = trimmed.slice(1, -1)
    if (trimmed.startsWith('"')) {
      return slice.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    }
    return slice
  }

  return trimmed.replace(/\s+#.*$/, '').trim()
}

/**
 * 将 .env 文件内容解析为键值对
 *
 * 支持以下格式：
 * - `KEY=value`
 * - `export KEY=value`
 * - `KEY="quoted value"`
 * - `KEY='quoted value'`
 * - `# 注释行`
 *
 * @param content - 原始文件内容
 * @returns 解析出的环境变量映射
 */
export function parseEnvFile(content: string): EnvRecord {
  const result: EnvRecord = {}
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    if (!line || ENV_COMMENT_REG.test(line)) continue
    const match = line.match(ENV_EXPORT_REG)
    if (!match) continue

    const key = match[1]!.trim()
    const value = parseValue(match[2] ?? '')
    result[key] = value
  }

  return result
}

function resolveFiles(mode?: string, files?: string[]): string[] {
  if (files && files.length) {
    return files
  }

  const resolved: string[] = ['.env', '.env.local']

  if (mode) {
    resolved.push(`.env.${mode}`, `.env.${mode}.local`)
  }

  return resolved
}

/**
 * 读取并解析 .env 文件集合
 *
 * 按照优先级顺序加载多个 .env 文件，后面的文件会覆盖前面的同名变量。
 * 默认会将解析的环境变量注入到 `process.env` 中。
 *
 * @example
 * ```typescript
 * // 加载环境变量
 * const env = await loadEnv({
 *   mode: 'production',
 *   override: false // 不覆盖已存在的环境变量
 * })
 *
 * // 只解析不注入
 * const env = await loadEnv({
 *   injectToProcess: false
 * })
 * ```
 *
 * @param options - 加载选项
 * @returns 聚合后的环境变量映射
 */
export async function loadEnv(
  options: LoadEnvOptions = {}
): Promise<EnvRecord> {
  const {
    cwd = process.cwd(),
    mode,
    files,
    override = false,
    injectToProcess = true
  } = options

  const resolvedFiles = resolveFiles(mode, files)
  const env: EnvRecord = {}

  for (const fileName of resolvedFiles) {
    const filePath = resolve(cwd, fileName)
    let content: string

    try {
      content = await readFile(filePath, 'utf8')
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'ENOENT') continue
      throw error
    }

    const parsed = parseEnvFile(content)

    for (const [key, value] of Object.entries(parsed)) {
      env[key] = value

      if (injectToProcess && (override || !(key in process.env))) {
        process.env[key] = value
      }
    }
  }

  return env
}

/**
 * 环境变量值类型
 */
export type EnvValueType = 'string' | 'number' | 'boolean' | 'json' | 'array'

/**
 * 环境变量定义
 *
 * @template T 值的类型
 */
export interface EnvDefinition<T> {
  /**
   * 值类型或自定义转换函数
   *
   * - `'string'`: 字符串（默认）
   * - `'number'`: 数字
   * - `'boolean'`: 布尔值（'true', '1', 'yes', 'on' 为 true）
   * - `'json'`: JSON 对象
   * - `'array'`: 数组（使用 delimiter 分隔）
   * - 函数: 自定义转换函数
   */
  type?: EnvValueType | ((value: string | undefined, key: string) => T)
  /** 默认值 */
  default?: T
  /** 是否必填 */
  required?: boolean
  /** 数组分隔符（当 type 为 'array' 时使用），默认 ',' */
  delimiter?: string
  /** 值转换函数，在类型转换后执行 */
  transform?: (value: T, key: string) => T
}

/**
 * 环境变量 Schema 类型
 *
 * @template T 配置对象类型
 */
export type EnvSchema<T extends Record<string, any>> = {
  [K in keyof T]: EnvDefinition<T[K]>
}

function coerceValue(
  value: string | undefined,
  key: string,
  definition: EnvDefinition<any>
): any {
  const { type = 'string', delimiter = ',', default: defaultValue } = definition

  if (value === undefined || value === null || value === '') {
    return defaultValue
  }

  if (typeof type === 'function') {
    return type(value, key)
  }

  switch (type) {
    case 'boolean':
      return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
    case 'number': {
      const num = Number(value)
      if (Number.isNaN(num)) {
        throw new Error(`Environment variable "${key}" is not a number`)
      }
      return num
    }
    case 'json':
      return JSON.parse(value)
    case 'array':
      return value
        .split(delimiter)
        .map(item => item.trim())
        .filter(Boolean)
    case 'string':
    default:
      return value
  }
}

/**
 * 根据 schema 校验并转换环境变量
 *
 * 支持类型转换、默认值、必填校验和自定义转换函数。
 *
 * @example
 * ```typescript
 * const config = parseEnv({
 *   port: { type: 'number', default: 3000 },
 *   debug: { type: 'boolean', default: false },
 *   apiKey: { type: 'string', required: true },
 *   hosts: { type: 'array', delimiter: ',' }
 * })
 * ```
 *
 * @param schema - 环境变量定义 schema
 * @param source - 数据源，默认使用 `process.env`
 * @returns 转换后的类型安全结果
 * @throws {Error} 当 required 字段缺失或类型转换失败时抛出
 * @template T 结果类型
 */
export function parseEnv<T extends Record<string, any>>(
  schema: EnvSchema<T>,
  source: Record<string, string | undefined> = process.env
): T {
  const result = {} as T

  for (const [key, definition] of Object.entries<EnvDefinition<any>>(schema)) {
    const value = source[key]
    if (definition.required && (value === undefined || value === '')) {
      throw new Error(`Environment variable "${key}" is required`)
    }

    const coerced = coerceValue(value, key, definition)
    result[key as keyof T] = definition.transform
      ? definition.transform(coerced, key)
      : coerced
  }

  return result
}
