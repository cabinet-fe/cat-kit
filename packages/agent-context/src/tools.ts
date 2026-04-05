import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { SKILL_NAME } from './constants'
import type { ToolId, ToolTarget } from './types'

const SKILL_FILE_NAME = 'SKILL.md'

const TOOL_TARGET_MAP: Record<ToolId, ToolTarget> = {
  agents: {
    id: 'agents',
    name: 'Agent Skills（开放标准）',
    skillRootDir: '.agents/skills',
    frontmatterProfile: 'standard',
    metadataFiles: [],
    guideFileName: 'AGENTS.md',
    askToolName: 'AskUserQuestion'
  },
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
    askToolName: 'askQuestions'
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

export function parseCommaSeparatedIds<T extends string>(
  raw: string,
  isValid: (value: string) => value is T,
  validOptions: readonly T[]
): T[] {
  const parsed = raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  const result: T[] = []
  for (const value of parsed) {
    if (!isValid(value)) {
      throw new Error(`不支持的工具标识: ${value}。可选值: ${validOptions.join(', ')}`)
    }
    if (!result.includes(value)) {
      result.push(value)
    }
  }
  return result
}

export function parseToolIds(toolsText: string): ToolId[] {
  const result = parseCommaSeparatedIds(toolsText, isToolId, DEFAULT_TOOL_ORDER)
  return result.length === 0 ? [...DEFAULT_TOOL_ORDER] : result
}

export function resolveToolTargets(tools?: ToolId[]): ToolTarget[] {
  const selected = tools && tools.length > 0 ? tools : DEFAULT_TOOL_ORDER
  return selected.map((id) => ({ ...TOOL_TARGET_MAP[id] }))
}

/** sync：项目中每一处已检测到 SKILL.md 的 ac-workflow 安装路径（整目录产物同步） */
export function resolveSyncToolTargets(cwd: string): ToolTarget[] {
  return detectConfiguredToolIds(cwd).map((id) => resolveToolTargetById(id))
}

export function resolveToolTargetById(id: ToolId): ToolTarget {
  return { ...TOOL_TARGET_MAP[id] }
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
