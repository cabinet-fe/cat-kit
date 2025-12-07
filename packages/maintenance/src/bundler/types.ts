/**
 * 包构建选项
 */
export interface BundlePackageOption {
  /** 包目录（绝对路径） */
  dir: string
  /** 构建配置 */
  build: BundleBuildConfig
  /** 输出配置 */
  output?: BundleOutputConfig
}

/**
 * 构建配置
 */
export interface BundleBuildConfig {
  /** 入口文件路径 */
  input: string
  /** 是否生成 d.ts 文件 */
  dts?: boolean
  /** 外部依赖 */
  external?: string[]
  /** 构建平台 */
  platform?: 'neutral' | 'node' | 'browser'
}

/**
 * 输出配置
 */
export interface BundleOutputConfig {
  /** 输出目录 */
  dir?: string
  /** 是否生成 sourcemap */
  sourcemap?: boolean
}

/**
 * 包构建配置（内部使用）
 */
export interface BundlePackageConfig {
  /** 包名称 */
  name: string
  /** 包目录 */
  dir: string
  /** 包依赖 */
  deps?: string[]
  /** 构建配置 */
  build: BundleBuildConfig
  /** 输出配置 */
  output?: BundleOutputConfig
}

/**
 * 构建结果
 */
export interface BundleResult {
  /** 包名称 */
  name: string
  /** 是否成功 */
  success: boolean
  /** 构建耗时（毫秒） */
  duration: number
  /** 错误信息 */
  error?: Error
}

/**
 * 批次构建结果
 */
export interface BatchBuildResult {
  /** 批次索引 */
  batchIndex: number
  /** 批次耗时 */
  duration: number
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failedCount: number
  /** 各包结果 */
  results: BundleResult[]
}

/**
 * 整体构建摘要
 */
export interface BundleSummary {
  /** 总耗时 */
  totalDuration: number
  /** 总成功数量 */
  totalSuccess: number
  /** 总失败数量 */
  totalFailed: number
  /** 各批次结果 */
  batches: BatchBuildResult[]
}
