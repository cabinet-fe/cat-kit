// 按 git 改动映射受影响的包，用 turbo 只跑相关包的测试。
// 过滤用 `...@cat-kit/<pkg>`：该包 + 依赖它的下游包（core 变了也要重测 fe/http 等）。
// 根级文件（bun.lock、根 package.json、turbo.json、tsconfig*.json 等）影响面全局，回退全量；
// 纯文档 / changeset / scripts 改动跳过。全量回归留给 CI（release.yml）与发版前。
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'

function gitLines(cmd: string): string[] {
  return execSync(cmd, { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

// 目录名 → 包名（@cat-kit/<pkg>），供 turbo --filter 使用
const pkgNames = new Map<string, string>()
for (const dir of readdirSync('packages')) {
  try {
    const manifest = JSON.parse(readFileSync(`packages/${dir}/package.json`, 'utf8'))
    if (typeof manifest.name === 'string') pkgNames.set(dir, manifest.name)
  } catch {
    // 非包目录（无 package.json）忽略
  }
}

const changed = new Set([
  ...gitLines('git diff --name-only HEAD'),
  ...gitLines('git ls-files --others --exclude-standard')
])

if (changed.size === 0) {
  console.log('无改动，跳过测试')
  process.exit(0)
}

const filters = new Set<string>()
let runAll = false

for (const file of changed) {
  const pkg = file.match(/^packages\/([^/]+)\//)?.[1]
  if (pkg) {
    const name = pkgNames.get(pkg)
    if (!name) {
      runAll = true
      break
    }
    // 前缀 ... = 该包及其下游依赖者
    filters.add(`...${name}`)
  } else if (
    /\.(md|mdx)$/.test(file) ||
    file.startsWith('.agents/') ||
    file.startsWith('.changeset/') ||
    file.startsWith('docs/') ||
    file.startsWith('agent-docs/')
  ) {
    // 文档与 changeset 不触发测试
  } else if (file.startsWith('scripts/')) {
    // 仓库级脚本（release.ts 等）无单测覆盖
  } else {
    // 根级配置 / .github / 其他未知文件：影响面全局
    runAll = true
    break
  }
}

const dryRun = process.argv.includes('--dry-run')

if (runAll) {
  console.log('根级文件有改动，跑全量测试')
  if (!dryRun) execSync('bunx turbo run test', { stdio: 'inherit' })
} else if (filters.size === 0) {
  console.log('只有文档 / changeset / scripts 改动，跳过测试')
} else {
  console.log(
    `跑受影响包（含下游）：${[...filters].map((f) => f.replace(/^\.\.\./, '')).join(' ')}`
  )
  if (!dryRun)
    execSync(`bunx turbo run test ${[...filters].map((f) => `--filter=${f}`).join(' ')}`, {
      stdio: 'inherit'
    })
}
