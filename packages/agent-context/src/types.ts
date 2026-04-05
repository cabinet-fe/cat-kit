export type ToolId = 'claude' | 'codex' | 'cursor' | 'antigravity' | 'agents' | 'gemini' | 'copilot'

export type PromptToolId = 'claude' | 'codex' | 'gemini' | 'antigravity'

export type SkillFrontmatterProfile = 'standard' | 'claude' | 'copilot'
export type SkillMetadataFile = 'openai'

export interface ToolTarget {
  id: ToolId
  name: string
  skillRootDir: string
  frontmatterProfile: SkillFrontmatterProfile
  metadataFiles: SkillMetadataFile[]
  guideFileName: string
  askToolName: string
}

export interface SkillArtifacts {
  files: Array<{ relativePath: string; body: string }>
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
  /** sync/install 清理掉的非清单内路径（文件与已删除的空目录） */
  removed: string[]
}

export interface RunOptions {
  cwd?: string
  tools?: ToolId[]
  check?: boolean
}

export interface RunResult extends ApplyMutationResult {
  mode: 'install' | 'sync'
  check: boolean
}

// ── Context types ────────────────────────────────────

export type PlanStatus = '未执行' | '已执行' | '未知'

export interface PlanInfo {
  number: number
  status: PlanStatus
  dir: string
}

export interface ContextSnapshot {
  root: string
  scope: string
  currentPlan: PlanInfo | null
  preparing: PlanInfo[]
  done: Pick<PlanInfo, 'number' | 'dir'>[]
}

export interface ValidateResult {
  valid: boolean
  errors: string[]
  context: ContextSnapshot | null
}

export interface ArchiveResult {
  archivedTo: string
  promoted: number | null
  remainingPreparing: number
}
