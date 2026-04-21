#!/usr/bin/env bun
/**
 * 本地半自动发布流水线：
 *
 * 1. 解析 .changeset/*.md 影响的包集合（fixed 组整体展开）
 * 2. 交互/CLI 指定本轮要发的包范围
 * 3. 强一致校验：待消费 changeset 与本轮选择必须严格相等
 * 4. 本地执行 `changeset version` + commit + push
 *
 * push 后，`.github/workflows/release.yml` 监听 main 分支上
 * `packages/*\/CHANGELOG.md` 的路径变更自动触发；远端 Actions 负责
 * 构建、测试、`changeset publish`、per-pkg tag、GitHub Release。
 *
 * 用法：
 *   bun run release                        # 交互式
 *   bun run release --select fixed,cli     # 非交互
 *   bun run release --dry-run              # 跑到 version 并回滚
 *   bun run release --force                # 跳过非 main 分支检查
 */

import { spawnSync, type SpawnSyncOptions } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkbox } from '@inquirer/prompts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const CHANGESET_DIR = join(REPO_ROOT, '.changeset')

const FIXED_GROUP = ['@cat-kit/core', '@cat-kit/http', '@cat-kit/fe', '@cat-kit/be'] as const

const INDEPENDENT_PKGS = [
  '@cat-kit/cli',
  '@cat-kit/agent-context',
  '@cat-kit/vitepress-theme',
  '@cat-kit/tsconfig'
] as const

type SelectableUnit = { id: string; label: string; packages: readonly string[]; shortName: string }

const SELECTABLE_UNITS: readonly SelectableUnit[] = [
  {
    id: 'fixed',
    label: 'core / http / fe / be（fixed 组）',
    packages: FIXED_GROUP,
    shortName: 'fixed'
  },
  { id: 'cli', label: '@cat-kit/cli', packages: ['@cat-kit/cli'], shortName: 'cli' },
  {
    id: 'agent-context',
    label: '@cat-kit/agent-context',
    packages: ['@cat-kit/agent-context'],
    shortName: 'agent-context'
  },
  {
    id: 'vitepress-theme',
    label: '@cat-kit/vitepress-theme',
    packages: ['@cat-kit/vitepress-theme'],
    shortName: 'vitepress-theme'
  },
  {
    id: 'tsconfig',
    label: '@cat-kit/tsconfig',
    packages: ['@cat-kit/tsconfig'],
    shortName: 'tsconfig'
  }
]

const UNIT_BY_ID = new Map(SELECTABLE_UNITS.map((u) => [u.id, u]))
const ALL_PKGS = new Set<string>([...FIXED_GROUP, ...INDEPENDENT_PKGS])

const ROLLBACK_HELP = `\n若 CI 发布失败：\n  1. 在 GitHub Actions 页面重跑该次 workflow run（同一 commit 继续 publish，无需重跑 version）。\n  2. 若需完全回滚本次本地 commit（CI 尚未 publish）：\n       git reset --hard HEAD~1\n       git push --force-with-lease origin main\n`

type CliArgs = { dryRun: boolean; select: string | null; force: boolean; help: boolean }

function parseArgs(argv: readonly string[]): CliArgs {
  const args: CliArgs = { dryRun: false, select: null, force: false, help: false }
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === '--dry-run') {
      args.dryRun = true
    } else if (token === '--force') {
      args.force = true
    } else if (token === '--help' || token === '-h') {
      args.help = true
    } else if (token === '--select') {
      args.select = argv[++i] ?? ''
    } else if (token && token.startsWith('--select=')) {
      args.select = token.slice('--select='.length)
    } else {
      throw new Error(`未知参数: ${token}`)
    }
  }
  return args
}

function printHelp(): void {
  const units = SELECTABLE_UNITS.map((u) => `    ${u.id.padEnd(18)} ${u.label}`).join('\n')
  console.log(`用法：bun run release [flags]

flags：
  --dry-run              走完前置 1-5 阶段后回滚（不 commit/push）
  --select <csv>         非交互式指定单元 id，如 fixed,cli
  --force                允许非 main 分支执行
  -h, --help             打印本帮助

可选单元（至少选 1）：
${units}
${ROLLBACK_HELP}`)
}

type RunResult = { code: number; stdout: string; stderr: string }

function run(cmd: string, args: readonly string[], opts: SpawnSyncOptions = {}): RunResult {
  const res = spawnSync(cmd, args as string[], { cwd: REPO_ROOT, encoding: 'utf8', ...opts })
  return {
    code: res.status ?? -1,
    stdout: typeof res.stdout === 'string' ? res.stdout : '',
    stderr: typeof res.stderr === 'string' ? res.stderr : ''
  }
}

function runCapture(cmd: string, args: readonly string[]): RunResult {
  return run(cmd, args)
}

function runInherit(
  cmd: string,
  args: readonly string[],
  extraEnv: Record<string, string> | null = null
): number {
  const res = spawnSync(cmd, args as string[], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: extraEnv ? { ...process.env, ...extraEnv } : process.env
  })
  return res.status ?? -1
}

function fatal(msg: string, extra: string | null = null): never {
  console.error(`[release] ✗ ${msg}`)
  if (extra) console.error(extra)
  console.error(ROLLBACK_HELP)
  process.exit(1)
}

async function listChangesetFiles(): Promise<string[]> {
  const entries = await readdir(CHANGESET_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
    .map((e) => join(CHANGESET_DIR, e.name))
}

async function parseChangesetPkgs(filePath: string): Promise<string[]> {
  const raw = await readFile(filePath, 'utf8')
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return []

  const body = match[1] ?? ''
  const pkgs: string[] = []
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const m = trimmed.match(/^['"]?(@[^'":\s]+\/[^'":\s]+)['"]?\s*:\s*(patch|minor|major)\s*$/)
    if (m && m[1]) pkgs.push(m[1])
  }
  return pkgs
}

async function resolveAffectedPkgs(files: readonly string[]): Promise<Set<string>> {
  const affected = new Set<string>()
  for (const f of files) {
    for (const p of await parseChangesetPkgs(f)) {
      if (ALL_PKGS.has(p)) affected.add(p)
    }
  }

  let hasFixedHit = false
  for (const p of FIXED_GROUP) {
    if (affected.has(p)) {
      hasFixedHit = true
      break
    }
  }
  if (hasFixedHit) {
    for (const p of FIXED_GROUP) affected.add(p)
  }
  return affected
}

function expandUnits(ids: readonly string[]): Set<string> {
  const out = new Set<string>()
  for (const id of ids) {
    const unit = UNIT_BY_ID.get(id)
    if (!unit) {
      throw new Error(`未知单元 id: ${id}。合法值：${SELECTABLE_UNITS.map((u) => u.id).join(', ')}`)
    }
    for (const p of unit.packages) out.add(p)
  }
  return out
}

function unitsForPkgs(pkgs: ReadonlySet<string>): SelectableUnit[] {
  const hit: SelectableUnit[] = []
  for (const unit of SELECTABLE_UNITS) {
    if (unit.packages.some((p) => pkgs.has(p))) hit.push(unit)
  }
  return hit
}

async function ensureCleanWorkTree(): Promise<void> {
  const r = runCapture('git', ['status', '--porcelain'])
  if (r.code !== 0) fatal(`git status 失败（exit ${r.code}）`, r.stderr)
  if (r.stdout.trim()) {
    fatal('工作区非干净，请先提交或暂存变更：', r.stdout)
  }
}

async function ensureBranchOk(force: boolean): Promise<void> {
  const r = runCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
  if (r.code !== 0) fatal(`git rev-parse 失败（exit ${r.code}）`, r.stderr)
  const branch = r.stdout.trim()
  if (branch !== 'main') {
    if (!force) {
      fatal(`当前分支为 ${branch}，release 仅允许在 main 执行；如需继续请加 --force`)
    }
    console.warn(`[release] ! 非 main 分支（${branch}），已通过 --force 跳过检查`)
  }
}

async function ensureUpToDate(): Promise<void> {
  const fetch = run('git', ['fetch', 'origin', 'main', '--quiet'])
  if (fetch.code !== 0) fatal('git fetch origin main 失败', fetch.stderr)
  const r = runCapture('git', ['rev-list', '--count', 'HEAD..origin/main'])
  if (r.code !== 0) fatal('git rev-list 失败', r.stderr)
  const behind = Number.parseInt(r.stdout.trim(), 10)
  if (Number.isFinite(behind) && behind > 0) {
    fatal(`本地落后于 origin/main（${behind} commits），请先 git pull --rebase`)
  }
}

async function resolveGhToken(): Promise<string> {
  const r = runCapture('gh', ['auth', 'token'])
  if (r.code !== 0) {
    fatal('无法获取 GitHub token。', '请安装 GitHub CLI 并执行 `gh auth login` 后重试。')
  }
  const token = r.stdout.trim()
  if (!token) fatal('`gh auth token` 返回空值')
  return token
}

function printSet(label: string, items: Iterable<string>): void {
  const arr = [...items].sort()
  if (!arr.length) {
    console.log(`  ${label}: (空)`)
    return
  }
  console.log(`  ${label}:`)
  for (const p of arr) console.log(`    - ${p}`)
}

async function chooseSelection(
  affectedUnits: readonly SelectableUnit[],
  cliSelect: string | null
): Promise<Set<string>> {
  if (cliSelect !== null) {
    const raw = cliSelect
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!raw.length) {
      fatal('--select 不能为空；合法 id：' + SELECTABLE_UNITS.map((u) => u.id).join(', '))
    }
    return expandUnits(raw)
  }

  const choices = SELECTABLE_UNITS.map((u) => ({
    name: u.label,
    value: u.id,
    checked: affectedUnits.some((a) => a.id === u.id)
  }))

  const selected = await checkbox<string>({
    message: '选择本轮要发布的包（空格切换、回车确认）',
    choices,
    required: true
  })

  if (!selected.length) fatal('未选择任何发布单元')
  return expandUnits(selected)
}

function ensureConsistency(effective: ReadonlySet<string>, selected: ReadonlySet<string>): void {
  const diffA = [...effective].filter((p) => !selected.has(p))
  const diffB = [...selected].filter((p) => !effective.has(p))
  if (diffA.length === 0 && diffB.length === 0) return

  console.error('[release] ✗ 待发布包集合与选择集合不一致：')
  if (diffA.length) {
    console.error('  - 有待消费 changeset 但未被选中（违反纪律）：')
    for (const p of diffA.sort()) console.error(`      · ${p}`)
  }
  if (diffB.length) {
    console.error('  - 被选中但无待消费 changeset：')
    for (const p of diffB.sort()) console.error(`      · ${p}`)
  }
  console.error('请：1) 补录/移除 changeset 或 2) 调整本轮选择。')
  console.error(ROLLBACK_HELP)
  process.exit(1)
}

function commitTitleFor(selected: ReadonlySet<string>): string {
  const ids = new Set<string>()
  for (const unit of SELECTABLE_UNITS) {
    const allIn = unit.packages.every((p) => selected.has(p))
    if (allIn) ids.add(unit.id)
  }
  const shortNames = SELECTABLE_UNITS.filter((u) => ids.has(u.id)).map((u) => u.shortName)
  return `chore(release): publish ${shortNames.join(', ')}`
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  console.log('[release] 阶段 1/7：前置检查')
  await ensureCleanWorkTree()
  await ensureBranchOk(args.force)
  await ensureUpToDate()

  const changesetFiles = await listChangesetFiles()
  if (!changesetFiles.length) {
    fatal('未发现待消费的 changeset（.changeset/*.md）；请先执行 `bun run changeset`')
  }

  const token = await resolveGhToken()

  console.log('[release] 阶段 2/7：解析 changeset 影响包集合')
  const affected = await resolveAffectedPkgs(changesetFiles)
  if (!affected.size) {
    fatal('解析 changeset 未得到任何 @cat-kit/* 包，请检查文件 frontmatter')
  }
  printSet('影响包（fixed 组已展开）', affected)

  console.log('[release] 阶段 3/7：选择发布范围')
  const affectedUnits = unitsForPkgs(affected)
  const selected = await chooseSelection(affectedUnits, args.select)
  printSet('本轮选择', selected)

  console.log('[release] 阶段 4/7：一致性校验')
  ensureConsistency(affected, selected)
  console.log('[release] ✓ 选择与 changeset 影响包集合一致')

  console.log('[release] 阶段 5/7：执行 changeset version')
  const versionCode = runInherit('bunx', ['changeset', 'version'], { GITHUB_TOKEN: token })
  if (versionCode !== 0) fatal('`changeset version` 失败')

  const installCode = runInherit('bun', ['install'])
  if (installCode !== 0) fatal('`bun install` 失败')

  if (args.dryRun) {
    console.log('[release] (dry-run) 阶段 6-7 跳过，回滚本地变更')
    const restore = runInherit('git', ['restore', '--', '.'])
    if (restore !== 0) {
      console.warn('[release] ! git restore 失败，请手动检查工作区')
    }
    return
  }

  console.log('[release] 阶段 6/7：提交产物')
  const title = commitTitleFor(selected)
  const addCode = runInherit('git', ['add', '.changeset', 'packages', 'package.json', 'bun.lock'])
  if (addCode !== 0) fatal('git add 失败')

  const diff = runCapture('git', ['diff', '--cached', '--quiet'])
  if (diff.code === 0) {
    fatal('暂存区无变更，changeset version 可能未产生差异')
  }

  const commit = runInherit('git', ['commit', '-m', title])
  if (commit !== 0) fatal('git commit 失败')

  console.log('[release] 阶段 7/7：推送（push 后远端 Actions 自动触发）')
  const push = runInherit('git', ['push', 'origin', 'HEAD'])
  if (push !== 0) fatal('git push 失败')

  const packagesArg = [...selected].sort().join(',')
  const head = runCapture('git', ['rev-parse', '--short', 'HEAD'])
  const sha = head.stdout.trim()
  console.log(
    `\n✓ 已推送发布 commit，远端 release workflow 将由 packages/*/CHANGELOG.md 变更自动触发`
  )
  console.log(`  分支:   main`)
  console.log(`  提交:   ${sha}`)
  console.log(`  包:     ${packagesArg}`)
  console.log(`  查看:   https://github.com/cabinet-fe/cat-kit/actions/workflows/release.yml`)
}

main().catch((err: unknown) => {
  if (err instanceof Error) {
    if (err.name === 'ExitPromptError') {
      console.error('[release] ✗ 用户取消')
      process.exit(130)
    }
    console.error(`[release] ✗ ${err.message}`)
  } else {
    console.error('[release] ✗ 未知错误', err)
  }
  console.error(ROLLBACK_HELP)
  process.exit(1)
})
