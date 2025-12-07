import { readFileSync } from 'node:fs'
import fg from 'fast-glob'
import type { PackageJson } from '../types'

/**
 * 同步读取 JSON 文件
 */
export function readJsonSync<T>(filePath: string): T {
  const content = readFileSync(filePath, 'utf-8')
  return JSON.parse(content) as T
}

/**
 * 使用 fast-glob 匹配工作区
 * @param patterns - workspace 模式列表
 * @param cwd - 根目录
 * @returns 匹配的目录路径列表（相对路径）
 */
export function matchWorkspaces(patterns: string[], cwd: string): string[] {
  // 将 workspace 模式转换为 glob 模式（匹配 package.json）
  const globPatterns = patterns.map(pattern => `${pattern}/package.json`)

  const matches = fg.sync(globPatterns, {
    cwd,
    onlyFiles: true,
    ignore: ['**/node_modules/**']
  })

  // 返回目录路径（移除 /package.json 后缀）
  return matches.map(match => match.replace(/\/package\.json$/, ''))
}

/**
 * 获取同时在 peerDependencies 和 devDependencies 中的依赖作为 external
 */
export function getPeerDevExternal(pkg: PackageJson): string[] {
  const peerDeps = pkg.peerDependencies || {}
  const devDeps = pkg.devDependencies || {}
  const devDepsSet = new Set(Object.keys(devDeps))

  return Object.keys(peerDeps).filter(dep =>
    devDepsSet.has(dep) && devDeps[dep]?.startsWith('workspace:')
  )
}

