#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const PACKAGES_DIR = join(REPO_ROOT, 'packages')
const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies'
] as const

type DependencyField = (typeof DEP_FIELDS)[number]

type PackageJson = {
  name?: string
  version?: string
  private?: boolean
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  [key: string]: unknown
}

type PackageFile = { path: string; relativePath: string; json: PackageJson }

async function listPackageFiles(): Promise<PackageFile[]> {
  const entries = await readdir(PACKAGES_DIR, { withFileTypes: true })
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const relativePath = join('packages', entry.name, 'package.json')
        const path = join(REPO_ROOT, relativePath)
        const raw = await readFile(path, 'utf8')
        return { path, relativePath, json: JSON.parse(raw) as PackageJson }
      })
  )
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

function buildWorkspaceVersionMap(files: readonly PackageFile[]): Map<string, string> {
  const versionMap = new Map<string, string>()

  for (const file of files) {
    if (!file.json.name || !file.json.version) {
      continue
    }
    versionMap.set(file.json.name, file.json.version)
  }

  return versionMap
}

function resolveWorkspaceRange(spec: string, version: string): string {
  const raw = spec.slice('workspace:'.length)

  if (raw === '' || raw === '*') {
    return version
  }

  if (raw === '^' || raw === '~') {
    return `${raw}${version}`
  }

  return raw
}

function rewriteDependencyField(
  deps: Record<string, string> | undefined,
  versionMap: ReadonlyMap<string, string>
): string[] {
  if (!deps) {
    return []
  }

  const changes: string[] = []

  for (const [name, spec] of Object.entries(deps)) {
    if (!spec.startsWith('workspace:')) {
      continue
    }

    const version = versionMap.get(name)
    if (!version) {
      continue
    }

    const nextSpec = resolveWorkspaceRange(spec, version)
    if (nextSpec === spec) {
      continue
    }

    deps[name] = nextSpec
    changes.push(`${name}: ${spec} -> ${nextSpec}`)
  }

  return changes
}

async function main(): Promise<void> {
  const files = await listPackageFiles()
  const versionMap = buildWorkspaceVersionMap(files)
  let rewrittenFiles = 0

  for (const file of files) {
    if (file.json.private === true) {
      continue
    }

    const changesByField: string[] = []

    for (const field of DEP_FIELDS) {
      const changes = rewriteDependencyField(
        file.json[field] as PackageJson[DependencyField],
        versionMap
      )
      if (changes.length > 0) {
        changesByField.push(`${field}: ${changes.join(', ')}`)
      }
    }

    if (changesByField.length === 0) {
      continue
    }

    await writeFile(file.path, `${JSON.stringify(file.json, null, 2)}\n`, 'utf8')
    rewrittenFiles += 1
    console.log(`[normalize-workspace-dependencies] ${file.relativePath}`)
    for (const change of changesByField) {
      console.log(`  - ${change}`)
    }
  }

  if (rewrittenFiles === 0) {
    console.log('[normalize-workspace-dependencies] no publishable package needed rewriting')
    return
  }

  console.log(
    `[normalize-workspace-dependencies] rewrote workspace ranges in ${rewrittenFiles} package(s)`
  )
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`[normalize-workspace-dependencies] ${error.message}`)
  } else {
    console.error('[normalize-workspace-dependencies] unknown error', error)
  }
  process.exit(1)
})
