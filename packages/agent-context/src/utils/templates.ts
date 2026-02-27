import { join } from 'node:path'
import { getTemplatesDir } from './fs.js'
import type { SupportedLanguage } from './questions.js'
import { readFile } from 'node:fs/promises'

/** 语言显示名称映射 */
export const languageNames: Record<SupportedLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  go: 'Go',
  java: 'Java',
  rust: 'Rust'
}

/**
 * AGENTS.md 引导块的开始标识符
 */
export const AGENTS_BLOCK_START = '<!-- DEV_PROMPTS:START -->'

/**
 * AGENTS.md 引导块的结束标识符
 */
export const AGENTS_BLOCK_END = '<!-- DEV_PROMPTS:END -->'

/**
 * 读取 agents-block.md 模板文件
 * @returns 模板内容
 */
async function readAgentsBlockTemplate(): Promise<string> {
  const templatePath = join(getTemplatesDir(), 'agents-block.md')
  const content = await readFile(templatePath, 'utf-8')
  if (!content) {
    throw new Error(`无法读取模板文件: ${templatePath}`)
  }
  return content
}

/**
 * 生成语言列表内容
 * @param languages - 选择的编程语言
 * @returns 语言列表 Markdown
 */
function generateLanguageList(languages: SupportedLanguage[]): string {
  return languages
    .map(lang => `- [${languageNames[lang]}](dev-prompts/languages/${lang}.md)`)
    .join('\n')
}

/**
 * 生成 AGENTS.md 引导块内容
 * @param languages - 选择的编程语言
 * @returns 引导块内容
 */
export async function generateAgentsBlock(
  languages: SupportedLanguage[]
): Promise<string> {
  const template = await readAgentsBlockTemplate()

  const languageList = generateLanguageList(languages)

  const prompts = template.replace('{{LANGUAGE_LIST}}', languageList)

  return AGENTS_BLOCK_START + '\n\n' + prompts + '\n\n' + AGENTS_BLOCK_END
}

/**
 * 检查 AGENTS.md 内容是否包含 dev-prompts 引导块
 * @param content - AGENTS.md 文件内容
 * @returns 是否包含引导块
 */
export function hasAgentsBlock(content: string): boolean {
  return (
    content.includes(AGENTS_BLOCK_START) && content.includes(AGENTS_BLOCK_END)
  )
}

/**
 * 查找引导块在内容中的位置
 * @param content - AGENTS.md 文件内容
 * @returns 块的起始和结束位置，如果未找到返回 null
 */
function findAgentsBlockPosition(
  content: string
): { start: number; end: number } | null {
  const startIndex = content.indexOf(AGENTS_BLOCK_START)
  const endIndex = content.indexOf(AGENTS_BLOCK_END)

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null
  }

  return {
    start: startIndex,
    end: endIndex + AGENTS_BLOCK_END.length
  }
}

/**
 * 更新 AGENTS.md 内容，添加或替换引导块
 * @param content - 原始 AGENTS.md 内容
 * @param newBlock - 新的引导块内容
 * @returns 更新后的内容
 */
export function updateAgentsContent(content: string, newBlock: string): string {
  const position = findAgentsBlockPosition(content)

  if (position) {
    // 替换现有引导块
    const before = content.slice(0, position.start)
    const after = content.slice(position.end)
    return before + newBlock + after.replace(/^\n+/, '\n')
  }

  // 在文件末尾添加引导块
  const trimmedContent = content.trimEnd()
  return trimmedContent + '\n\n' + newBlock
}

/**
 * 生成默认的 AGENTS.md 内容
 * @param languages - 选择的编程语言
 * @returns 完整的 AGENTS.md 内容
 */
export async function generateDefaultAgentsContent(
  languages: SupportedLanguage[]
): Promise<string> {
  const block = await generateAgentsBlock(languages)

  return block
}
