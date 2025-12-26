import { checkbox, confirm } from '@inquirer/prompts'

/** 支持的编程语言 */
export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'java'
  | 'rust'

/** 语言选项配置 */
const languageChoices: Array<{ name: string; value: SupportedLanguage }> = [
  { name: 'TypeScript', value: 'typescript' },
  { name: 'JavaScript', value: 'javascript' },
  { name: 'Python', value: 'python' },
  { name: 'Go', value: 'go' },
  { name: 'Java', value: 'java' },
  { name: 'Rust', value: 'rust' }
]

/** 用户配置选项 */
export interface UserConfig {
  /** 选择的编程语言 */
  languages: SupportedLanguage[]
  /** 是否使用开发权重模型 */
  useWeightModel: boolean
}

/**
 * 询问用户配置选项
 * @returns 用户配置
 */
export async function askUserConfig(): Promise<UserConfig> {
  const languages = await checkbox<SupportedLanguage>({
    message: '请选择项目使用的编程语言（可多选）：',
    choices: languageChoices,
    required: true
  })

  const useWeightModel = await confirm({
    message: '是否启用开发权重模型？（用于指导 AI 在正确性/性能/扩展性/安全性/前瞻性之间的权衡）',
    default: true
  })

  return {
    languages,
    useWeightModel
  }
}

