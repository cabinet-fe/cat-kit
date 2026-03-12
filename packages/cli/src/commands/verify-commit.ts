import { readFile } from 'node:fs/promises'

/**
 * 核心校验逻辑 (无副作用，易于测试)
 */
export function verifyCommitMessage(message: string): { valid: boolean; reason?: string } {
  const commitRE = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: .+/

  if (!commitRE.test(message)) {
    return {
      valid: false,
      reason: '提交信息格式错误。请使用 feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert 等前缀。',
    }
  }

  return { valid: true }
}

/**
 * CLI 命令适配器
 */
export async function verifyCommitAction(
  file: string | undefined,
  options: { message?: string },
  _command: any
): Promise<void> {
  let message = ''

  if (options.message) {
    message = options.message
  } else if (file) {
    try {
      message = await readFile(file, 'utf8')
    } catch (err) {
      console.error(`无法读取文件: ${file}`)
      if (err instanceof Error) {
        console.error(err.message)
      }
      process.exit(1)
    }
  } else {
    // 从 stdin 读取
    message = await readFromStdin()
  }

  const { valid, reason } = verifyCommitMessage(message.trim())

  if (!valid) {
    console.error(`❌ 提交验证失败: ${reason}`)
    process.exit(1)
  }

  console.log('✅ 提交验证通过')
}

async function readFromStdin(): Promise<string> {
  let result = ''
  process.stdin.setEncoding('utf8')
  for await (const chunk of process.stdin) {
    result += chunk
  }
  return result
}
