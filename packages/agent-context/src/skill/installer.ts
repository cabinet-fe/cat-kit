import { existsSync } from 'node:fs'
import { lstat, mkdir, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'

import type {
  ApplyMutationResult,
  FileMutation,
  RunOptions,
  RunResult,
  ToolId,
  ToolTarget
} from '../types'
import { pruneSkillDirectory } from './prune'
import { renderSkillArtifacts } from './render'
import {
  CANONICAL_TOOL_ID,
  resolveCompatibilityToolTargets,
  resolveSkillPaths,
  resolveSyncCompatibilityToolTargets,
  resolveToolTargetById
} from './targets'
import type { SkillPaths } from './targets'

export async function runInstall(options: RunOptions = {}): Promise<RunResult> {
  return run('install', options)
}

export async function runSync(options: RunOptions = {}): Promise<RunResult> {
  return run('sync', options)
}

// ── Orchestration ───────────────────────────────────

async function run(mode: 'install' | 'sync', options: RunOptions): Promise<RunResult> {
  const cwd = options.cwd ?? process.cwd()
  const tools = dedup(options.tools)
  const canonicalTarget = resolveToolTargetById(CANONICAL_TOOL_ID)
  const compatibilityTargets =
    mode === 'sync'
      ? resolveSyncCompatibilityToolTargets(cwd)
      : resolveCompatibilityToolTargets(tools)

  const mutations = buildMutations(canonicalTarget, cwd)

  const check = options.check ?? false
  const base = await applyMutations(mutations, check)
  const removed: string[] = [...base.removed]
  const changed = [...base.changed]

  const canonicalPaths = resolveSkillPaths(canonicalTarget, cwd)
  if (existsSync(canonicalPaths.skillDir)) {
    const allowed = new Set(renderSkillArtifacts().files.map((f) => f.relativePath))
    const pr = await pruneSkillDirectory(canonicalPaths.skillDir, allowed, check)
    removed.push(...pr.removed)
    if (check) {
      pushUnique(changed, pr.checkDirty)
    }
  }

  const compatibilityResults = await Promise.all(
    compatibilityTargets.map((target) =>
      applyCompatibilityEntry(target, cwd, canonicalPaths, check)
    )
  )

  for (const result of compatibilityResults) {
    pushUnique(base.created, result.created)
    pushUnique(base.updated, result.updated)
    pushUnique(base.unchanged, result.unchanged)
    pushUnique(changed, result.changed)
    pushUnique(removed, result.removed)
  }

  return { ...base, changed, removed, mode, check }
}

// ── Mutation building ───────────────────────────────

function buildMutations(target: ToolTarget, cwd: string): FileMutation[] {
  const artifacts = renderSkillArtifacts()
  const paths = resolveSkillPaths(target, cwd)

  return artifacts.files.map((file) => ({
    path: resolveArtifactPath(paths, file.relativePath),
    body: file.body
  }))
}

async function applyCompatibilityEntry(
  target: ToolTarget,
  cwd: string,
  canonicalPaths: SkillPaths,
  check: boolean
): Promise<ApplyMutationResult> {
  const paths = resolveSkillPaths(target, cwd)
  const existing = await tryLstat(paths.skillDir)
  const desiredTarget = relative(dirname(paths.skillDir), canonicalPaths.skillDir)
  const symlinkTarget = desiredTarget.length === 0 ? canonicalPaths.skillDir : desiredTarget

  if (!existing) {
    if (check) {
      return singlePathChange(paths.skillDir, 'created')
    }

    try {
      await mkdir(dirname(paths.skillDir), { recursive: true })
      await symlink(
        symlinkTarget,
        paths.skillDir,
        process.platform === 'win32' ? 'junction' : 'dir'
      )
      return singlePathChange(paths.skillDir, 'created')
    } catch {
      return applyCompatibilityCopy(target, cwd, check)
    }
  }

  if (existing.isSymbolicLink()) {
    const current = await readlink(paths.skillDir)
    if (resolve(dirname(paths.skillDir), current) === canonicalPaths.skillDir) {
      const result = emptyMutationResult()
      result.unchanged.push(paths.skillDir)
      return result
    }

    if (check) {
      return singlePathChange(paths.skillDir, 'updated')
    }

    await rm(paths.skillDir, { force: true, recursive: true })
    await mkdir(dirname(paths.skillDir), { recursive: true })
    await symlink(symlinkTarget, paths.skillDir, process.platform === 'win32' ? 'junction' : 'dir')
    return singlePathChange(paths.skillDir, 'updated')
  }

  if (existing.isDirectory()) {
    return applyCompatibilityCopy(target, cwd, check)
  }

  throw new Error(`兼容入口路径不是目录或 symlink: ${paths.skillDir}`)
}

async function applyCompatibilityCopy(
  target: ToolTarget,
  cwd: string,
  check: boolean
): Promise<ApplyMutationResult> {
  const paths = resolveSkillPaths(target, cwd)
  const result = await applyMutations(buildMutations(target, cwd), check)

  if (!existsSync(paths.skillDir)) {
    return result
  }

  const allowed = new Set(renderSkillArtifacts().files.map((f) => f.relativePath))
  const pr = await pruneSkillDirectory(paths.skillDir, allowed, check)
  result.removed.push(...pr.removed)
  if (check) {
    pushUnique(result.changed, pr.checkDirty)
  }

  return result
}

function resolveArtifactPath(paths: SkillPaths, relativePath: string): string {
  if (relativePath === 'SKILL.md') {
    return paths.skillFile
  }

  return resolve(paths.skillDir, relativePath)
}

// ── Mutation application ────────────────────────────

async function applyMutations(
  mutations: FileMutation[],
  check: boolean
): Promise<ApplyMutationResult> {
  const result: ApplyMutationResult = {
    created: [],
    updated: [],
    unchanged: [],
    changed: [],
    removed: []
  }

  for (const mutation of mutations) {
    const fileExists = existsSync(mutation.path)
    const next = await resolveNextContent(mutation, fileExists)

    if (!next.changed) {
      result.unchanged.push(mutation.path)
      continue
    }

    if (!check) {
      await mkdir(dirname(mutation.path), { recursive: true })
      await writeFile(mutation.path, next.content, 'utf-8')
    }

    result.changed.push(mutation.path)

    if (fileExists) {
      result.updated.push(mutation.path)
    } else {
      result.created.push(mutation.path)
    }
  }

  return result
}

async function resolveNextContent(
  mutation: FileMutation,
  fileExists: boolean
): Promise<{ content: string; changed: boolean }> {
  const content = normalizeTrailingNewline(mutation.body)

  if (!fileExists) {
    return { content, changed: true }
  }

  const current = await readFile(mutation.path, 'utf-8')
  return { content, changed: current !== content }
}

function normalizeTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`
}

function dedup(tools?: ToolId[]): ToolId[] | undefined {
  if (!tools || tools.length === 0) return undefined
  return [...new Set(tools)]
}

async function tryLstat(path: string) {
  try {
    return await lstat(path)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}

function emptyMutationResult(): ApplyMutationResult {
  return { created: [], updated: [], unchanged: [], changed: [], removed: [] }
}

function singlePathChange(path: string, kind: 'created' | 'updated'): ApplyMutationResult {
  const result = emptyMutationResult()
  result[kind].push(path)
  result.changed.push(path)
  return result
}

function pushUnique(target: string[], items: string[]): void {
  for (const item of items) {
    if (!target.includes(item)) target.push(item)
  }
}
