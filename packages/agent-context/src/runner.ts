import { resolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import type { SkillPaths } from './tools.js'
import { resolveToolTargets, resolveSkillPaths } from './tools.js'
import { renderSkillArtifacts } from './content/index.js'
import type { ApplyMutationResult, FileMutation, RunOptions, RunResult, ToolId, ToolTarget } from './types.js'

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
  const targets = resolveToolTargets(tools)

  const mutations: FileMutation[] = targets.flatMap(target => buildMutations(target, cwd))

  const check = options.check ?? false
  const result = await applyMutations(mutations, check)

  return { ...result, mode, check }
}

// ── Mutation building ───────────────────────────────

function buildMutations(target: ToolTarget, cwd: string): FileMutation[] {
  const artifacts = renderSkillArtifacts(target)
  const paths = resolveSkillPaths(target, cwd)

  return artifacts.files.map(file => ({
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
    changed: []
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
