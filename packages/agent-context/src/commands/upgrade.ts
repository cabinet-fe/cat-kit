import { execSync } from 'node:child_process'

const PKG = '@cat-kit/agent-context'

function getRegistryLatestVersion(): string {
  return execSync(`npm view ${PKG} version`, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

function getGlobalInstalledVersion(): string | null {
  let out: string
  try {
    out = execSync(`npm list -g ${PKG} --depth=0 --json`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'stdout' in e) {
      const raw = (e as { stdout: string | Buffer }).stdout
      out = typeof raw === 'string' ? raw : raw.toString('utf-8')
    } else {
      return null
    }
  }
  try {
    const data = JSON.parse(out) as { dependencies?: Record<string, { version?: string }> }
    const v = data.dependencies?.[PKG]?.version
    return typeof v === 'string' && v.length > 0 ? v : null
  } catch {
    return null
  }
}

/** @returns 负数 a 小于 b，0 相等，正数 a 大于 b（仅比较数字段，与常见 x.y.z 一致） */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((p) => parseInt(/^\d+/.exec(p)?.[0] ?? '0', 10))
  const pb = b.split('.').map((p) => parseInt(/^\d+/.exec(p)?.[0] ?? '0', 10))
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0
    const db = pb[i] ?? 0
    if (da !== db) return da - db
  }
  return 0
}

export function upgradeCommand(): void {
  let latest: string
  try {
    latest = getRegistryLatestVersion()
  } catch {
    console.error('无法获取注册表最新版本，请检查网络与 npm 配置。')
    process.exitCode = 1
    return
  }

  const installed = getGlobalInstalledVersion()

  if (!installed) {
    console.error(`\n未检测到全局安装的 ${PKG}，请先执行: npm install -g ${PKG}`)
    process.exitCode = 1
    return
  }

  if (compareSemver(installed, latest) >= 0) {
    console.log(`\n当前已是最新版本（${installed}），无需升级。`)
    return
  }

  const pre = installed
  console.log(`\n开始升级 ${PKG}...`)
  try {
    execSync(`npm update -g ${PKG}`, { stdio: 'inherit' })
    const post = getGlobalInstalledVersion() ?? latest
    console.log(`\n升级完成: ${pre} -> ${post}`)
  } catch {
    console.error(`\n升级失败，请手动执行: npm update -g ${PKG}`)
    process.exitCode = 1
  }
}
