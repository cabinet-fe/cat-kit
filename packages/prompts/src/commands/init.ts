import { join, basename } from 'node:path'
import {
  ensureDir,
  writeFile,
  existsSync,
  copyFile,
  readFile
} from '@cat-kit/be'
import {
  getDevPromptsDir,
  getAgentsPath,
  getTemplatesDir,
  getLanguageTemplatesDir
} from '../utils/fs'
import {
  askUserConfig,
  type UserConfig,
  type SupportedLanguage
} from '../utils/questions'
import {
  hasAgentsBlock,
  generateAgentsBlock,
  updateAgentsContent,
  generateDefaultAgentsContent
} from '../utils/templates'

/** 检测结果 */
interface DetectionResult {
  /** dev-prompts 文件夹是否存在 */
  devPromptsDirExists: boolean
  /** AGENTS.md 文件是否存在 */
  agentsFileExists: boolean
  /** AGENTS.md 是否包含引导块 */
  hasAgentsBlock: boolean
  /** AGENTS.md 内容 */
  agentsContent: string | null
}

/**
 * 检测当前目录的配置状态
 */
async function detectCurrentState(cwd: string): Promise<DetectionResult> {
  const devPromptsDir = getDevPromptsDir(cwd)
  const agentsPath = getAgentsPath(cwd)

  const agentsFileExists = existsSync(agentsPath)
  const devPromptsDirExists = existsSync(devPromptsDir)
  const agentsContent = agentsFileExists
    ? await readFile(agentsPath, 'utf-8')
    : null

  return {
    devPromptsDirExists,
    agentsFileExists,
    hasAgentsBlock: agentsContent ? hasAgentsBlock(agentsContent) : false,
    agentsContent
  }
}

/**
 * 打印检测状态
 */
function printDetectionStatus(result: DetectionResult): void {
  console.log('\n📋 检测当前配置状态：\n')

  const status = (ok: boolean) => (ok ? '✅' : '❌')

  console.log(`  ${status(result.devPromptsDirExists)} dev-prompts 文件夹`)
  console.log(`  ${status(result.agentsFileExists)} AGENTS.md 文件`)
  console.log(`  ${status(result.hasAgentsBlock)} AGENTS.md 引导块`)
  console.log()
}

/**
 * 复制语言提示词文件
 */
async function copyLanguageFiles(
  config: UserConfig,
  devPromptsDir: string
): Promise<void> {
  const languagesDir = join(devPromptsDir, 'languages')
  await ensureDir(languagesDir)

  const sourceDir = getLanguageTemplatesDir()

  for (const lang of config.languages) {
    const fileName = `${lang}.md`
    const sourcePath = join(sourceDir, fileName)
    const destPath = join(languagesDir, fileName)

    await copyFile(sourcePath, destPath)
  }
}

/**
 * 复制开发权重模型文件
 */
async function copyWeightModelFile(devPromptsDir: string): Promise<void> {
  const sourcePath = join(getTemplatesDir(), 'weight-model.md')
  const destPath = join(devPromptsDir, 'weight-model.md')

  await copyFile(sourcePath, destPath)
  console.log('  ✅ 复制开发权重模型')
}

/**
 * 更新或创建 AGENTS.md 文件
 */
async function updateAgentsFile(
  config: UserConfig,
  detection: DetectionResult,
  cwd: string
): Promise<void> {
  const agentsPath = getAgentsPath(cwd)
  const projectName = basename(cwd)

  if (detection.agentsFileExists && detection.agentsContent) {
    if (detection.hasAgentsBlock) {
      // 更新现有引导块
      const newBlock = await generateAgentsBlock(
        config.languages,
        config.useWeightModel
      )
      const updatedContent = updateAgentsContent(
        detection.agentsContent,
        newBlock
      )
      await writeFile(agentsPath, updatedContent)
    } else {
      // AGENTS.md 存在但没有引导块，追加引导块
      const newBlock = await generateAgentsBlock(
        config.languages,
        config.useWeightModel
      )
      const updatedContent = updateAgentsContent(
        detection.agentsContent,
        newBlock
      )
      await writeFile(agentsPath, updatedContent)
    }
  } else {
    // 创建新文件
    const content = await generateDefaultAgentsContent(
      projectName,
      config.languages,
      config.useWeightModel
    )
    await writeFile(agentsPath, content)
    console.log('  ✅ 创建 AGENTS.md 文件')
  }
}

/**
 * 获取语言对应的文件名
 */
function getLanguageFileName(language: SupportedLanguage): string {
  return `${language}.md`
}

/**
 * init 命令主函数
 */
export async function initCommand(): Promise<void> {
  const cwd = process.cwd()

  console.log('\n🚀 初始化开发提示词配置\n')

  // 1. 检测当前状态
  const detection = await detectCurrentState(cwd)
  printDetectionStatus(detection)

  // 2. 询问用户配置
  console.log('📝 配置选项：\n')
  const config = await askUserConfig()

  const devPromptsDir = getDevPromptsDir(cwd)
  await ensureDir(devPromptsDir)

  // 复制语言提示词
  await copyLanguageFiles(config, devPromptsDir)

  // 复制开发权重模型
  if (config.useWeightModel) {
    await copyWeightModelFile(devPromptsDir)
  }

  // 更新 AGENTS.md
  await updateAgentsFile(config, detection, cwd)

  // 4. 完成提示
  console.log('\n✨ 初始化完成！\n')
  console.log('生成的文件结构：')
  console.log('  dev-prompts/')
  console.log('  ├── languages/')
  for (const lang of config.languages) {
    console.log(`  │   └── ${getLanguageFileName(lang)}`)
  }
  if (config.useWeightModel) {
    console.log('  └── weight-model.md')
  }
  console.log('  AGENTS.md')
  console.log()
  console.log(
    '💡 提示：AGENTS.md 中的链接使用相对路径引用，AI 助手会按需读取对应的提示词文件。'
  )
  console.log()
}
