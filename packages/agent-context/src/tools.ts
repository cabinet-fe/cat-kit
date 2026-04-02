import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { ToolId, ToolTarget } from './types.js'

const SKILL_FILE_NAME = 'SKILL.md'
const SKILL_NAME = 'ac-workflow'

const TOOL_TARGET_MAP: Record<ToolId, ToolTarget> = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    skillRootDir: '.claude/skills',
    frontmatterProfile: 'claude',
    metadataFiles: [],
    guideFileName: 'CLAUDE.md',
    askToolName: 'AskUserQuestion'
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    skillRootDir: '.codex/skills',
    frontmatterProfile: 'standard',
    metadataFiles: ['openai'],
    guideFileName: 'AGENTS.md',
    askToolName: 'request_user_input'
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    skillRootDir: '.cursor/skills',
    frontmatterProfile: 'standard',
    metadataFiles: [],
    guideFileName: 'AGENTS.md',
    askToolName: 'AskUserQuestion'
  },
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    skillRootDir: '.agent/skills',
    frontmatterProfile: 'standard',
    metadataFiles: [],
    guideFileName: 'AGENTS.md',
    askToolName: 'AskUserQuestion'
  },
  agents: {
    id: 'agents',
    name: 'Agent Skills（开放标准 · .agents）',
    skillRootDir: '.agents/skills',
    frontmatterProfile: 'standard',
    metadataFiles: [],
    guideFileName: 'AGENTS.md',
    askToolName: 'AskUserQuestion'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini CLI',
    skillRootDir: '.gemini/skills',
    frontmatterProfile: 'standard',
    metadataFiles: [],
    guideFileName: 'AGENTS.md',
    askToolName: 'AskUserQuestion'
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    skillRootDir: '.github/skills',
    frontmatterProfile: 'copilot',
    metadataFiles: [],
    guideFileName: 'AGENTS.md',
    askToolName: 'AskUserQuestion'
  }
}

export const DEFAULT_TOOL_ORDER: ToolId[] = [
  'agents',
  'cursor',
  'claude',
  'codex',
  'antigravity',
  'gemini',
  'copilot'
]

export interface ToolChoice {
  id: ToolId
  name: string
}

export function getToolChoices(): ToolChoice[] {
  return DEFAULT_TOOL_ORDER.map((id) => ({ id, name: TOOL_TARGET_MAP[id].name }))
}

export function parseToolIds(toolsText: string): ToolId[] {
  const parsed = toolsText
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  if (parsed.length === 0) {
    return [...DEFAULT_TOOL_ORDER]
  }

  const uniqueIds: ToolId[] = []

  for (const value of parsed) {
    if (!isToolId(value)) {
      throw new Error(`不支持的工具标识: ${value}。可选值: ${DEFAULT_TOOL_ORDER.join(', ')}`)
    }

    if (!uniqueIds.includes(value)) {
      uniqueIds.push(value)
    }
  }

  return uniqueIds
}

export function resolveToolTargets(tools?: ToolId[]): ToolTarget[] {
  const selected = tools && tools.length > 0 ? tools : DEFAULT_TOOL_ORDER
  return selected.map((id) => ({ ...TOOL_TARGET_MAP[id] }))
}

export function detectConfiguredToolIds(cwd: string): ToolId[] {
  return DEFAULT_TOOL_ORDER.filter((toolId) => {
    const target = TOOL_TARGET_MAP[toolId]
    return existsSync(resolveSkillPaths(target, cwd).skillFile)
  })
}

// ── Skill 路径解析 ───────────────────────────────────

export interface SkillPaths {
  skillDir: string
  skillFile: string
  openaiMetadataFile: string
}

export function resolveSkillPaths(target: ToolTarget, cwd: string): SkillPaths {
  const skillDir = resolve(cwd, target.skillRootDir, SKILL_NAME)
  return {
    skillDir,
    skillFile: resolve(skillDir, SKILL_FILE_NAME),
    openaiMetadataFile: resolve(skillDir, 'agents/openai.yaml')
  }
}

function isToolId(value: string): value is ToolId {
  return Object.hasOwn(TOOL_TARGET_MAP, value)
}
