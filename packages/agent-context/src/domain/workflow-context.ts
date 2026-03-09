import type { ToolTarget } from './types'

export interface WorkflowContext {
  /** 命令引用: 'ac:init' | 'ac-init' */
  cmd(name: string): string
  /** 命令调用: '/ac:init' | '#ac-init' */
  invoke(name: string): string
  /** 命令前缀模式: 'ac:' | 'ac-' */
  cmdPrefix(): string
  /** 生成 YAML frontmatter 或空字符串 */
  frontmatter(description: string): string
}

export function createWorkflowContext(target: ToolTarget): WorkflowContext {
  const sep = target.commandSeparator
  const pre = target.commandPrefix
  return {
    cmd: (name) => `ac${sep}${name}`,
    invoke: (name) => `${pre}ac${sep}${name}`,
    cmdPrefix: () => `ac${sep}`,
    frontmatter: (desc) => (target.supportsFrontmatter ? `---\ndescription: ${desc}\n---\n\n` : '')
  }
}

export const fence = '```'
export const code = (t: string) => `\`${t}\``

export interface NextStep {
  command: string
  description: string
}

export function renderNextSteps(c: WorkflowContext, steps: NextStep[]): string {
  const items = steps.map((s) => `${code(c.invoke(s.command))}（${s.description}）`).join(' | ')

  return `> **下一步：** ${items}`
}

const LIFECYCLE_COMMANDS = ['init', 'plan', 'replan', 'implement', 'patch', 'done'] as const

export function renderPreamble(c: WorkflowContext, current: string, description: string): string {
  const lifecycle = LIFECYCLE_COMMANDS.map((cmd) => {
    const ref = code(c.cmd(cmd))
    return cmd === current ? `**${ref}**` : ref
  }).join(' → ')

  return `${description}\n\n生命周期: ${lifecycle}。`
}
