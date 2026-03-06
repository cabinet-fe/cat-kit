import { resolve } from 'node:path'

import type { ToolId, ToolTarget, WorkflowCommandName } from '../domain/types.js'

const TOOL_TARGET_MAP: Record<ToolId, ToolTarget> = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    rootDir: '.claude/commands',
    fileExtension: '.md',
    supportsFrontmatter: true,
    commandSeparator: ':',
    commandPrefix: '/'
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    rootDir: '.codex/commands',
    fileExtension: '.md',
    supportsFrontmatter: true,
    commandSeparator: '-',
    commandPrefix: '/'
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    rootDir: '.cursor/commands',
    fileExtension: '.md',
    supportsFrontmatter: false,
    commandSeparator: '-',
    commandPrefix: '/'
  },
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    rootDir: '.agents',
    fileExtension: '.md',
    supportsFrontmatter: true,
    commandSeparator: '-',
    commandPrefix: '/'
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    rootDir: '.github/prompts',
    fileExtension: '.prompt.md',
    supportsFrontmatter: true,
    commandSeparator: '-',
    commandPrefix: '#'
  }
}

export const DEFAULT_TOOL_ORDER: ToolId[] = [
  'claude',
  'codex',
  'cursor',
  'antigravity',
  'copilot'
]

export interface ToolChoice {
  id: ToolId
  name: string
}

export function getToolChoices(): ToolChoice[] {
  return DEFAULT_TOOL_ORDER.map(id => ({
    id,
    name: TOOL_TARGET_MAP[id].name
  }))
}

export function parseToolIds(toolsText: string): ToolId[] {
  const parsed = toolsText
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)

  if (parsed.length === 0) {
    return [...DEFAULT_TOOL_ORDER]
  }

  const uniqueIds: ToolId[] = []

  for (const value of parsed) {
    if (!isToolId(value)) {
      throw new Error(
        `不支持的工具标识: ${value}。可选值: ${DEFAULT_TOOL_ORDER.join(', ')}`
      )
    }

    if (!uniqueIds.includes(value)) {
      uniqueIds.push(value)
    }
  }

  return uniqueIds
}

export function resolveToolTargets(tools?: ToolId[]): ToolTarget[] {
  const selected = tools && tools.length > 0 ? tools : DEFAULT_TOOL_ORDER
  return selected.map(id => ({ ...TOOL_TARGET_MAP[id] }))
}

// ── 工作流路径解析 ────────────────────────────────────

export interface WorkflowPaths {
  commandFile(name: WorkflowCommandName): string
}

/**
 * 根据工具约束计算工作流文件输出路径
 *
 * - separator=':' (Claude) → 嵌套: .claude/commands/ac/init.md  → /ac:init
 * - separator='-' (其他)   → 扁平: .cursor/commands/ac-init.md → /ac-init
 */
export function resolveWorkflowPaths(target: ToolTarget, cwd: string): WorkflowPaths {
  const root = resolve(cwd, target.rootDir)
  const ext = target.fileExtension
  const nested = target.commandSeparator === ':'

  if (nested) {
    const nsDir = resolve(root, 'ac')
    return {
      commandFile: name => resolve(nsDir, `${name}${ext}`)
    }
  }

  return {
    commandFile: name => resolve(root, `ac-${name}${ext}`)
  }
}

function isToolId(value: string): value is ToolId {
  return Object.hasOwn(TOOL_TARGET_MAP, value)
}
