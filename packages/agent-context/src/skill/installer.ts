import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'

import type {
  ApplyMutationResult,
  FileMutation,
  RunOptions,
  RunResult,
  ToolId,
  ToolTarget
} from '../types'
import { parseSkillMdMetadataVersion, replaceVersionInSkillDirectory } from './metadata'
import { pruneSkillDirectory } from './prune'
import { renderSkillArtifacts } from './render'
import {
  detectConfiguredToolIds,
  resolveSkillPaths,
  resolveSyncToolTargets,
  resolveToolTargetById,
  resolveToolTargets
} from './targets'
import type { SkillPaths } from './targets'
import { readAgentContextPackageVersion } from './version'

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
  const targets = mode === 'sync' ? resolveSyncToolTargets(cwd) : resolveToolTargets(tools)

  // sync：metadata 版本与 CLI 包版本不一致时，对项目中每一处已安装的 ac-workflow 目录做全文替换
  if (mode === 'sync' && !options.check) {
    const pkgVersion = readAgentContextPackageVersion()
    const everyInstalledId = detectConfiguredToolIds(cwd)
    await Promise.all(
      everyInstalledId.map(async (id) => {
        const target = resolveToolTargetById(id)
        const paths = resolveSkillPaths(target, cwd)
        if (!existsSync(paths.skillFile)) return
        const skillMd = await readFile(paths.skillFile, 'utf-8')
        const embedded = parseSkillMdMetadataVersion(skillMd)
        if (embedded !== undefined && embedded !== pkgVersion) {
          await replaceVersionInSkillDirectory(paths.skillDir, embedded, pkgVersion)
        }
      })
    )
  }

  const mutations: FileMutation[] = targets.flatMap((target) => buildMutations(target, cwd))

  const check = options.check ?? false
  const base = await applyMutations(mutations, check)
  const removed: string[] = [...base.removed]
  const changed = [...base.changed]

  for (const target of targets) {
    const paths = resolveSkillPaths(target, cwd)
    if (!existsSync(paths.skillDir)) continue
    const allowed = new Set(renderSkillArtifacts(target).files.map((f) => f.relativePath))
    const pr = await pruneSkillDirectory(paths.skillDir, allowed, check)
    removed.push(...pr.removed)
    if (check) {
      for (const p of pr.checkDirty) {
        if (!changed.includes(p)) changed.push(p)
      }
    }
  }

  return { ...base, changed, removed, mode, check }
}

// ── Mutation building ───────────────────────────────

function buildMutations(target: ToolTarget, cwd: string): FileMutation[] {
  const artifacts = renderSkillArtifacts(target)
  const paths = resolveSkillPaths(target, cwd)

  return artifacts.files.map((file) => ({
    path: resolveArtifactPath(paths, file.relativePath),
    body: file.body
  }))
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
