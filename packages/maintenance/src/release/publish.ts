import { $ } from 'execa'
import { PublishError } from '../errors'
import type { PublishOptions, PublishResult } from './types'

/**
 * 发布 npm 包
 *
 * 支持三种发布模式：
 * 1. **单包发布**：仅提供 `cwd`，发布该目录下的包
 * 2. **指定工作区发布**：提供 `workspace` 数组，使用 npm 原生 `--workspace` 参数
 * 3. **全部工作区发布**：设置 `workspaces: true`，使用 npm 原生 `--workspaces` 参数
 *
 * 使用实时输出模式，让用户可以看到发布进度。
 *
 * @param options - 发布配置
 * @returns 发布结果
 * @throws {PublishError} 当发布失败时
 *
 * @example
 * ```ts
 * // 单包发布
 * await publishPackage({
 *   cwd: '/path/to/pkg',
 *   registry: 'https://registry.npmmirror.com',
 *   tag: 'next'
 * })
 *
 * // 发布指定工作区
 * await publishPackage({
 *   cwd: '/path/to/monorepo',
 *   workspace: ['@cat-kit/core', '@cat-kit/fe'],
 *   access: 'public'
 * })
 *
 * // 发布所有工作区
 * await publishPackage({
 *   cwd: '/path/to/monorepo',
 *   workspaces: true,
 *   access: 'public'
 * })
 * ```
 */
export async function publishPackage(
  options: PublishOptions
): Promise<PublishResult> {
  const {
    cwd,
    workspace,
    workspaces,
    includeWorkspaceRoot,
    registry,
    tag,
    otp,
    dryRun = false,
    access,
    provenance = false,
    provenanceFile
  } = options

  // 验证 provenance 和 provenanceFile 互斥
  if (provenance && provenanceFile) {
    throw new PublishError(
      'provenance 和 provenanceFile 不能同时使用',
      'npm publish',
      new Error('provenance 和 provenanceFile 互斥')
    )
  }

  const args = buildPublishArgs({
    workspace,
    workspaces,
    includeWorkspaceRoot,
    registry,
    tag,
    otp,
    dryRun,
    access,
    provenance,
    provenanceFile
  })

  const command = `npm publish ${args.join(' ')}`.trim()

  try {
    // 使用 stdio: 'inherit' 实时输出发布进度到控制台
    await $({ cwd, stdio: 'inherit' })`npm publish ${args}`
    return { output: '' }
  } catch (error) {
    // 提取 execa 错误中的 stderr 信息
    const execaError = error as { stderr?: string; message?: string }
    const stderr = execaError.stderr?.trim()
    const errorMessage = stderr || execaError.message || '未知错误'

    throw new PublishError(
      `npm 命令执行失败: ${command}\n${errorMessage}`,
      command,
      error as Error
    )
  }
}

/**
 * 构建 npm publish 命令参数
 */
function buildPublishArgs(options: {
  workspace?: string[]
  workspaces?: boolean
  includeWorkspaceRoot?: boolean
  registry?: string
  tag?: string
  otp?: string
  dryRun?: boolean
  access?: 'public' | 'restricted'
  provenance?: boolean
  provenanceFile?: string
}): string[] {
  const {
    workspace,
    workspaces,
    includeWorkspaceRoot,
    registry,
    tag,
    otp,
    dryRun,
    access,
    provenance,
    provenanceFile
  } = options

  const args: string[] = []

  // 工作区参数
  if (workspace && workspace.length > 0) {
    for (const ws of workspace) {
      args.push('--workspace', ws)
    }
  }

  if (workspaces) {
    args.push('--workspaces')
  }

  if (includeWorkspaceRoot) {
    args.push('--include-workspace-root')
  }

  // 通用参数
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

  // provenance 参数（互斥）
  if (provenance) {
    args.push('--provenance')
  } else if (provenanceFile) {
    args.push('--provenance-file', provenanceFile)
  }

  return args
}
