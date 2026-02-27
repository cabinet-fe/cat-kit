import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 获取模板目录的绝对路径
 *
 * 在开发时指向 src 同级的 templates 目录，
 * 在发布后指向 dist 同级的 templates 目录。
 *
 * @returns 模板目录的绝对路径
 */
export function getTemplatesDir(): string {
  return resolve(__dirname, '../../templates')
}

/**
 * 获取语言模板目录路径
 *
 * @returns 语言模板目录的绝对路径
 */
export function getLanguageTemplatesDir(): string {
  return join(getTemplatesDir(), 'languages')
}

/**
 * 获取 dev-prompts 目录路径
 *
 * @param cwd - 当前工作目录，默认为 process.cwd()
 * @returns dev-prompts 目录的绝对路径
 */
export function getDevPromptsDir(cwd: string = process.cwd()): string {
  return join(cwd, 'dev-prompts')
}

/**
 * 获取 AGENTS.md 文件路径
 *
 * @param cwd - 当前工作目录，默认为 process.cwd()
 * @returns AGENTS.md 文件的绝对路径
 */
export function getAgentsPath(cwd: string = process.cwd()): string {
  return join(cwd, 'AGENTS.md')
}
