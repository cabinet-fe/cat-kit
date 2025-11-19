export type PackageOption = {
  /**
   * 包目录，必须是一个绝对路径
   */
  dir: string
  /**
   * 包的构建依赖，在构建时会优先先构建这些依赖
   */
  deps?: string[]

  /**
   * 包的构建配置
   */
  build: {
    /** 入口文件路径，相对于 dir */
    input: string
    /** 是否生成 d.ts 文件，默认 true */
    dts?: boolean
    /** 外部依赖，不打包进产物 */
    external?: string[]
  }

  /**
   * 包的输出配置
   */
  output?: {
    /** 输出目录，默认 dist */
    dir?: string
    /** 是否生成 sourcemap，默认 true */
    sourcemap?: boolean
  }
}

export interface PackageConfig {
  /** 包名称 */
  name: string
  /** 包目录 */
  dir: string
  /** 包依赖 */
  deps?: string[]
  /** 包构建配置 */
  build: {
    input: string
    dts?: boolean
    external?: string[]
  }
  /** 包输出配置 */
  output?: {
    dir?: string
    sourcemap?: boolean
  }
}
