import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { getResourcesDir } from '../shared/paths.js'
import type { WorkflowArtifacts, WorkflowCommandName } from './types.js'

const COMMAND_FILES: Record<WorkflowCommandName, string> = {
  init: 'ac-init.md',
  plan: 'ac-plan.md',
  replan: 'ac-replan.md',
  implement: 'ac-implement.md',
  patch: 'ac-patch.md',
  done: 'ac-done.md'
}

export function getWorkflowCommandFiles(): Record<WorkflowCommandName, string> {
  return { ...COMMAND_FILES }
}

export async function renderWorkflowArtifacts(): Promise<WorkflowArtifacts> {
  const resourcesDir = getResourcesDir()
  const workflowsDir = resolve(resourcesDir, 'workflows')

  const workflowOverview = await readMarkdown(resolve(resourcesDir, 'workflow.md'))

  const commandFilesEntries = await Promise.all(
    (Object.entries(COMMAND_FILES) as Array<[WorkflowCommandName, string]>).map(
      async ([command, fileName]) => {
        const body = await readMarkdown(resolve(workflowsDir, fileName))
        return [command, body] as const
      }
    )
  )

  return {
    workflowOverview,
    commandFiles: Object.fromEntries(commandFilesEntries) as WorkflowArtifacts['commandFiles']
  }
}

async function readMarkdown(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf-8')
  const trimmed = content.trim()

  if (trimmed.length === 0) {
    throw new Error(`模板文件内容为空: ${filePath}`)
  }

  return trimmed
}
