import p from 'node:path'
import type { InputOption, RolldownPluginOption } from 'rolldown'

export function pkgTo(pkgDir: string, targetPath: string) {
  if (p.isAbsolute(targetPath)) {
    throw new Error('targetPath 不能是一个绝对路径')
  }
  return p.resolve(pkgDir, targetPath)
}

/**
 * 获取构建输入
 * @param dir 包目录
 * @param input 输入选项
 * @returns
 */
export function getBuildInput(dir: string, input: InputOption): InputOption {
  if (typeof input === 'string') {
    return pkgTo(dir, input)
  }

  if (Array.isArray(input)) {
    return input.map(i => getBuildInput(dir, i) as string)
  }

  return Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, getBuildInput(dir, v) as string])
  )
}

export async function getPlugins(
  plugins: RolldownPluginOption
): Promise<RolldownPluginOption[]> {
  if (plugins instanceof Promise) {
    plugins = await plugins
  }

  if (Array.isArray(plugins)) {
    return plugins
  }

  if (!plugins) {
    return []
  }

  return [plugins]
}
