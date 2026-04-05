import { execSync } from 'node:child_process'

export function upgradeCommand(): void {
  console.log('开始升级 @cat-kit/agent-context...')
  try {
    execSync('npm update -g @cat-kit/agent-context', { stdio: 'inherit' })
    console.log('\n升级完成。')
  } catch {
    console.error('\n升级失败，请手动执行: npm update -g @cat-kit/agent-context')
    process.exitCode = 1
  }
}
