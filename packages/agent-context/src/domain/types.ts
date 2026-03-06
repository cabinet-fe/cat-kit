export type ToolId = 'claude' | 'codex' | 'cursor' | 'antigravity' | 'copilot'

export interface ToolTarget {
  id: ToolId
  name: string
  rootDir: string
  workflowOverviewFile: string
  workflowsDir: string
}

export type WorkflowCommandName =
  | 'init'
  | 'plan'
  | 'replan'
  | 'implement'
  | 'patch'
  | 'done'

export interface WorkflowArtifacts {
  workflowOverview: string
  commandFiles: Record<WorkflowCommandName, string>
}

export interface SkillArtifacts {
  directoryName: string
  skillDocument: string
  scriptPlaceholder: string
  templatePlaceholder: string
  referencePlaceholder: string
}

export interface FileMutation {
  path: string
  body: string
}

export interface ApplyMutationResult {
  created: string[]
  updated: string[]
  unchanged: string[]
  changed: string[]
}

export interface RunOptions {
  cwd?: string
  tools?: ToolId[]
  check?: boolean
}

export interface RunResult extends ApplyMutationResult {
  mode: 'setup' | 'update'
  check: boolean
}
