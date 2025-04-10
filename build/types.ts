import type {
  BuildOptions,
  InputOption,
  InputOptions,
  OutputOptions
} from 'rolldown'

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
    input: InputOption
    dts?: boolean
    resolve?: {
      /**
       * 指定tsconfig文件，如果未指定，则默认使用 `dir` 目录下的 `tsconfig.json` 文件。
       */
      tsconfigFilename?: string
    } & Omit<BuildOptions['resolve'], 'tsconfigFilename'>
  } & Omit<InputOptions, 'input' | 'resolve'>

  /**
   * 包的输出配置
   */
  output?: OutputOptions & {
    /**
     * 是否生成d.ts文件
     */
    dts?: boolean
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
  build: InputOptions & { dts?: boolean }
  /** 包输出配置 */
  output: OutputOptions
}

export interface MonoRepoLibOptions {
  /** 需要构建的包 */
  packages: PackageOption[]
}
