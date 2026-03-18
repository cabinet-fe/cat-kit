import { readFile } from 'node:fs/promises'

const DEFAULT_COMMIT_MSG_FILE = '.git/COMMIT_EDITMSG'

/**
 * 核心校验逻辑 (无副作用，易于测试)
 */
export function verifyCommitMessage(message: string): { valid: boolean; reason?: string } {
  const commitRE =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|release)(\(.+\))?!?: .+/

  if (!commitRE.test(message)) {
    return {
      valid: false,
      reason:
        '提交信息格式错误。请使用 feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert 等前缀。'
    }
  }

  return { valid: true }
}

export function stripComments(raw: string): string {
  return raw.replace(/^#.*$/gm, '').trim()
}

/**
 * CLI 命令适配器
 *
 * 消息来源优先级: --message > file 参数 > .git/COMMIT_EDITMSG
 */
export async function verifyCommitAction(
  file: string | undefined,
  options: { message?: string },
  _command: any
): Promise<void> {
  let message = ''

  if (options.message) {
    message = options.message.trim()
  } else {
    const targetFile = file ?? DEFAULT_COMMIT_MSG_FILE
    try {
      message = stripComments(await readFile(targetFile, 'utf8'))
    } catch (err) {
      console.error(`无法读取文件: ${targetFile}`)
      if (err instanceof Error) {
        console.error(err.message)
      }
      process.exit(1)
    }
  }

  const { valid, reason } = verifyCommitMessage(message)

  if (!valid) {
    console.error(`❌ 提交验证失败: ${reason}`)
    process.exit(1)
  }

  console.log('✅ 提交验证通过')
}
