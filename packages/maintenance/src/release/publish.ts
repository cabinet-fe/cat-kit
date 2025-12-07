import { spawn } from 'node:child_process'
import { PublishError } from '../errors'
import type { PublishOptions, PublishResult } from './types'

/**
 * 以 promise 形式执行子进程命令
 * @param cwd - 工作目录
 * @param args - 命令参数
 * @returns 标准输出
 * @throws {PublishError} 当命令失败时
 */
async function execNpm(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    proc.on('error', error => {
      const command = `npm ${args.join(' ')}`
      reject(new PublishError(`执行 npm 命令失败: ${command}`, command, error))
    })

    proc.on('close', code => {
      if (code !== 0) {
        const command = `npm ${args.join(' ')}`
        reject(
          new PublishError(
            `npm 命令执行失败: ${command}`,
            command,
            new Error(stderr || `退出码 ${code}`)
          )
        )
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

/**
 * 发布 npm 包，支持自定义 registry
 * @param options - 发布配置
 * @returns 发布结果
 * @throws {PublishError} 当发布失败时
 * @example
 * ```ts
 * await publishPackage({
 *   cwd: '/path/to/pkg',
 *   registry: 'https://registry.npmmirror.com',
 *   tag: 'next',
 *   otp: '123456'
 * })
 * ```
 */
export async function publishPackage(
  options: PublishOptions
): Promise<PublishResult> {
  const {
    cwd,
    registry,
    tag,
    otp,
    dryRun = false,
    access,
    provenance = false
  } = options

  const args = ['publish']

  if (registry) {
    args.push('--registry', registry)
  }

  if (tag) {
    args.push('--tag', tag)
  }

  if (access) {
    args.push('--access', access)
  }

  if (dryRun) {
    args.push('--dry-run')
  }

  if (otp) {
    args.push('--otp', otp)
  }

  if (provenance) {
    args.push('--provenance')
  }

  const output = await execNpm(cwd, args)

  return { output }
}
