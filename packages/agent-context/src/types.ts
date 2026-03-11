export type ToolId = 'claude' | 'codex' | 'cursor' | 'antigravity' | 'copilot'

export type SkillFrontmatterProfile = 'standard' | 'claude' | 'copilot'
export type SkillMetadataFile = 'openai'

export interface ToolTarget {
  id: ToolId
  name: string
  skillRootDir: string
  frontmatterProfile: SkillFrontmatterProfile
  metadataFiles: SkillMetadataFile[]
}

export interface SkillArtifacts {
  files: Array<{
    relativePath: string
    body: string
  }>
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
  mode: 'install' | 'sync'
  check: boolean
}
