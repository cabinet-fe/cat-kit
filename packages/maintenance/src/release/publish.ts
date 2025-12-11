import { $ } from 'execa'
import { PublishError } from '../errors'
import type { PublishOptions, PublishResult } from './types'

/**
 * 发布 npm 包，支持自定义 registry
 *
 * 使用实时输出模式，让用户可以看到发布进度。
 *
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

  const args: string[] = []

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

  const command = `npm publish ${args.join(' ')}`.trim()

  try {
    // 使用 stdio: 'inherit' 实时输出发布进度到控制台
    await $({ cwd, stdio: 'inherit' })`npm publish ${args}`
    return { output: '' }
  } catch (error) {
    throw new PublishError(`npm 命令执行失败: ${command}`, command, error as Error)
  }
}
