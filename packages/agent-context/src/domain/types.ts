export type ToolId = 'claude' | 'codex' | 'cursor' | 'antigravity' | 'copilot'

export interface ToolTarget {
  id: ToolId
  name: string
  rootDir: string
  /** 工作流文件扩展名：'.md' | '.prompt.md'（Copilot） */
  fileExtension: string
  /** 是否支持 YAML frontmatter（Cursor 不支持） */
  supportsFrontmatter: boolean
  /** 命令分隔符：':'（Claude 嵌套目录 ac/init.md → /ac:init）或 '-'（扁平 ac-init.md） */
  commandSeparator: string
  /** 命令调用前缀：'/'（Claude/Cursor）或 '#'（Copilot） */
  commandPrefix: string
}

export type WorkflowCommandName =
  | 'init'
  | 'plan'
  | 'replan'
  | 'implement'
  | 'patch'
  | 'done'

export interface WorkflowArtifacts {
  commandFiles: Record<WorkflowCommandName, string>
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
