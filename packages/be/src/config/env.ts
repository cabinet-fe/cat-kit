import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export type EnvRecord = Record<string, string>

export interface LoadEnvOptions {
  cwd?: string
  /**
   * 当前运行模式，如 development / production
   */
  mode?: string
  /**
   * 自定义加载顺序
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

export type EnvValueType = 'string' | 'number' | 'boolean' | 'json' | 'array'

export interface EnvDefinition<T> {
  type?: EnvValueType | ((value: string | undefined, key: string) => T)
  default?: T
  required?: boolean
  delimiter?: string
  transform?: (value: T, key: string) => T
}

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

