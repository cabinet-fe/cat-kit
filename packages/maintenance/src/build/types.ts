

/**
 * 包构建配置
 */
export interface BuildConfig {
  /** 包目录, 必须是个绝对路径 */
  dir: string
  /**
   * 入口文件路径
   *
   * 如果未指定:
   * - 先尝试 `join(dir, 'src/index.ts')`
   * - 如果不存在, 再尝试 `join(dir, 'index.ts')`
   */
  entry?: string
  /**
   * 是否生成 d.ts 文件
   * @default true
   */
  dts?: boolean
  /**
   * 指定外部依赖
   * @description 这些依赖不会被打包进产物，哪怕他们是 peerDependencies 或 devDependencies
   */
  external?: string[]
  /**
   * 构建平台
   * @default 'neutral'
   * @description 'neutral' 表示构建产物可以在浏览器和 Node.js 中使用。
   * @description 'node' 表示构建产物只能在 Node.js 中使用。
   * @description 'browser' 表示构建产物只能在浏览器中使用。
   */
  platform?: 'neutral' | 'node' | 'browser',
  /**
   * 输出配置
   */
  output?: {
    /**
     * 输出目录
     * @default 'dist'
     */
    dir?: string
    /**
     * 是否生成 source map
     * @default true
     */
    sourcemap?: boolean
  }
}


/**
 * 构建结果
 */
export interface BuildResult {
  /** 是否成功 */
  success: boolean
  /** 构建耗时（毫秒） */
  duration: number
  /** 错误信息（如果失败） */
  error?: Error
}

