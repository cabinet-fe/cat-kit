import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/**
 * 获取模块路径
 * @param moduleId 模块id
 */
export function getModulePath(moduleId: string): string | undefined {
  try {
    return require.resolve(moduleId)
  } catch {}
  return undefined
}

/**
 * 是否存在模块
 * @param moduleId 模块id
 */
export function existModule(moduleId: string): boolean {
  if (getModulePath(moduleId)) return true
  return false
}
