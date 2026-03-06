import { resolve } from 'node:path'

import { getWorkflowCommandFiles, renderWorkflowArtifacts } from '../domain/workflow-content.js'
import type { FileMutation, ToolTarget, WorkflowCommandName } from '../domain/types.js'

const COMMAND_ORDER: WorkflowCommandName[] = [
  'init',
  'plan',
  'replan',
  'implement',
  'patch',
  'done'
]

export async function renderWorkflowMutations(target: ToolTarget): Promise<FileMutation[]> {
  const artifacts = await renderWorkflowArtifacts()
  const fileNames = getWorkflowCommandFiles()

  const mutations: FileMutation[] = [
    {
      path: target.workflowOverviewFile,
      body: artifacts.workflowOverview
    }
  ]

  for (const command of COMMAND_ORDER) {
    const fileName = fileNames[command]
    mutations.push({
      path: resolve(target.workflowsDir, fileName),
      body: artifacts.commandFiles[command]
    })
  }

  return mutations
}
