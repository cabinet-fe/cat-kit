#!/usr/bin/env bun
/**
 * 将各 @cat-kit/* 发布物 typings（或 tsconfig JSON 预设）镜像到 skills/cat-kit-<pkg>/generated/，
 * 供按包拆分的 Cursor 技能离线查阅；与 npm 包内 dist / files 对齐。
 *
 * 用法（仓库根目录）：
 *   bun run sync-cat-kit-skills-api              # 仅复制（需已构建 dist）
 *   bun run sync-cat-kit-skills-api -- --build   # 先 tsdown / tsc 再复制
 */

import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'

import { buildLib } from '../packages/maintenance/src/build/build.ts'
import { copyAssetsToDist } from '../release/copy-assets.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

type Platform = 'neutral' | 'node' | 'browser'

const TSDOWN_PACKAGES: { name: string; platform?: Platform }[] = [
  { name: 'core' },
  { name: 'http' },
  { name: 'fe', platform: 'browser' },
  { name: 'be', platform: 'node' },
  { name: 'excel' },
  { name: 'maintenance', platform: 'node' }
]

const TSC_PACKAGES = ['agent-context', 'cli'] as const

const SKILL_PREFIX = 'cat-kit-'

/** 除 tsconfig 外、按 dist .d.ts 镜像的包（含 vitepress-theme） */
const DIST_PACKAGES = [
  ...TSDOWN_PACKAGES.map((p) => p.name),
  'vitepress-theme',
  ...TSC_PACKAGES
] as const

const TSCONFIG_PKG = 'tsconfig' as const

type DistPkg = (typeof DIST_PACKAGES)[number]

function skillGeneratedRoot(pkg: string): string {
  return join(REPO_ROOT, 'skills', `${SKILL_PREFIX}${pkg}`, 'generated')
}

async function walkDtsFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      out.push(...(await walkDtsFiles(p)))
    } else if (e.isFile() && e.name.endsWith('.d.ts')) {
      out.push(p)
    }
  }
  return out
}

async function readJson(path: string): Promise<{ name?: string; version?: string }> {
  const raw = await readFile(path, 'utf8')
  return JSON.parse(raw) as { name?: string; version?: string }
}

async function buildWithTsdown(): Promise<void> {
  for (const { name, platform = 'neutral' } of TSDOWN_PACKAGES) {
    const dir = join(REPO_ROOT, 'packages', name)
    if (!existsSync(join(dir, 'package.json'))) {
      console.warn(`[sync] skip missing package: ${name}`)
      continue
    }
    console.log(`[sync] tsdown: @cat-kit/${name} (${platform})`)
    const result = await buildLib({ dir, platform })
    if (!result.success) {
      throw new Error(`buildLib failed for ${name}: ${result.error?.message ?? 'unknown'}`)
    }
  }
}

/** 与 release/groups.ts 中 vitepressTheme.build 对齐 */
async function buildVitepressTheme(): Promise<void> {
  const dir = join(REPO_ROOT, 'packages', 'vitepress-theme')
  if (!existsSync(join(dir, 'package.json'))) {
    console.warn('[sync] skip vitepress-theme (missing)')
    return
  }
  console.log('[sync] tsdown: @cat-kit/vitepress-theme (browser, vue dts)')
  const result = await buildLib({
    dir,
    platform: 'browser',
    root: 'src',
    entry: ['src/index.ts', 'src/config.ts'],
    dts: { vue: true },
    plugins: [vue()],
    hooks: {
      afterBuild: async (config) => {
        await copyAssetsToDist({ pkgDir: config.dir, assets: ['styles'] })
        await copyFile(
          join(config.dir, 'src/styles/texture.jpg'),
          join(config.dir, 'dist/texture.jpg')
        )
      }
    }
  })
  if (!result.success) {
    throw new Error(`buildLib failed for vitepress-theme: ${result.error?.message ?? 'unknown'}`)
  }
}

async function buildWithTsc(pkg: string): Promise<void> {
  const tsconfig = join(REPO_ROOT, 'packages', pkg, 'tsconfig.json')
  if (!existsSync(tsconfig)) {
    console.warn(`[sync] skip tsc (no tsconfig): ${pkg}`)
    return
  }
  console.log(`[sync] tsc: @cat-kit/${pkg}`)
  const proc = Bun.spawnSync(['bun', 'x', 'tsc', '-p', tsconfig], {
    cwd: REPO_ROOT,
    stdout: 'inherit',
    stderr: 'inherit'
  })
  if (proc.exitCode !== 0) {
    throw new Error(`tsc failed for ${pkg} (exit ${proc.exitCode})`)
  }
}

async function mirrorDistDtsToSkill(pkg: DistPkg): Promise<number> {
  const dist = join(REPO_ROOT, 'packages', pkg, 'dist')
  const outRoot = skillGeneratedRoot(pkg)
  await rm(outRoot, { recursive: true, force: true })
  await mkdir(outRoot, { recursive: true })

  if (!existsSync(dist)) {
    console.warn(`[sync] no dist for ${pkg}, skip copy`)
    return 0
  }

  const files = await walkDtsFiles(dist)
  let n = 0
  for (const abs of files) {
    const rel = relative(dist, abs)
    const dest = join(outRoot, rel)
    await mkdir(dirname(dest), { recursive: true })
    await copyFile(abs, dest)
    n++
  }

  if (pkg === 'vitepress-theme') {
    const styleDts = join(REPO_ROOT, 'packages', 'vitepress-theme', 'style.css.d.ts')
    if (existsSync(styleDts)) {
      await copyFile(styleDts, join(outRoot, 'style.css.d.ts'))
      n++
    }
  }

  return n
}

async function mirrorTsconfigJson(): Promise<number> {
  const srcDir = join(REPO_ROOT, 'packages', TSCONFIG_PKG)
  const outRoot = skillGeneratedRoot(TSCONFIG_PKG)
  await rm(outRoot, { recursive: true, force: true })
  await mkdir(outRoot, { recursive: true })

  const names = [
    'tsconfig.json',
    'tsconfig.web.json',
    'tsconfig.bun.json',
    'tsconfig.node.json',
    'tsconfig.vue.json',
    'README.md'
  ]
  let n = 0
  for (const name of names) {
    const src = join(srcDir, name)
    if (existsSync(src)) {
      await copyFile(src, join(outRoot, name))
      n++
    }
  }
  return n
}

async function writeSkillGeneratedReadme(
  outRoot: string,
  opts: { kind: 'dts' | 'json'; npmName: string }
): Promise<void> {
  const base =
    opts.kind === 'json'
      ? `本目录由脚本生成，**勿手改**。内容为 **${opts.npmName}** 包内与 npm \`files\` 一致的 JSON 预设与说明。`
      : `本目录由脚本生成，**勿手改**。内容为 **${opts.npmName}** 包 \`dist\` 下 **.d.ts** 的镜像（与 npm typings 对齐）。`
  await writeFile(
    join(outRoot, 'README.md'),
    `${base}

- 入口：通常从 \`index.d.ts\` 起读（若有）。
- 元数据：\`manifest.json\`
`,
    'utf8'
  )
}

async function writeManifest(
  outRoot: string,
  body: {
    generatedAt: string
    npmName: string
    version: string
    kind: 'dts' | 'json'
    artifactCount: number
  }
): Promise<void> {
  await writeFile(join(outRoot, 'manifest.json'), JSON.stringify(body, null, 2), 'utf8')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const doBuild = args.includes('--build')

  if (doBuild) {
    await buildWithTsdown()
    await buildVitepressTheme()
    for (const p of TSC_PACKAGES) {
      await buildWithTsc(p)
    }
  }

  let totalArtifacts = 0
  const generatedAt = new Date().toISOString()

  for (const pkg of DIST_PACKAGES) {
    const pkgJsonPath = join(REPO_ROOT, 'packages', pkg, 'package.json')
    let npmName = `@cat-kit/${pkg}`
    let version = '0.0.0'
    if (existsSync(pkgJsonPath)) {
      const pj = await readJson(pkgJsonPath)
      if (pj.name) npmName = pj.name
      if (pj.version) version = pj.version
    }

    const count = await mirrorDistDtsToSkill(pkg)
    totalArtifacts += count
    const outRoot = skillGeneratedRoot(pkg)
    await writeManifest(outRoot, {
      generatedAt,
      npmName,
      version,
      kind: 'dts',
      artifactCount: count
    })
    await writeSkillGeneratedReadme(outRoot, { kind: 'dts', npmName })
    console.log(`[sync] ${pkg}: ${count} artifacts → ${relative(REPO_ROOT, outRoot)}`)
  }

  {
    const pkgJsonPath = join(REPO_ROOT, 'packages', TSCONFIG_PKG, 'package.json')
    let npmName = '@cat-kit/tsconfig'
    let version = '0.0.0'
    if (existsSync(pkgJsonPath)) {
      const pj = await readJson(pkgJsonPath)
      if (pj.name) npmName = pj.name
      if (pj.version) version = pj.version
    }
    const count = await mirrorTsconfigJson()
    totalArtifacts += count
    const outRoot = skillGeneratedRoot(TSCONFIG_PKG)
    await writeManifest(outRoot, {
      generatedAt,
      npmName,
      version,
      kind: 'json',
      artifactCount: count
    })
    await writeSkillGeneratedReadme(outRoot, { kind: 'json', npmName })
    console.log(`[sync] ${TSCONFIG_PKG}: ${count} artifacts → ${relative(REPO_ROOT, outRoot)}`)
  }

  console.log(`[sync] done: ${totalArtifacts} total artifacts`)
  if (totalArtifacts === 0 && !doBuild) {
    console.error('[sync] hint: empty output; run with --build or build packages first')
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
