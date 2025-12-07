import { execGit } from '../utils'
import { GitCommitAndPushOptions, GitCommitResult, GitTagOptions, GitTagResult } from './types'

/**
 * 创建 git tag（可选推送）
 * @param options - 创建配置
 * @returns 创建结果
 * @throws {GitError} 当 git 命令执行失败时
 * @example
 * ```ts
 * await createGitTag({
 *   cwd: '/path/to/repo',
 *   tag: 'v1.2.3',
 *   message: '发布 1.2.3',
 *   push: true
 * })
 * ```
 */
export async function createGitTag(options: GitTagOptions): Promise<GitTagResult> {
  const { cwd, tag, message, push = false, remote = 'origin', force = false } = options

  if (!tag.trim()) {
    throw new Error('tag 名称不能为空')
  }

  const args = ['tag']
  if (force) {
    args.push('-f')
  }
  if (message && message.trim()) {
    args.push('-a', tag, '-m', message.trim())
  } else {
    args.push(tag)
  }

  await execGit(cwd, args)

  if (push) {
    const pushArgs = ['push', remote, tag]
    if (force) {
      pushArgs.push('--force')
    }
    await execGit(cwd, pushArgs)
  }

  return { tag }
}

/**
 * 提交并推送代码（可选推送 tag）
 * @param options - 提交与推送配置
 * @returns 提交结果
 * @throws {GitError} 当 git 命令执行失败时
 * @example
 * ```ts
 * await commitAndPush({
 *   cwd: '/path/to/repo',
 *   message: 'chore: release',
 *   pushTags: true
 * })
 * ```
 */
export async function commitAndPush(
  options: GitCommitAndPushOptions
): Promise<GitCommitResult> {
  const {
    cwd,
    message,
    addAll = true,
    allowEmpty = false,
    remote = 'origin',
    branch: specifiedBranch,
    pushTags = false
  } = options

  if (!message.trim()) {
    throw new Error('提交信息不能为空')
  }

  if (addAll) {
    await execGit(cwd, ['add', '-A'])
  }

  const commitArgs = ['commit', '-m', message.trim()]
  if (allowEmpty) {
    commitArgs.push('--allow-empty')
  }
  await execGit(cwd, commitArgs)

  const branch =
    specifiedBranch ||
    (await execGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])).trim()

  await execGit(cwd, ['push', remote, branch])

  if (pushTags) {
    await execGit(cwd, ['push', remote, '--tags'])
  }

  const commitHash = await execGit(cwd, ['rev-parse', 'HEAD'])

  return {
    commitHash,
    branch
  }
}
