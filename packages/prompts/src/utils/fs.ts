import { join, dirname } from 'node:path'
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
  // 从 src/utils/fs.ts 或 dist/index.js 回溯到包根目录
  // __dirname 在开发时是 src/utils，在构建后是 dist
  const packageRoot = join(__dirname, '..', '..')
  return join(packageRoot, 'templates')
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
