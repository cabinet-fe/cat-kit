import { access, mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 检查路径是否存在
 * @param path - 要检查的路径
 * @returns 路径是否存在
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * 确保目录存在，如果不存在则创建
 * @param dir - 目录路径
 */
export async function ensureDir(dir: string): Promise<void> {
  if (!(await pathExists(dir))) {
    await mkdir(dir, { recursive: true })
  }
}

/**
 * 读取文件内容
 * @param path - 文件路径
 * @returns 文件内容，如果文件不存在返回 null
 */
export async function readFileContent(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8')
  } catch {
    return null
  }
}

/**
 * 写入文件
 * @param path - 文件路径
 * @param content - 文件内容
 */
export async function writeFileContent(
  path: string,
  content: string
): Promise<void> {
  await writeFile(path, content, 'utf-8')
}

/**
 * 复制文件
 * @param src - 源文件路径
 * @param dest - 目标文件路径
 */
export async function copyFileContent(
  src: string,
  dest: string
): Promise<void> {
  await copyFile(src, dest)
}

/**
 * 获取模板目录的绝对路径
 * 在开发时指向 src 同级的 templates 目录
 * 在发布后指向 dist 同级的 templates 目录
 */
export function getTemplatesDir(): string {
  // 从 src/utils/fs.ts 或 dist/index.js 回溯到包根目录
  // __dirname 在开发时是 src/utils，在构建后是 dist
  const packageRoot = join(__dirname, '..', '..')
  return join(packageRoot, 'templates')
}

/**
 * 获取语言模板目录路径
 */
export function getLanguageTemplatesDir(): string {
  return join(getTemplatesDir(), 'languages')
}

/**
 * 获取 dev-prompts 目录路径
 * @param cwd - 当前工作目录
 */
export function getDevPromptsDir(cwd: string = process.cwd()): string {
  return join(cwd, 'dev-prompts')
}

/**
 * 获取 AGENTS.md 文件路径
 * @param cwd - 当前工作目录
 */
export function getAgentsPath(cwd: string = process.cwd()): string {
  return join(cwd, 'AGENTS.md')
}
