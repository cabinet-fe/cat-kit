import type { BuildConfig } from "../build"
import type { PackageJson } from "../types"
import type { BumpOptions } from "../version/types"
import type { PublishOptions } from "../release/types"

/**
 * Monorepo 工作区信息
 */
export interface MonorepoWorkspace {
  /** 包名称 */
  name: string
  /** 包目录（绝对路径） */
  dir: string
  /** 包版本 */
  version: string
  /** package.json 内容 */
  pkg: PackageJson
  /** 是否为私有包 */
  private: boolean
}

/**
 * Monorepo 根目录信息
 */
export interface MonorepoRoot {
  /** 根目录（绝对路径） */
  dir: string
  /** package.json 内容 */
  pkg: PackageJson
  /** 工作区 glob 模式 */
  workspacePatterns: string[]
}

/**
 * 工作区构建配置（不包含 dir）
 */
export type WorkspaceBuildConfig = Omit<BuildConfig, 'dir'>

/**
 * 工作区分组构建选项
 */
export interface GroupBuildOptions {
  /** 是否并行构建同一批次的包，默认 true */
  parallel?: boolean
}

/**
 * 工作区分组版本更新选项
 */
export interface GroupBumpOptions extends BumpOptions {
  /** 是否同步 peerDependencies，默认 true */
  syncPeer?: boolean
  /** 是否同步 dependencies 中的 workspace:* 引用，默认 true */
  syncDeps?: boolean
}

/**
 * 工作区分组发布选项
 */
export interface GroupPublishOptions extends Omit<PublishOptions, 'cwd'> {
  /** 是否跳过私有包，默认 true */
  skipPrivate?: boolean
}

/**
 * 构建结果摘要
 */
export interface BuildSummary {
  /** 总耗时（毫秒） */
  totalDuration: number
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failedCount: number
  /** 各包构建结果 */
  results: Array<{
    name: string
    success: boolean
    duration: number
    error?: Error
  }>
}

/**
 * 验证结果
 */
export interface MonorepoValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 是否有循环依赖 */
  hasCircular: boolean
  /** 循环依赖链 */
  circularChains: string[][]
  /** 版本不一致的依赖 */
  inconsistentDeps: Array<{
    name: string
    versions: Array<{ version: string; usedBy: string[] }>
  }>
}

/**
 * 依赖图结果
 */
export interface DependencyGraphResult {
  /** 节点列表 */
  nodes: Array<{
    id: string
    version: string
    external: boolean
  }>
  /** 边列表 */
  edges: Array<{
    from: string
    to: string
    type: 'dependencies' | 'devDependencies' | 'peerDependencies'
  }>
  /** Mermaid 格式的依赖图 */
  mermaid: string
}

/**
 * 并行发布结果
 */
export interface PublishGroupResult {
  /** 各包发布结果 */
  results: Array<{
    /** 包名称 */
    name: string
    /** 是否成功 */
    success: boolean
    /** 错误信息（失败时） */
    error?: Error
  }>
  /** 是否有失败的包 */
  hasFailure: boolean
}

/**
 * 回滚上下文
 */
export interface RollbackContext {
  /** 原始版本号 */
  originalVersion: string
  /** 需要回滚的包目录列表 */
  packageDirs: string[]
  /** Git 提交哈希（用于 reset） */
  commitHash?: string
}