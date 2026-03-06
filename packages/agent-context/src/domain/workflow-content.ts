import type { ToolTarget, WorkflowArtifacts } from './types.js'
import {
  createWorkflowContext,
  renderDone,
  renderImplement,
  renderInit,
  renderOverview,
  renderPatch,
  renderPlan,
  renderReplan
} from './workflow-templates/index.js'

export function renderWorkflowArtifacts(target: ToolTarget): WorkflowArtifacts {
  const ctx = createWorkflowContext(target)

  return {
    workflowOverview: renderOverview(ctx),
    commandFiles: {
      init: renderInit(ctx),
      plan: renderPlan(ctx),
      replan: renderReplan(ctx),
      implement: renderImplement(ctx),
      patch: renderPatch(ctx),
      done: renderDone(ctx)
    }
  }
}
