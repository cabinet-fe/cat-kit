import { copyFile, cp, readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { existsSync } from "node:fs";

//#region src/fs/read-dir.d.ts
/**
 * 目录条目信息
 */
interface DirEntry {
  /** 绝对路径 */
  path: string;
  /** 相对于根目录的路径 */
  relativePath: string;
  /** 文件名或目录名 */
  name: string;
  /** 目录深度（从根目录开始，根目录为 0） */
  depth: number;
  /** 是否为文件 */
  isFile: boolean;
  /** 是否为目录 */
  isDirectory: boolean;
  /** 是否为符号链接 */
  isSymbolicLink: boolean;
}
/**
 * 读取目录选项
 */
interface ReadDirOptions {
  /**
   * 是否递归读取子目录
   * @default false
   */
  recursive?: boolean;
  /**
   * 过滤函数，返回 `true` 表示保留该条目
   */
  filter?: (entry: DirEntry) => boolean;
  /**
   * 是否只返回文件路径
   *
   * - 当为 `true` 时，返回文件路径数组（string[]）
   * - 当为 `false` 时，返回包含文件和目录的详细信息数组（DirEntry[]）
   *
   * @default false
   */
  onlyFiles?: boolean;
}
/**
 * 读取目录内容
 *
 * 支持递归读取、过滤和多种返回格式。
 *
 * @example
 * ```typescript
 * // 返回文件路径数组
 * const files = await readDir('./src', {
 *   recursive: true,
 *   onlyFiles: true,
 *   filter: entry => entry.name.endsWith('.ts')
 * })
 *
 * // 返回包含文件和目录的详细信息数组
 * const entries = await readDir('./src', {
 *   recursive: true
 * })
 * ```
 *
 * @param dir - 起始目录路径
 * @param options - 过滤、递归和返回格式选项
 * @returns 当 `onlyFiles` 为 `true` 时返回文件路径数组，否则返回包含元数据的条目数组
 * @throws {Error} 当目录不存在或无法读取时抛出错误
 */
declare function readDir(dir: string, options?: ReadDirOptions & {
  onlyFiles?: false;
}): Promise<DirEntry[]>;
declare function readDir(dir: string, options: ReadDirOptions & {
  onlyFiles: true;
}): Promise<string[]>;
//#endregion
//#region src/fs/ensure-dir.d.ts
/**
 * 确保目录存在
 *
 * 如果目录不存在则创建，包括所有父目录。如果路径已存在但不是目录，会抛出错误。
 *
 * @example
 * ```typescript
 * // 确保目录存在
 * await ensureDir('./logs/app')
 *
 * // 创建嵌套目录
 * await ensureDir('./data/2024/01')
 * ```
 *
 * @param dirPath - 目标目录路径
 * @throws {Error} 当路径存在但不是目录时抛出错误
 * @throws {Error} 当目录创建失败时抛出错误
 */
declare function ensureDir(dirPath: string): Promise<void>;
//#endregion
//#region src/fs/json.d.ts
/**
 * 读取 JSON 文件选项
 */
interface ReadJsonOptions {
  /** 文件编码，默认 'utf8' */
  encoding?: BufferEncoding;
  /** JSON.parse 的 reviver 函数 */
  reviver?: Parameters<typeof JSON.parse>[1];
}
/**
 * 写入 JSON 文件选项
 */
interface WriteJsonOptions {
  /** 文件编码，默认 'utf8' */
  encoding?: BufferEncoding;
  /** JSON.stringify 的 replacer 函数 */
  replacer?: Parameters<typeof JSON.stringify>[1];
  /** 缩进空格数，默认 2 */
  space?: Parameters<typeof JSON.stringify>[2];
  /** 文件末尾换行符，默认 '\n' */
  eol?: string;
}
/**
 * 读取 JSON 文件并解析为对象
 *
 * @example
 * ```typescript
 * // 读取配置文件
 * const config = await readJson<AppConfig>('./config.json')
 *
 * // 使用 reviver 转换日期
 * const data = await readJson('./data.json', {
 *   reviver: (key, value) => {
 *     if (key === 'date') return new Date(value)
 *     return value
 *   }
 * })
 * ```
 *
 * @param filePath - JSON 文件路径
 * @param options - 读取编码与自定义 reviver
 * @returns 解析后的数据
 * @throws {Error} 当文件不存在或 JSON 格式错误时抛出错误
 * @template T 返回数据类型
 */
declare function readJson<T = Record<string, any>>(filePath: string, options?: ReadJsonOptions): Promise<T>;
/**
 * 将数据序列化为 JSON 文件
 *
 * 如果目录不存在会自动创建。文件末尾会自动添加换行符。
 *
 * @example
 * ```typescript
 * // 写入配置文件
 * await writeJson('./config.json', {
 *   port: 3000,
 *   debug: false
 * })
 *
 * // 自定义格式
 * await writeJson('./data.json', data, {
 *   space: 4,
 *   eol: '\r\n'
 * })
 * ```
 *
 * @param filePath - 目标文件路径
 * @param data - 待写入的数据
 * @param options - 编码、replacer、缩进等选项
 * @throws {Error} 当文件写入失败时抛出错误
 */
declare function writeJson(filePath: string, data: unknown, options?: WriteJsonOptions): Promise<void>;
//#endregion
//#region src/fs/remove.d.ts
interface RemoveOptions {
  /**
   * 是否忽略不存在的路径
   * @default false
   */
  force?: boolean;
}
/**
 * 删除文件或目录
 * @param targetPath - 要删除的路径
 * @param options - 删除行为控制（是否忽略不存在）
 */
declare function removePath(targetPath: string, options?: RemoveOptions): Promise<void>;
//#endregion
//#region src/fs/write-file.d.ts
/**
 * 写入文件选项
 */
interface WriteFileOptions {
  /** 文件编码，默认 'utf8' */
  encoding?: BufferEncoding;
  /**
   * 文件权限模式，默认 0o666
   * @example 0o644
   */
  mode?: number;
  /**
   * 文件系统标志
   * - 'w': 写入（默认），如果文件存在则截断
   * - 'a': 追加，如果文件不存在则创建
   * - 'wx': 写入，如果文件存在则失败
   * @default 'w'
   */
  flag?: 'w' | 'a' | 'wx';
}
/**
 * 支持的写入数据类型
 */
type WriteFileData = string | Buffer | NodeJS.ArrayBufferView | ReadableStream<Uint8Array> | Readable | AsyncIterable<string | Buffer | NodeJS.ArrayBufferView> | Iterable<string | Buffer | NodeJS.ArrayBufferView>;
/**
 * 写入文件
 *
 * 相比 Node.js 原生 `fs.writeFile`，此函数提供以下增强功能：
 * - 自动创建父目录（如果不存在）
 * - 支持 Web ReadableStream（如 fetch 响应体）
 * - 支持 Node.js Readable 流
 * - 支持 AsyncIterable 和 Iterable
 *
 * @example
 * ```typescript
 * // 写入字符串
 * await writeFile('./logs/app.log', 'Hello World')
 *
 * // 写入 Buffer
 * await writeFile('./data/binary.dat', Buffer.from([0x00, 0x01, 0x02]))
 *
 * // 写入 Web ReadableStream（如 fetch 响应）
 * const response = await fetch('https://example.com/file')
 * await writeFile('./downloads/file.txt', response.body!)
 *
 * // 追加模式
 * await writeFile('./logs/app.log', 'New line\n', { flag: 'a' })
 *
 * // 指定编码
 * await writeFile('./data/utf16.txt', 'Unicode 文本', { encoding: 'utf16le' })
 * ```
 *
 * @param filePath - 目标文件路径
 * @param data - 要写入的数据
 * @param options - 写入选项
 * @throws {Error} 当写入失败时抛出错误
 */
declare function writeFile(filePath: string, data: WriteFileData, options?: WriteFileOptions): Promise<void>;
//#endregion
//#region src/fs/empty-dir.d.ts
/**
 * 确保目录为空
 *
 * 如果目录不为空，则删除目录内容。如果目录不存在，则创建该目录。
 * 目录本身不会被删除。
 *
 * @example
 * ```typescript
 * // 确保目录为空
 * await emptyDir('./temp')
 *
 * // 清空缓存目录
 * await emptyDir('./cache')
 *
 * // 如果目录不存在，会自动创建
 * await emptyDir('./new-empty-dir')
 * ```
 *
 * @param dirPath - 目标目录路径
 * @throws {Error} 当路径存在但不是目录时抛出错误
 * @throws {Error} 当目录操作失败时抛出错误
 */
declare function emptyDir(dirPath: string): Promise<void>;
//#endregion
//#region src/fs/move.d.ts
/**
 * 移动路径选项
 */
interface MoveOptions {
  /**
   * 如果目标路径已存在，是否覆盖
   * @default false
   */
  overwrite?: boolean;
}
/**
 * 移动文件或目录到新位置
 *
 * 将源路径的文件或目录移动到目标路径。源路径和目标路径类型必须一致：
 * 要么都是文件，要么都是目录。
 *
 * @example
 * ```typescript
 * // 移动文件
 * await movePath('./old/file.txt', './new/file.txt')
 *
 * // 移动目录
 * await movePath('./old-dir', './new-dir')
 *
 * // 覆盖已存在的目标
 * await movePath('./source', './target', { overwrite: true })
 * ```
 *
 * @param src - 源路径（文件或目录）
 * @param dest - 目标路径（必须与源路径类型一致）
 * @param options - 移动选项
 * @throws {Error} 当源路径不存在时抛出错误
 * @throws {Error} 当源路径和目标路径类型不一致时抛出错误
 * @throws {Error} 当目标路径已存在且 overwrite 为 false 时抛出错误
 */
declare function movePath(src: string, dest: string, options?: MoveOptions): Promise<void>;
//#endregion
//#region src/config/env.d.ts
/**
 * 环境变量记录类型
 */
type EnvRecord = Record<string, string>;
/**
 * 加载环境变量选项
 */
interface LoadEnvOptions {
  /** 工作目录，默认使用 `process.cwd()` */
  cwd?: string;
  /**
   * 当前运行模式，如 development / production
   *
   * 会根据模式加载对应的 `.env.${mode}` 和 `.env.${mode}.local` 文件
   */
  mode?: string;
  /**
   * 自定义加载顺序
   *
   * 如果不指定，默认加载顺序为：
   * 1. `.env`
   * 2. `.env.local`
   * 3. `.env.${mode}` (如果指定了 mode)
   * 4. `.env.${mode}.local` (如果指定了 mode)
   */
  files?: string[];
  /**
   * 是否覆盖 process.env 中已有的值
   * @default false
   */
  override?: boolean;
  /**
   * 是否写入 process.env
   * @default true
   */
  injectToProcess?: boolean;
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
declare function parseEnvFile(content: string): EnvRecord;
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
declare function loadEnv(options?: LoadEnvOptions): Promise<EnvRecord>;
/**
 * 环境变量值类型
 */
type EnvValueType = 'string' | 'number' | 'boolean' | 'json' | 'array';
/**
 * 环境变量定义
 *
 * @template T 值的类型
 */
interface EnvDefinition<T> {
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
  type?: EnvValueType | ((value: string | undefined, key: string) => T);
  /** 默认值 */
  default?: T;
  /** 是否必填 */
  required?: boolean;
  /** 数组分隔符（当 type 为 'array' 时使用），默认 ',' */
  delimiter?: string;
  /** 值转换函数，在类型转换后执行 */
  transform?: (value: T, key: string) => T;
}
/**
 * 环境变量 Schema 类型
 *
 * @template T 配置对象类型
 */
type EnvSchema<T extends Record<string, any>> = { [K in keyof T]: EnvDefinition<T[K]> };
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
declare function parseEnv<T extends Record<string, any>>(schema: EnvSchema<T>, source?: Record<string, string | undefined>): T;
//#endregion
//#region src/config/config.d.ts
/**
 * 配置文件格式
 */
type ConfigFormat = 'json' | 'yaml' | 'toml';
/**
 * 加载配置选项
 *
 * @template T 配置对象类型
 */
interface LoadConfigOptions<T extends Record<string, unknown>> {
  /** 工作目录，默认使用 `process.cwd()` */
  cwd?: string;
  /** 配置文件格式，如果不指定会根据文件扩展名自动检测 */
  format?: ConfigFormat;
  /** 默认配置值，会与加载的配置合并 */
  defaults?: Partial<T>;
  /**
   * 自定义解析器（覆盖 format）
   *
   * 如果提供了自定义解析器，将忽略 format 选项。
   */
  parser?: (source: string) => T | Promise<T>;
  /**
   * 自定义校验逻辑
   *
   * 如果校验失败应抛出错误。
   */
  validate?: (config: T) => void;
  /**
   * 是否与 defaults 深度合并
   * @default true
   */
  mergeDefaults?: boolean;
}
/**
 * 加载并解析配置文件
 *
 * 支持 JSON、YAML 和 TOML 格式。YAML 和 TOML 需要安装对应的可选依赖：
 * - YAML: `bun add js-yaml`
 * - TOML: `bun add smol-toml`
 *
 * @example
 * ```typescript
 * // 加载 JSON 配置
 * const config = await loadConfig<AppConfig>('./config.json', {
 *   defaults: { port: 3000 }
 * })
 *
 * // 加载 YAML 配置
 * const config = await loadConfig('./config.yaml', {
 *   validate: (c) => {
 *     if (!c.apiKey) throw new Error('apiKey is required')
 *   }
 * })
 * ```
 *
 * @param filePath - 配置文件路径（相对或绝对路径）
 * @param options - 解析及合并选项
 * @returns 解析后的配置对象
 * @throws {PeerDependencyError} 当需要可选依赖但未安装时
 * @throws {Error} 当文件读取失败或解析失败时
 * @template T 配置对象类型
 */
declare function loadConfig<T extends Record<string, unknown> = Record<string, unknown>>(filePath: string, options?: LoadConfigOptions<T>): Promise<T>;
//#endregion
//#region src/config/merge.d.ts
type Mergeable = Record<string, any>;
/**
 * 深度合并多个配置对象
 *
 * 数组会被直接替换，对象会递归合并。返回新对象，不会修改原始对象。
 *
 * @example
 * ```typescript
 * const merged = mergeConfig(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 }, e: 4 }
 * )
 * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 *
 * @param configs - 待合并的配置对象集合，后面的会覆盖前面的
 * @returns 合并后的新对象
 * @template T 配置对象类型
 */
declare function mergeConfig<T extends Mergeable>(...configs: Array<Partial<T>>): T;
//#endregion
//#region src/logger/transports.d.ts
/**
 * 日志传输器接口
 *
 * 用于将日志输出到不同的目标（控制台、文件等）。
 */
interface Transport {
  /** 最低日志级别，低于此级别的日志不会被输出 */
  level?: LogLevel;
  /**
   * 写入日志条目
   *
   * @param entry - 日志条目
   * @param formatted - 格式化后的日志字符串
   * @param format - 日志格式
   */
  write(entry: LogEntry, formatted: string, format: LogFormat): void | Promise<void>;
}
/**
 * 控制台传输器选项
 */
interface ConsoleTransportOptions {
  /** 是否使用颜色，默认 true */
  useColors?: boolean;
  /** 日志级别 */
  level?: LogLevel;
}
/**
 * 控制台日志传输器
 *
 * 将日志输出到控制台，支持颜色高亮。
 *
 * @example
 * ```typescript
 * const transport = new ConsoleTransport({ useColors: true })
 * const logger = new Logger({ transports: [transport] })
 * ```
 */
declare class ConsoleTransport implements Transport {
  private readonly options;
  level?: LogLevel;
  /**
   * 创建控制台传输器实例
   * @param options - 传输器选项
   */
  constructor(options?: ConsoleTransportOptions);
  write(entry: LogEntry, formatted: string, format: LogFormat): void;
}
/**
 * 文件传输器选项
 */
interface FileTransportOptions {
  /**
   * 日志路径，可以是目录或文件
   * - 目录：日志文件按日期命名（如 2024-01-15.log）
   * - 文件：直接写入该文件
   */
  path: string;
  /** 最大文件大小（字节），超过此大小会自动轮转或创建新文件 */
  maxSize?: number;
  /** 换行符，默认 '\n' */
  newline?: string;
  /** 日志级别 */
  level?: LogLevel;
}
/**
 * 文件日志传输器
 *
 * 将日志写入文件，支持文件大小轮转和目录模式。
 *
 * @example
 * ```typescript
 * // 文件模式：超过大小时轮转
 * const transport = new FileTransport({
 *   path: './logs/app.log',
 *   maxSize: 10 * 1024 * 1024 // 10MB
 * })
 *
 * // 目录模式：按日期创建新文件
 * const transport = new FileTransport({
 *   path: './logs',
 *   maxSize: 10 * 1024 * 1024 // 10MB
 * })
 * ```
 */
declare class FileTransport implements Transport {
  private readonly options;
  level?: LogLevel;
  private queue;
  private isDirectory;
  /**
   * 创建文件传输器实例
   * @param options - 传输器选项
   */
  constructor(options: FileTransportOptions);
  write(_: LogEntry, formatted: string, _format: LogFormat): Promise<void>;
  /**
   * 获取当前日志文件路径
   */
  private getLogFilePath;
  private writeInternal;
  /**
   * 处理文件大小限制
   */
  private handleSizeLimit;
}
//#endregion
//#region src/logger/logger.d.ts
/**
 * 日志格式类型
 */
type LogFormat = 'text' | 'json';
/**
 * 日志级别枚举
 */
declare enum LogLevel {
  /** 调试信息 */
  DEBUG = "debug",
  /** 一般信息 */
  INFO = "info",
  /** 警告信息 */
  WARN = "warn",
  /** 错误信息 */
  ERROR = "error",
}
/**
 * 日志条目
 */
interface LogEntry {
  /** 日志级别 */
  level: LogLevel;
  /** 日志消息 */
  message: string;
  /** 时间戳 */
  timestamp: string;
  /** 日志器名称 */
  name?: string;
  /** 附加元数据 */
  meta?: Record<string, unknown>;
  /** 错误信息（如果有） */
  error?: {
    message: string;
    stack?: string;
  };
}
/**
 * Text 格式化变量
 */
interface TextFormatVars {
  /** 时间戳 */
  timestamp: string;
  /** 日志级别 */
  level: string;
  /** 日志器名称 */
  name?: string;
  /** 日志消息 */
  message: string;
  /** 附加元数据 JSON */
  meta?: string;
  /** 错误信息 */
  error?: string;
}
/**
 * Text 格式化函数
 */
type TextFormatter = (vars: TextFormatVars, entry: LogEntry) => string;
/**
 * Text 格式化配置
 * - 字符串：使用 {} 引用变量，如 '{timestamp} [{level}] {message}'
 * - 函数：回调函数，接收变量对象
 */
type TextFormatConfig = string | TextFormatter;
/**
 * 日志器选项
 */
interface LoggerOptions {
  /** 日志器名称 */
  name?: string;
  /** 最低日志级别，低于此级别的日志不会被输出 */
  level?: LogLevel;
  /** 日志格式，'text' 为文本格式，'json' 为 JSON 格式 */
  format?: LogFormat;
  /** 传输器列表，用于输出日志 */
  transports?: Transport[];
  /** 上下文信息，会附加到所有日志条目 */
  context?: Record<string, unknown>;
  /** 时间戳格式，默认 'yyyy-MM-dd HH:mm:ss' */
  timestampFormat?: string;
  /** 是否使用 UTC 时间，默认 false */
  utc?: boolean;
  /** Text 格式化配置（仅 format='text' 时生效） */
  textFormat?: TextFormatConfig;
}
/**
 * 结构化日志记录器
 *
 * 支持多级别日志、多种输出格式、多个传输器。
 *
 * @example
 * ```typescript
 * const logger = new Logger({
 *   name: 'app',
 *   level: LogLevel.INFO,
 *   format: 'json',
 *   transports: [
 *     new ConsoleTransport(),
 *     new FileTransport({ path: './logs' })
 *   ]
 * })
 *
 * await logger.info('Server started', { port: 3000 })
 * await logger.error('Failed to connect', error)
 *
 * // 使用自定义 text 格式
 * const customLogger = new Logger({
 *   format: 'text',
 *   textFormat: '[{timestamp}] {level} - {message}'
 * })
 *
 * // 使用函数格式化
 * const fnLogger = new Logger({
 *   format: 'text',
 *   textFormat: (vars) => `${vars.timestamp} | ${vars.message}`
 * })
 * ```
 */
declare class Logger {
  private readonly level;
  private readonly format;
  private readonly timestampFormat;
  private readonly utc;
  private readonly transports;
  private readonly name?;
  private readonly context?;
  private readonly textFormat?;
  /**
   * 创建日志器实例
   * @param options - 日志器选项
   */
  constructor(options?: LoggerOptions);
  /**
   * 生成时间戳
   */
  private getTimestamp;
  private buildEntry;
  private logInternal;
  /**
   * 记录日志
   *
   * @param level - 日志级别
   * @param message - 日志消息
   * @param meta - 附加元数据
   * @param error - 错误对象（如果有）
   */
  log(level: LogLevel, message: string, meta?: Record<string, unknown>, error?: Error): Promise<void>;
  /**
   * 记录 DEBUG 级别日志
   * @param message - 日志消息
   * @param meta - 附加元数据
   */
  debug(message: string, meta?: Record<string, unknown>): Promise<void>;
  /**
   * 记录 INFO 级别日志
   * @param message - 日志消息
   * @param meta - 附加元数据
   */
  info(message: string, meta?: Record<string, unknown>): Promise<void>;
  /**
   * 记录 WARN 级别日志
   * @param message - 日志消息
   * @param meta - 附加元数据
   */
  warn(message: string, meta?: Record<string, unknown>): Promise<void>;
  /**
   * 记录 ERROR 级别日志
   *
   * @param message - 日志消息
   * @param errorOrMeta - 错误对象或元数据
   * @param meta - 附加元数据（当第一个参数是错误对象时使用）
   */
  error(message: string, errorOrMeta?: Error | Record<string, unknown>, meta?: Record<string, unknown>): Promise<void>;
}
//#endregion
//#region src/cache/lru-cache.d.ts
/**
 * LRU 缓存选项
 */
interface LRUCacheOptions {
  /**
   * 最大缓存容量
   * @default 100
   */
  maxSize?: number;
  /**
   * 默认过期时间（毫秒）
   */
  ttl?: number;
}
/**
 * LRU（最近最少使用）缓存实现
 *
 * 自动淘汰最久未使用的项，支持 TTL（生存时间）过期机制
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<string, User>({
 *   maxSize: 100,
 *   ttl: 3600000 // 1小时过期
 * })
 *
 * cache.set('user:1', user)
 * const user = cache.get('user:1')
 * ```
 *
 * @template K 键的类型
 * @template V 值的类型
 */
declare class LRUCache<K, V> {
  private readonly cache;
  private readonly maxSize;
  private readonly ttl?;
  /**
   * 创建 LRU 缓存实例
   * @param options - 缓存选项
   */
  constructor(options?: LRUCacheOptions);
  private isExpired;
  private touch;
  /**
   * 获取缓存值
   *
   * 如果值已过期或不存在，返回 `undefined`。访问时会自动更新使用顺序。
   *
   * @param key - 缓存键
   * @returns 缓存值，如果不存在或已过期则返回 `undefined`
   */
  get(key: K): V | undefined;
  /**
   * 检查键是否存在且未过期
   *
   * @param key - 缓存键
   * @returns 如果键存在且未过期返回 `true`，否则返回 `false`
   */
  has(key: K): boolean;
  /**
   * 设置缓存值
   *
   * 如果缓存已满，会自动删除最久未使用的项。如果键已存在，会更新其值和使用时间。
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（毫秒），如果未指定则使用默认 TTL
   */
  set(key: K, value: V, ttl?: number): void;
  /**
   * 删除指定的缓存项
   *
   * @param key - 要删除的缓存键
   * @returns 如果键存在并成功删除返回 `true`，否则返回 `false`
   */
  delete(key: K): boolean;
  /**
   * 清空所有缓存项
   */
  clear(): void;
  /**
   * 获取所有缓存键的迭代器
   *
   * @returns 键的迭代器
   */
  keys(): IterableIterator<K>;
  /**
   * 获取所有缓存值的迭代器
   *
   * 只返回未过期的值。
   *
   * @returns 值的迭代器
   */
  values(): IterableIterator<V>;
  /**
   * 获取当前缓存中的条目数量
   * @returns 缓存条目数量
   */
  get size(): number;
}
//#endregion
//#region src/cache/file-cache.d.ts
/**
 * 文件缓存选项
 */
interface FileCacheOptions {
  /** 缓存目录路径 */
  dir: string;
  /**
   * 默认过期时间（毫秒）
   */
  ttl?: number;
  /**
   * 文件后缀
   * @default '.json'
   */
  extension?: string;
}
/**
 * 基于文件系统的缓存实现
 *
 * 将缓存数据持久化到文件系统，支持 TTL 过期机制。
 *
 * @example
 * ```typescript
 * const cache = new FileCache<User>({
 *   dir: './cache',
 *   ttl: 3600000 // 1小时过期
 * })
 *
 * await cache.set('user:1', user)
 * const user = await cache.get('user:1')
 * ```
 *
 * @template V 缓存值的类型
 */
declare class FileCache<V> {
  private readonly dir;
  private readonly ttl?;
  private readonly extension;
  /**
   * 创建文件缓存实例
   * @param options - 缓存选项
   */
  constructor(options: FileCacheOptions);
  private getFilePath;
  private isExpired;
  /**
   * 获取缓存值
   *
   * 如果值已过期或不存在，返回 `undefined`。过期的缓存文件会被自动删除。
   *
   * @param key - 缓存键
   * @returns 缓存值，如果不存在或已过期则返回 `undefined`
   * @throws {Error} 当文件读取失败时抛出错误
   */
  get(key: string): Promise<V | undefined>;
  /**
   * 设置缓存值
   *
   * 如果目录不存在会自动创建。值会被序列化为 JSON 并写入文件。
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（毫秒），如果未指定则使用默认 TTL
   * @throws {Error} 当文件写入失败时抛出错误
   */
  set(key: string, value: V, ttl?: number): Promise<void>;
  /**
   * 删除指定的缓存项
   *
   * @param key - 要删除的缓存键
   * @returns 如果键存在并成功删除返回 `true`，如果文件不存在返回 `false`
   * @throws {Error} 当文件删除失败时抛出错误
   */
  delete(key: string): Promise<boolean>;
  /**
   * 清空所有缓存项
   *
   * 删除整个缓存目录并重新创建。
   *
   * @throws {Error} 当目录操作失败时抛出错误
   */
  clear(): Promise<void>;
}
//#endregion
//#region src/cache/memoize.d.ts
/**
 * 缓存适配器接口
 *
 * 用于自定义缓存实现，支持不同的缓存策略。
 *
 * @template K 键的类型
 * @template V 值的类型
 */
interface CacheAdapter<K, V> {
  /** 获取缓存值 */
  get(key: K): V | undefined;
  /** 设置缓存值 */
  set(key: K, value: V, ttl?: number): void;
  /** 检查键是否存在 */
  has(key: K): boolean;
  /** 删除缓存项 */
  delete(key: K): boolean;
  /** 清空所有缓存 */
  clear(): void;
}
/**
 * 函数记忆化选项
 *
 * @template F 函数类型
 * @template K 缓存键类型
 */
interface MemoizeOptions<F extends (...args: any[]) => any, K> {
  /** 自定义缓存实现，默认使用 LRUCache */
  cache?: CacheAdapter<K, Awaited<ReturnType<F>>>;
  /** 自定义键解析函数，默认使用 JSON.stringify */
  resolver?: (...args: Parameters<F>) => K;
  /** 默认过期时间（毫秒） */
  ttl?: number;
}
/**
 * 为函数添加缓存能力（记忆化）
 *
 * 自动缓存函数调用结果，相同参数的后续调用会直接返回缓存值。
 * 支持同步和异步函数，异步函数会缓存 Promise 结果。
 *
 * @example
 * ```typescript
 * // 同步函数
 * const expensiveFn = memoize((n: number) => {
 *   // 复杂计算
 *   return n * n
 * })
 *
 * // 异步函数
 * const fetchUser = memoize(async (id: number) => {
 *   return await api.getUser(id)
 * }, { ttl: 3600000 })
 *
 * // 访问缓存
 * expensiveFn.cache.get('1') // 获取缓存值
 * expensiveFn.clear() // 清空缓存
 * ```
 *
 * @param fn - 需要缓存的原函数
 * @param options - 自定义缓存、键解析与过期时间
 * @returns 带缓存功能的函数，并附带 `cache` 和 `clear` 属性
 * @template F 函数类型
 */
declare function memoize<F extends (...args: any[]) => any>(fn: F, options?: MemoizeOptions<F, unknown>): F & {
  cache: CacheAdapter<unknown, Awaited<ReturnType<F>>>;
  clear(): void;
};
//#endregion
//#region src/net/port.d.ts
/**
 * 端口检查选项
 */
interface PortCheckOptions {
  /** 主机地址，默认 '127.0.0.1' */
  host?: string;
  /** 超时时间（毫秒），默认 1000 */
  timeout?: number;
}
/**
 * 检查端口是否可用
 *
 * 通过尝试在该端口上创建服务器来判断端口是否被占用。
 *
 * @example
 * ```typescript
 * // 检查本地 3000 端口
 * const available = await isPortAvailable(3000)
 * if (available) {
 *   // 启动服务器
 * }
 *
 * // 检查指定主机的端口
 * const available = await isPortAvailable(8080, {
 *   host: '0.0.0.0',
 *   timeout: 2000
 * })
 * ```
 *
 * @param port - 目标端口号
 * @param options - 主机地址和超时时间选项
 * @returns 端口可用时返回 `true`，被占用或超时返回 `false`
 */
declare function isPortAvailable(port: number, options?: PortCheckOptions): Promise<boolean>;
//#endregion
//#region src/net/ip.d.ts
/**
 * 获取本地 IP 地址选项
 */
interface GetLocalIPOptions {
  /** IP 地址族，默认 'IPv4' */
  family?: 'IPv4' | 'IPv6';
  /** 是否包含内网地址，默认 false（只返回公网地址） */
  includeInternal?: boolean;
}
/**
 * 获取本机网卡的首个匹配 IP 地址
 *
 * 遍历所有网络接口，返回第一个匹配条件的 IP 地址。
 *
 * @example
 * ```typescript
 * // 获取公网 IPv4 地址
 * const ip = getLocalIP({ family: 'IPv4' })
 *
 * // 获取包含内网的 IPv6 地址
 * const ip = getLocalIP({ family: 'IPv6', includeInternal: true })
 * ```
 *
 * @param options - 地址族与是否包含内网地址
 * @returns 匹配到的 IP 地址，若不存在则为 `undefined`
 */
declare function getLocalIP(options?: GetLocalIPOptions): string | undefined;
//#endregion
//#region src/system/cpu.d.ts
/**
 * CPU 基本信息
 */
interface CpuInfo {
  /** CPU 型号 */
  model: string;
  /** CPU 核心数 */
  cores: number;
  /** CPU 主频（MHz） */
  speed: number;
  /** 系统平均负载（1分钟、5分钟、15分钟） */
  loadAverage: [number, number, number];
}
/**
 * CPU 使用情况
 */
interface CpuUsage {
  /** 用户态时间（毫秒） */
  user: number;
  /** 系统态时间（毫秒） */
  system: number;
  /** 空闲时间（毫秒） */
  idle: number;
  /** 总时间（毫秒） */
  total: number;
  /** CPU 使用率（百分比） */
  percent: number;
}
/**
 * 获取 CPU 基本信息
 *
 * @returns CPU 型号、核心数、主频与平均负载
 */
declare function getCpuInfo(): CpuInfo;
/**
 * 采样 CPU 使用情况
 *
 * 通过采样一段时间内的 CPU 时间来计算使用率。
 *
 * @param interval - 采样间隔（毫秒），默认 500ms
 * @returns 采样区间内的 CPU 使用统计
 */
declare function getCpuUsage(interval?: number): Promise<CpuUsage>;
//#endregion
//#region src/system/memory.d.ts
/**
 * 内存信息
 */
interface MemoryInfo {
  /** 总内存（字节） */
  total: number;
  /** 空闲内存（字节） */
  free: number;
  /** 已用内存（字节） */
  used: number;
  /** 内存使用率（百分比） */
  usedPercent: number;
}
/**
 * 获取系统内存使用情况
 *
 * @returns 总量、空闲、已用及使用率
 */
declare function getMemoryInfo(): MemoryInfo;
//#endregion
//#region src/system/disk.d.ts
/**
 * 磁盘信息
 */
interface DiskInfo {
  /** 磁盘路径 */
  path: string;
  /** 总容量（字节） */
  total: number;
  /** 空闲容量（字节） */
  free: number;
  /** 已用容量（字节） */
  used: number;
  /** 使用率（百分比） */
  usedPercent: number;
}
/**
 * 获取指定路径所在磁盘的容量信息
 *
 * 支持 Windows 和 Unix 系统。Windows 使用 PowerShell 查询，Unix 使用 `statfs`。
 *
 * @param path - 目标路径，默认使用当前工作目录
 * @returns 磁盘容量、剩余与使用信息
 * @throws {Error} 当无法获取磁盘信息时抛出错误
 */
declare function getDiskInfo(path?: string): Promise<DiskInfo>;
//#endregion
//#region src/system/network.d.ts
/**
 * 网络接口信息
 */
interface NetworkInterfaceInfo {
  /** 接口名称 */
  name: string;
  /** IP 地址 */
  address: string;
  /** 地址族 */
  family: 'IPv4' | 'IPv6';
  /** MAC 地址 */
  mac: string;
  /** 是否为内网地址 */
  internal: boolean;
  /** 子网掩码 */
  netmask: string;
  /** CIDR 表示法（如果有） */
  cidr?: string;
}
/**
 * 获取网络接口选项
 */
interface GetNetworkInterfacesOptions {
  /** 是否包含内网地址，默认 false */
  includeInternal?: boolean;
}
/**
 * 获取本机网络接口信息
 *
 * @param options - 控制是否包含内部地址
 * @returns 网络接口列表
 */
declare function getNetworkInterfaces(options?: GetNetworkInterfacesOptions): NetworkInterfaceInfo[];
//#endregion
//#region src/scheduler/cron.d.ts
/**
 * Cron 字段配置
 */
interface CronFieldConfig {
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
}
/**
 * Cron 表达式解析器
 *
 * 支持标准的 5 位 Cron 表达式格式：`分钟 小时 日 月 星期`
 *
 * @example
 * ```typescript
 * const cron = new CronExpression('0 2 * * *') // 每天凌晨 2 点
 * const next = cron.getNextDate() // 获取下次执行时间
 *
 * // 支持范围、步长和列表
 * const cron2 = new CronExpression('0 9-17 * * 1-5') // 工作日上午 9 点到下午 5 点
 * const cron3 = new CronExpression('*\/5 * * * *') // 每 5 分钟
 * ```
 */
declare class CronExpression {
  private readonly minutes;
  private readonly hours;
  private readonly days;
  private readonly months;
  private readonly weekdays;
  /**
   * 创建 Cron 表达式实例
   *
   * @param expression - 5 位 Cron 表达式字符串
   * @throws {Error} 当表达式格式不正确时抛出错误
   */
  constructor(expression: string);
  /**
   * 获取下一次执行时间
   *
   * @param from - 起始时间，默认使用当前时间
   * @returns 下一次执行时间，如果无法找到则返回 `null`
   */
  getNextDate(from?: Date): Date | null;
}
/**
 * 解析 Cron 表达式
 *
 * 便捷函数，等同于 `new CronExpression(expression)`。
 *
 * @param expression - 5 位 Cron 表达式字符串
 * @returns CronExpression 实例
 * @throws {Error} 当表达式格式不正确时抛出错误
 */
declare function parseCron(expression: string): CronExpression;
//#endregion
//#region src/scheduler/scheduler.d.ts
/**
 * 任务函数类型
 */
type TaskFunction = () => void | Promise<void>;
/**
 * 任务类型
 */
type TaskType = 'cron' | 'timeout' | 'interval';
/**
 * 任务信息
 */
interface TaskInfo {
  /** 任务 ID */
  id: string;
  /** 任务类型 */
  type: TaskType;
  /** 下次执行时间 */
  nextRun?: Date;
  /** 是否正在运行 */
  running: boolean;
}
/**
 * 任务调度器
 *
 * 支持 Cron 表达式、延迟执行和定时执行三种任务类型。
 *
 * @example
 * ```typescript
 * const scheduler = new Scheduler()
 *
 * // Cron 任务
 * scheduler.schedule('backup', '0 2 * * *', async () => {
 *   await backupDatabase()
 * })
 *
 * // 延迟执行
 * scheduler.once('cleanup', 3600000, () => {
 *   cleanupTempFiles()
 * })
 *
 * // 定时执行
 * scheduler.interval('heartbeat', 30000, () => {
 *   sendHeartbeat()
 * })
 *
 * scheduler.start()
 * ```
 */
declare class Scheduler {
  private readonly tasks;
  private running;
  schedule(id: string, cron: string | CronExpression, task: TaskFunction): void;
  /**
   * 调度延迟执行任务（只执行一次）
   *
   * @param id - 任务唯一标识
   * @param delay - 延迟时间（毫秒）
   * @param task - 要执行的任务函数
   * @throws {Error} 当 delay 小于 0 时抛出错误
   */
  once(id: string, delay: number, task: TaskFunction): void;
  /**
   * 调度定时执行任务（重复执行）
   *
   * @param id - 任务唯一标识
   * @param interval - 执行间隔（毫秒）
   * @param task - 要执行的任务函数
   * @throws {Error} 当 interval 小于等于 0 时抛出错误
   */
  interval(id: string, interval: number, task: TaskFunction): void;
  /**
   * 取消任务
   *
   * @param id - 任务 ID
   * @returns 如果任务存在并成功取消返回 `true`，否则返回 `false`
   */
  cancel(id: string): boolean;
  /**
   * 启动调度器
   *
   * 开始执行所有已添加的任务。如果调度器已经在运行，则不会重复启动。
   */
  start(): void;
  /**
   * 停止调度器
   *
   * 停止所有任务的执行，但不会删除任务。可以再次调用 `start()` 恢复执行。
   */
  stop(): void;
  /**
   * 获取指定任务的信息
   *
   * @param id - 任务 ID
   * @returns 任务信息，如果任务不存在返回 `undefined`
   */
  getTask(id: string): TaskInfo | undefined;
  /**
   * 获取所有任务的信息
   *
   * @returns 所有任务的信息数组
   */
  getTasks(): TaskInfo[];
  private addTask;
  private planTask;
  private planCronTask;
  private planTimeoutTask;
  private planIntervalTask;
  private executeTask;
}
//#endregion
export { CacheAdapter, ConfigFormat, ConsoleTransport, ConsoleTransportOptions, CpuInfo, CpuUsage, CronExpression, CronFieldConfig, DirEntry, DiskInfo, EnvDefinition, EnvRecord, EnvSchema, EnvValueType, FileCache, FileCacheOptions, FileTransport, FileTransportOptions, GetLocalIPOptions, GetNetworkInterfacesOptions, LRUCache, LRUCacheOptions, LoadConfigOptions, LoadEnvOptions, LogEntry, LogFormat, LogLevel, Logger, LoggerOptions, MemoizeOptions, MemoryInfo, MoveOptions, NetworkInterfaceInfo, PortCheckOptions, ReadDirOptions, ReadJsonOptions, RemoveOptions, Scheduler, TaskFunction, TaskInfo, TextFormatConfig, TextFormatVars, TextFormatter, Transport, WriteFileData, WriteFileOptions, WriteJsonOptions, copyFile, cp, emptyDir, ensureDir, existsSync, getCpuInfo, getCpuUsage, getDiskInfo, getLocalIP, getMemoryInfo, getNetworkInterfaces, isPortAvailable, loadConfig, loadEnv, memoize, mergeConfig, movePath, parseCron, parseEnv, parseEnvFile, readDir, readFile, readJson, removePath, writeFile, writeJson };