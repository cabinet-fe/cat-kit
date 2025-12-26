import { homedir, platform, type, release } from 'node:os'
import { join } from 'node:path'

/** 支持的 AI CLI 工具 */
export type SupportedCLI = 'claude' | 'codex' | 'gemini'

/** CLI 工具配置 */
export interface CLIConfig {
  /** CLI 工具标识符 */
  id: SupportedCLI
  /** CLI 工具显示名称 */
  name: string
  /** 配置目录名称（相对于用户主目录） */
  dirName: string
  /** 配置文件名称 */
  fileName: string
}

/** 支持的 CLI 工具配置列表 */
export const CLI_CONFIGS: CLIConfig[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    dirName: '.claude',
    fileName: 'CLAUDE.md'
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    dirName: '.codex',
    fileName: 'AGENTS.md'
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    dirName: '.gemini',
    fileName: 'GEMINI.md'
  }
]

/**
 * 获取 CLI 工具的配置文件完整路径
 * @param cli - CLI 工具配置
 * @returns 配置文件的完整路径
 */
export function getCLIConfigPath(cli: CLIConfig): string {
  const home = homedir()
  return join(home, cli.dirName, cli.fileName)
}

/**
 * 获取 CLI 工具的配置目录路径
 * @param cli - CLI 工具配置
 * @returns 配置目录的完整路径
 */
export function getCLIConfigDir(cli: CLIConfig): string {
  const home = homedir()
  return join(home, cli.dirName)
}

/**
 * 获取当前操作系统的友好名称
 * @returns 操作系统名称描述
 */
export function getOSDescription(): string {
  const osType = type()
  const osRelease = release()
  const osPlatform = platform()

  switch (osPlatform) {
    case 'win32': {
      // Windows 10/11 的版本号判断
      const majorVersion = parseInt(osRelease.split('.')[0]!, 10)
      if (majorVersion >= 10) {
        // Windows 10 build 22000+ 是 Windows 11
        const buildNumber = parseInt(osRelease.split('.')[2]!, 10)
        if (buildNumber >= 22000) {
          return 'Windows 11'
        }
        return 'Windows 10'
      }
      return `Windows (${osRelease})`
    }
    case 'darwin': {
      return `macOS (Darwin ${osRelease})`
    }
    case 'linux': {
      return `Linux (${osType} ${osRelease})`
    }
    default: {
      return `${osType} ${osRelease}`
    }
  }
}

/**
 * 根据 ID 获取 CLI 配置
 * @param id - CLI 工具标识符
 * @returns CLI 配置，如果未找到返回 undefined
 */
export function getCLIConfigById(id: SupportedCLI): CLIConfig | undefined {
  return CLI_CONFIGS.find(cli => cli.id === id)
}
