import { createRequire, builtinModules } from 'node:module'

const _require = createRequire(import.meta.url)

/**
 * 是否为 Node.js 内置模块
 */
export function isBuiltin(moduleId: string): boolean {
  return moduleId.startsWith('node:') || builtinModules.includes(moduleId)
}

/**
 * 获取模块路径
 * @param moduleId 模块id
 * @param options 解析选项
 */
export function getModulePath(
  moduleId: string,
  options: {
    paths?: string[]
  } = {}
): string | undefined {
  const { paths = [process.cwd()] } = options

  if (isBuiltin(moduleId)) return moduleId

  try {
    return _require.resolve(moduleId, { paths })
  } catch {
    return undefined
  }
}

/**
 * 是否存在模块
 * @param moduleId 模块id
 * @param paths 自定义查找路径
 */
export function existModule(moduleId: string, paths?: string[]): boolean {
  return !!getModulePath(moduleId, { paths })
}
