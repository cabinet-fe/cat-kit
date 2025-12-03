import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { mergeConfig } from './merge'

export type ConfigFormat = 'json' | 'yaml' | 'toml'

export interface LoadConfigOptions<T extends Record<string, unknown>> {
  cwd?: string
  format?: ConfigFormat
  defaults?: Partial<T>
  /**
   * 自定义解析器（覆盖 format）
   */
  parser?: (source: string) => T | Promise<T>
  /**
   * 自定义校验逻辑
   */
  validate?: (config: T) => void
  /**
   * 是否与 defaults 深度合并
   * @default true
   */
  mergeDefaults?: boolean
}

function detectFormat(filePath: string): ConfigFormat {
  const ext = extname(filePath).toLowerCase()
  switch (ext) {
    case '.yaml':
    case '.yml':
      return 'yaml'
    case '.toml':
      return 'toml'
    default:
      return 'json'
  }
}

class PeerDependencyError extends Error {
  constructor(dependency: string, cause?: unknown) {
    super(
      `可选依赖 "${dependency}" 未安装，请运行 "bun add ${dependency}" 后重试。`
    )
    this.name = 'PeerDependencyError'
    if (cause) {
      ;(this as { cause?: unknown }).cause = cause
    }
  }
}

async function importOptionalModule<T>(specifier: string): Promise<T> {
  try {
    return (await import(specifier)) as T
  } catch (error) {
    throw new PeerDependencyError(specifier, error)
  }
}

async function parseByFormat<T>(
  source: string,
  format: ConfigFormat
): Promise<T> {
  switch (format) {
    case 'yaml': {
      const { load } = await importOptionalModule<typeof import('js-yaml')>(
        'js-yaml'
      )
      return load(source) as T
    }
    case 'toml': {
      const { parse } = await importOptionalModule<typeof import('smol-toml')>(
        'smol-toml'
      )
      return parse(source) as T
    }
    case 'json':
    default:
      return JSON.parse(source) as T
  }
}

export async function loadConfig<
  T extends Record<string, unknown> = Record<string, unknown>
>(filePath: string, options: LoadConfigOptions<T> = {}): Promise<T> {
  const { cwd = process.cwd(), format, defaults, parser, validate } = options
  const file = resolve(cwd, filePath)
  const source = await readFile(file, 'utf8')

  const resolvedFormat = format ?? (parser ? 'json' : detectFormat(filePath))
  const parsed: T = parser
    ? await Promise.resolve(parser(source))
    : await parseByFormat<T>(source, resolvedFormat)

  const config =
    defaults && options.mergeDefaults !== false
      ? mergeConfig(defaults, parsed)
      : defaults
      ? Object.assign({}, defaults, parsed)
      : parsed

  validate?.(config)
  return config
}
