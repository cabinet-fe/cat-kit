#!/usr/bin/env bun
/**
 * 将各 @cat-kit/* 发布物 typings（或 tsconfig JSON 预设）镜像到 skills/cat-kit/generated/<pkg>/，
 * 供统一 cat-kit 技能离线查阅；与 npm 包内 dist / files 对齐。
 *
 * 用法（仓库根目录）：
 *   bun run sync-cat-kit-skills-api              # 仅复制（需已构建 dist）
 *   bun run sync-cat-kit-skills-api -- --build   # 先执行各包 build 再复制
 */

import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const SKILL_ROOT = 'cat-kit'

const BUILD_PACKAGES = [
  'core',
  'http',
  'fe',
  'be',
  'agent-context',
  'cli',
  'vitepress-theme'
] as const

const DIST_PACKAGES = BUILD_PACKAGES
const TSCONFIG_PKG = 'tsconfig' as const

type DistPkg = (typeof DIST_PACKAGES)[number]

function skillGeneratedRoot(pkg: string): string {
  return join(REPO_ROOT, 'skills', SKILL_ROOT, 'generated', pkg)
}

async function runPackageBuild(pkg: string): Promise<void> {
  const cwd = join(REPO_ROOT, 'packages', pkg)
  if (!existsSync(join(cwd, 'package.json'))) {
    console.warn(`[sync] skip missing package: ${pkg}`)
    return
  }

  console.log(`[sync] build: @cat-kit/${pkg}`)

  const proc = Bun.spawnSync(['bun', 'run', 'build'], {
    cwd,
    stdout: 'inherit',
    stderr: 'inherit'
  })

  if (proc.exitCode !== 0) {
    throw new Error(`build failed for ${pkg} (exit ${proc.exitCode})`)
  }
}

async function walkDtsFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await walkDtsFiles(abs)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      out.push(abs)
    }
  }

  return out
}

async function readJson(path: string): Promise<{ name?: string; version?: string }> {
  const raw = await readFile(path, 'utf8')
  return JSON.parse(raw) as { name?: string; version?: string }
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
  let count = 0

  for (const abs of files) {
    const rel = relative(dist, abs)
    const dest = join(outRoot, rel)
    await mkdir(dirname(dest), { recursive: true })
    await copyFile(abs, dest)
    count++
  }

  if (pkg === 'vitepress-theme') {
    const styleDts = join(REPO_ROOT, 'packages', 'vitepress-theme', 'style.css.d.ts')
    if (existsSync(styleDts)) {
      await copyFile(styleDts, join(outRoot, 'style.css.d.ts'))
      count++
    }
  }

  return count
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

  let count = 0
  for (const name of names) {
    const src = join(srcDir, name)
    if (!existsSync(src)) {
      continue
    }
    await copyFile(src, join(outRoot, name))
    count++
  }

  return count
}

async function writeSkillGeneratedReadme(
  outRoot: string,
  opts: { kind: 'dts' | 'json'; npmName: string }
): Promise<void> {
  const body =
    opts.kind === 'json'
      ? `本目录由脚本生成，**勿手改**。内容为 **${opts.npmName}** 包内与 npm \`files\` 一致的 JSON 预设与说明。`
      : `本目录由脚本生成，**勿手改**。内容为 **${opts.npmName}** 包 \`dist\` 下 **.d.ts** 的镜像（与 npm typings 对齐）。`

  await writeFile(
    join(outRoot, 'README.md'),
    `${body}

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
    for (const pkg of BUILD_PACKAGES) {
      await runPackageBuild(pkg)
    }
  }

  const generatedAt = new Date().toISOString()
  let totalArtifacts = 0

  for (const pkg of DIST_PACKAGES) {
    const pkgJsonPath = join(REPO_ROOT, 'packages', pkg, 'package.json')
    let npmName = `@cat-kit/${pkg}`
    let version = '0.0.0'

    if (existsSync(pkgJsonPath)) {
      const manifest = await readJson(pkgJsonPath)
      if (manifest.name) npmName = manifest.name
      if (manifest.version) version = manifest.version
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
    console.log(`[sync] ${pkg}: ${count} artifacts -> ${relative(REPO_ROOT, outRoot)}`)
  }

  {
    const pkgJsonPath = join(REPO_ROOT, 'packages', TSCONFIG_PKG, 'package.json')
    let npmName = '@cat-kit/tsconfig'
    let version = '0.0.0'

    if (existsSync(pkgJsonPath)) {
      const manifest = await readJson(pkgJsonPath)
      if (manifest.name) npmName = manifest.name
      if (manifest.version) version = manifest.version
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
    console.log(`[sync] ${TSCONFIG_PKG}: ${count} artifacts -> ${relative(REPO_ROOT, outRoot)}`)
  }

  if (totalArtifacts === 0) {
    console.error('[sync] hint: empty output; run with --build or build packages first')
  }
}

main().catch((error) => {
  console.error('[sync] failed:', error)
  process.exitCode = 1
})
