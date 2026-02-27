import { join } from 'node:path'
import { checkbox, confirm } from '@inquirer/prompts'
import { ensureDir, writeFile, existsSync, readFile } from '@cat-kit/be'
import { getTemplatesDir } from '../utils/fs'
import {
  CLI_CONFIGS,
  getCLIConfigPath,
  getCLIConfigDir,
  getOSDescription,
  type CLIConfig,
  type SupportedCLI
} from '../utils/os'

/**
 * 读取用户提示词模板文件
 * @returns 模板内容
 */
async function readUserPromptTemplate(): Promise<string> {
  const templatePath = join(getTemplatesDir(), 'user-prompt.md')
  const content = await readFile(templatePath, 'utf-8')
  if (!content) {
    throw new Error(`无法读取模板文件: ${templatePath}`)
  }
  return content
}

/**
 * Claude Code 特殊规则
 */
const CLAUDE_SPECIAL_RULES = `
## 项目指导文件

- 使用\`<project>/AGENTS.md\`替代\`<project>/CLAUDE.md\`文件作为**项目指导**。
`

/**
 * 生成用户提示词内容（替换 OS 占位符）
 * @param cli - CLI 工具配置（可选，用于添加特定工具的规则）
 * @returns 处理后的提示词内容
 */
async function generateUserPromptContent(cli?: CLIConfig): Promise<string> {
  const template = await readUserPromptTemplate()
  const osDescription = getOSDescription()
  let content = template.replace('{{OS}}', osDescription)

  // 为 Claude Code 添加特殊规则
  if (cli?.id === 'claude') {
    content += CLAUDE_SPECIAL_RULES
  }

  return content
}

/**
 * 询问用户要配置哪些 CLI 工具
 * @returns 选择的 CLI 工具配置列表
 */
async function askCLISelection(): Promise<CLIConfig[]> {
  const choices = CLI_CONFIGS.map(cli => ({
    name: cli.name,
    value: cli.id
  }))

  const selectedIds = await checkbox<SupportedCLI>({
    message: '请选择要配置的 AI CLI 工具（可多选）：',
    choices,
    required: true
  })

  return CLI_CONFIGS.filter(cli => selectedIds.includes(cli.id))
}

/**
 * 检查配置文件是否存在并询问是否覆盖
 * @param cli - CLI 工具配置
 * @returns 是否继续写入
 */
async function checkAndConfirmOverwrite(cli: CLIConfig): Promise<boolean> {
  const configPath = getCLIConfigPath(cli)

  if (existsSync(configPath)) {
    const shouldOverwrite = await confirm({
      message: `${cli.name} 配置文件已存在 (${configPath})，是否覆盖？`,
      default: false
    })
    return shouldOverwrite
  }

  return true
}

/**
 * 写入配置文件到指定 CLI 工具目录
 * @param cli - CLI 工具配置
 * @param content - 提示词内容
 * @returns 是否写入成功
 */
async function writeConfigFile(
  cli: CLIConfig,
  content: string
): Promise<boolean> {
  const configDir = getCLIConfigDir(cli)
  const configPath = getCLIConfigPath(cli)

  try {
    // 确保目录存在
    await ensureDir(configDir)
    // 写入配置文件
    await writeFile(configPath, content)
    return true
  } catch (error) {
    console.error(`  ❌ 写入 ${cli.name} 配置失败: ${error}`)
    return false
  }
}

/**
 * setup 命令主函数
 */
export async function setupCommand(): Promise<void> {
  console.log('\n🔧 设置用户级 AI 提示词配置\n')

  // 1. 显示当前操作系统信息
  const osDescription = getOSDescription()
  console.log(`📍 检测到操作系统: ${osDescription}\n`)

  // 2. 询问用户要配置哪些 CLI 工具
  const selectedCLIs = await askCLISelection()

  if (selectedCLIs.length === 0) {
    console.log('\n⚠️ 未选择任何 CLI 工具，操作取消。\n')
    return
  }

  // 3. 逐个处理选择的 CLI 工具
  console.log('\n📝 配置文件写入：\n')

  const results: Array<{ cli: CLIConfig; success: boolean; skipped: boolean }> =
    []

  for (const cli of selectedCLIs) {
    const shouldWrite = await checkAndConfirmOverwrite(cli)

    if (!shouldWrite) {
      console.log(`  ⏭️  跳过 ${cli.name}`)
      results.push({ cli, success: false, skipped: true })
      continue
    }

    // 为每个 CLI 工具生成定制化的提示词内容
    const promptContent = await generateUserPromptContent(cli)
    const success = await writeConfigFile(cli, promptContent)
    if (success) {
      console.log(`  ✅ ${cli.name} 配置已写入: ${getCLIConfigPath(cli)}`)
    }
    results.push({ cli, success, skipped: false })
  }

  // 5. 输出结果摘要
  console.log('\n✨ 设置完成！\n')

  const successCount = results.filter(r => r.success).length
  const skippedCount = results.filter(r => r.skipped).length
  const failedCount = results.filter(r => !r.success && !r.skipped).length

  if (successCount > 0) {
    console.log(`  ✅ 成功配置: ${successCount} 个`)
  }
  if (skippedCount > 0) {
    console.log(`  ⏭️  已跳过: ${skippedCount} 个`)
  }
  if (failedCount > 0) {
    console.log(`  ❌ 配置失败: ${failedCount} 个`)
  }

  console.log(
    '\n💡 提示：这些配置文件会被相应的 AI CLI 工具自动读取，作为全局用户级提示词。'
  )
  console.log()
}
