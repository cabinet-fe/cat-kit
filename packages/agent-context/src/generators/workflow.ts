import { resolveWorkflowPaths } from '../adapters/tool-targets'
import type { FileMutation, ToolTarget, WorkflowCommandName } from '../domain/types'
import { renderWorkflowArtifacts } from '../domain/workflow-content'

const COMMAND_ORDER: WorkflowCommandName[] = [
  'init',
  'plan',
  'replan',
  'implement',
  'patch',
  'done'
]

export function renderWorkflowMutations(target: ToolTarget, cwd: string): FileMutation[] {
  const artifacts = renderWorkflowArtifacts(target)
  const paths = resolveWorkflowPaths(target, cwd)

  const mutations: FileMutation[] = []

  for (const command of COMMAND_ORDER) {
    mutations.push({ path: paths.commandFile(command), body: artifacts.commandFiles[command] })
  }

  return mutations
}
