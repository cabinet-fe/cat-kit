/**
 * Monorepo 配置接口
 */
export interface MonorepoConfig {
  /** 项目根目录（绝对路径） */
  rootDir: string
  /** 包目录模式（默认从 package.json 的 workspaces 字段读取） */
  workspaces?: string[]
}

/**
 * 包信息接口
 */
export interface PackageInfo {
  /** 包名称 */
  name: string
  /** 包版本 */
  version: string
  /** 包目录（绝对路径） */
  dir: string
  /** package.json 文件路径 */
  packageJsonPath: string
  /** package.json 内容 */
  packageJson: PackageJson
  /** 是否为私有包 */
  private: boolean
}

/**
 * package.json 类型定义
 */
export interface PackageJson {
  name: string
  version: string
  description?: string
  private?: boolean
  type?: 'module' | 'commonjs'
  exports?: Record<string, any>
  files?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
  workspaces?: string[]
  scripts?: Record<string, string>
  [key: string]: any
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否通过验证 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationError[]
  /** 警告列表 */
  warnings: ValidationWarning[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 相关文件路径 */
  file?: string
  /** 相关字段 */
  field?: string
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  /** 警告代码 */
  code: string
  /** 警告消息 */
  message: string
  /** 相关文件路径 */
  file?: string
  /** 相关字段 */
  field?: string
}
