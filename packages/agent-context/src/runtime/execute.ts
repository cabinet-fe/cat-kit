import { resolve } from 'node:path'

import { resolveToolTargets } from '../adapters/tool-targets.js'
import type { FileMutation, RunOptions, RunResult, ToolId } from '../domain/types.js'
import { renderAgentsGuide } from '../generators/agents.js'
import { renderWorkflowMutations } from '../generators/workflow.js'
import { applyManagedMutations } from '../shared/fs.js'

export async function runSetup(options: RunOptions = {}): Promise<RunResult> {
  return runInMode('setup', options)
}

export async function runUpdate(options: RunOptions = {}): Promise<RunResult> {
  return runInMode('update', options)
}

async function runInMode(mode: 'setup' | 'update', options: RunOptions): Promise<RunResult> {
  const cwd = options.cwd ?? process.cwd()
  const toolIds = normalizeTools(options.tools)
  const targets = resolveToolTargets(toolIds)

  const mutations: FileMutation[] = [
    ...targets.flatMap(target => renderWorkflowMutations(target, cwd)),
    {
      path: resolve(cwd, 'AGENTS.md'),
      body: renderAgentsGuide(targets)
    }
  ]

  const check = options.check ?? false
  const result = await applyManagedMutations(mutations, check)

  return {
    ...result,
    mode,
    check
  }
}

function normalizeTools(tools?: ToolId[]): ToolId[] | undefined {
  if (!tools || tools.length === 0) {
    return undefined
  }

  const uniqueTools: ToolId[] = []

  for (const tool of tools) {
    if (!uniqueTools.includes(tool)) {
      uniqueTools.push(tool)
    }
  }

  return uniqueTools
}
