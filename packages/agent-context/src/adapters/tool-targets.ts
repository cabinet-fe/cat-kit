import { resolve } from 'node:path'

import type { ToolId, ToolTarget } from '../domain/types.js'

const TOOL_TARGET_MAP: Record<ToolId, Omit<ToolTarget, 'workflowOverviewFile' | 'workflowsDir'>> = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    rootDir: '.claude/commands'
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    rootDir: '.codex/commands'
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    rootDir: '.cursor/commands'
  },
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    rootDir: '.agents'
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    rootDir: '.github/prompts'
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

export function resolveToolTargets(cwd: string, tools?: ToolId[]): ToolTarget[] {
  const selected = tools && tools.length > 0 ? tools : DEFAULT_TOOL_ORDER

  return selected.map((toolId) => {
    const config = TOOL_TARGET_MAP[toolId]
    const root = resolve(cwd, config.rootDir)

    return {
      ...config,
      workflowOverviewFile: resolve(root, 'workflow.md'),
      workflowsDir: resolve(root, 'workflows')
    }
  })
}

function isToolId(value: string): value is ToolId {
  return Object.hasOwn(TOOL_TARGET_MAP, value)
}
