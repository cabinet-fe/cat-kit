import type { SupportedLanguage } from './questions.js'

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
 * AGENTS.md 引导块的标识符（用于检测是否已存在）
 */
export const AGENTS_BLOCK_MARKER = '<!-- dev-prompts-block -->'

/**
 * 生成 AGENTS.md 引导块内容
 * @param languages - 选择的编程语言
 * @param useWeightModel - 是否使用开发权重模型
 * @returns 引导块内容
 */
export function generateAgentsBlock(
  languages: SupportedLanguage[],
  useWeightModel: boolean
): string {
  const languageList = languages
    .map(lang => `- [${languageNames[lang]}](dev-prompts/languages/${lang}.md)`)
    .join('\n')

  const weightModelSection = useWeightModel
    ? `
### 开发权重模型

在进行设计和实现决策时，请参考开发权重模型：

- [开发权重模型](dev-prompts/weight-model.md)

该模型定义了正确性、安全性、性能、可扩展性和前瞻性之间的优先级关系。
`
    : ''

  return `${AGENTS_BLOCK_MARKER}
## 开发提示词

本项目使用 dev-prompts 管理 AI 开发提示词。在编写代码时，请遵循以下规范：

### 代码风格指南

${languageList}
${weightModelSection}
### 使用说明

1. 在开始编码前，请阅读对应语言的代码风格指南
2. 遵循指南中的命名规范、类型规范和最佳实践
3. 在代码审查时，可引用这些规范进行讨论

---
`
}

/**
 * 检查 AGENTS.md 内容是否包含 dev-prompts 引导块
 * @param content - AGENTS.md 文件内容
 * @returns 是否包含引导块
 */
export function hasAgentsBlock(content: string): boolean {
  return content.includes(AGENTS_BLOCK_MARKER)
}

/**
 * 更新 AGENTS.md 内容，添加或替换引导块
 * @param content - 原始 AGENTS.md 内容
 * @param newBlock - 新的引导块内容
 * @returns 更新后的内容
 */
export function updateAgentsContent(
  content: string,
  newBlock: string
): string {
  if (hasAgentsBlock(content)) {
    // 替换现有引导块
    const blockStart = content.indexOf(AGENTS_BLOCK_MARKER)
    const blockEnd = content.indexOf('---', blockStart + AGENTS_BLOCK_MARKER.length)

    if (blockEnd !== -1) {
      const before = content.slice(0, blockStart)
      const after = content.slice(blockEnd + 3) // +3 for '---'
      return before + newBlock + after.trimStart()
    }
  }

  // 在文件开头添加引导块
  return newBlock + '\n' + content
}

/**
 * 生成默认的 AGENTS.md 内容
 * @param projectName - 项目名称
 * @param languages - 选择的编程语言
 * @param useWeightModel - 是否使用开发权重模型
 * @returns 完整的 AGENTS.md 内容
 */
export function generateDefaultAgentsContent(
  projectName: string,
  languages: SupportedLanguage[],
  useWeightModel: boolean
): string {
  const block = generateAgentsBlock(languages, useWeightModel)

  return `# ${projectName}

本文件为智能体提供项目级别的开发指导。

${block}

## 项目概述

请在此描述项目的基本信息和目标。

## 技术栈

请在此列出项目使用的主要技术和框架。

## 开发指南

请在此添加项目特定的开发指南和规范。
`
}

