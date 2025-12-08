import { spawn } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { GitError } from './errors'

/**
 * 执行 git 命令
 * @param cwd - 工作目录
 * @param args - git 命令参数
 * @returns 命令输出
 * @throws {GitError} 当 git 命令执行失败时
 */
export async function execGit(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    proc.on('error', error => {
      const command = `git ${args.join(' ')}`
      reject(new GitError(`执行 git 命令失败: ${command}`, command, error))
    })

    proc.on('close', exitCode => {
      if (exitCode !== 0) {
        const command = `git ${args.join(' ')}`
        const errorMessage = stderr || `Git 命令退出码: ${exitCode}`
        reject(
          new GitError(
            `执行 git 命令失败: ${command}`,
            command,
            new Error(errorMessage)
          )
        )
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

/**
 * 并行处理工具
 *
 * 支持并发控制和进度回调，适用于需要限制并发数的异步任务处理
 *
 * @param items - 待处理项目列表
 * @param processor - 处理函数
 * @param options - 选项
 * @returns 处理结果列表
 *
 * @example
 * ```ts
 * const results = await parallelProcess(
 *   [1, 2, 3, 4, 5],
 *   async (item) => item * 2,
 *   { concurrency: 2, onProgress: (completed, total) => console.log(`${completed}/${total}`) }
 * )
 * ```
 */
export async function parallelProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    /** 并发数（默认 5） */
    concurrency?: number
    /** 进度回调 */
    onProgress?: (completed: number, total: number) => void
  } = {}
): Promise<R[]> {
  const { concurrency = 5, onProgress } = options

  if (concurrency <= 0) {
    throw new Error('并发数必须大于 0')
  }

  if (items.length === 0) {
    return []
  }

  const results: R[] = []
  let completed = 0

  // 分批处理
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex))
    )
    results.push(...batchResults)

    completed += batch.length
    onProgress?.(completed, items.length)
  }

  return results
}

/**
 * 读取 JSON 文件并解析为对象
 *
 * @param filePath - JSON 文件路径
 * @returns 解析后的数据
 * @throws {Error} 当文件不存在或 JSON 格式错误时抛出错误
 *
 * @example
 * ```ts
 * const pkg = await readJson<{ name: string; version: string }>('./package.json')
 * console.log(pkg.name)
 * ```
 */
export async function readJson<T = Record<string, unknown>>(
  filePath: string
): Promise<T> {
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(content)
}

/**
 * 写入 JSON 文件选项
 */
export interface WriteJsonOptions {
  /** 缩进空格数，默认 2 */
  space?: number
  /** 文件末尾换行符，默认 '\n' */
  eol?: string
}

/**
 * 将数据序列化为 JSON 文件
 *
 * 如果目录不存在会自动创建。文件末尾会自动添加换行符。
 *
 * @param filePath - 目标文件路径
 * @param data - 待写入的数据
 * @param options - 缩进等选项
 * @throws {Error} 当文件写入失败时抛出错误
 *
 * @example
 * ```ts
 * await writeJson('./config.json', { port: 3000, debug: false })
 *
 * // 自定义格式
 * await writeJson('./data.json', data, { space: 4, eol: '\r\n' })
 * ```
 */
export async function writeJson(
  filePath: string,
  data: unknown,
  options: WriteJsonOptions = {}
): Promise<void> {
  const { space = 2, eol = '\n' } = options
  const json = JSON.stringify(data, null, space) + eol

  // 确保父目录存在
  const dir = dirname(filePath)
  await mkdir(dir, { recursive: true })

  await writeFile(filePath, json, 'utf8')
}
