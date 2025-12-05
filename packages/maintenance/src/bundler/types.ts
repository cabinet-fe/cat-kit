/**
 * 包构建选项
 */
export interface BundlePackageOption {
  /**
   * 包目录，必须是一个绝对路径
   */
  dir: string

  /**
   * 包的构建配置
   */
  build: BundleBuildConfig

  /**
   * 包的输出配置
   */
  output?: BundleOutputConfig
}

/**
 * 包构建配置
 */
export interface BundleBuildConfig {
  /** 入口文件路径，相对于 dir */
  input: string
  /** 是否生成 d.ts 文件，默认 true */
  dts?: boolean
  /** 外部依赖，不打包进产物，会与 peer+dev 自动 external 合并 */
  external?: string[]
  /**
   * 构建平台
   * @default 'neutral'
   * @description 'neutral' 表示构建产物可以在浏览器和 Node.js 中使用。
   * @description 'node' 表示构建产物只能在 Node.js 中使用。
   * @description 'browser' 表示构建产物只能在浏览器中使用。
   */
  platform?: 'neutral' | 'node' | 'browser'
}

/**
 * 包输出配置
 */
export interface BundleOutputConfig {
  /** 输出目录，默认 dist */
  dir?: string
  /** 是否生成 sourcemap，默认 true */
  sourcemap?: boolean
}

/**
 * 包构建配置（内部使用，包含从 package.json 读取的信息）
 */
export interface BundlePackageConfig {
  /** 包名称 */
  name: string

  /** 包目录 */
  dir: string
  /** 包依赖 */
  deps?: string[]
  /** 包构建配置 */
  build: BundleBuildConfig
  /** 包输出配置 */
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
  /** 错误信息（如果失败） */
  error?: Error
}

/**
 * 批次构建结果
 */
export interface BatchBuildResult {
  /** 批次索引 */
  batchIndex: number
  /** 批次耗时（毫秒） */
  duration: number
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failedCount: number
  /** 各包的构建结果 */
  results: BundleResult[]
}

/**
 * 整体构建结果
 */
export interface BuildSummary {
  /** 总耗时（毫秒） */
  totalDuration: number
  /** 总成功数量 */
  totalSuccess: number
  /** 总失败数量 */
  totalFailed: number
  /** 各批次的结果 */
  batches: BatchBuildResult[]
}
