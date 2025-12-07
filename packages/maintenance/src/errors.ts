/**
 * 基础维护错误类
 */
export class MaintenanceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'MaintenanceError'
  }
}

/**
 * 配置错误
 */
export class ConfigError extends MaintenanceError {
  constructor(
    message: string,
    public readonly configPath?: string,
    originalError?: unknown
  ) {
    super(message, 'CONFIG_ERROR', originalError)
    this.name = 'ConfigError'
  }
}

/**
 * 版本错误
 */
export class SemverError extends MaintenanceError {
  constructor(
    message: string,
    public readonly version?: string,
    originalError?: unknown
  ) {
    super(message, 'SEMVER_ERROR', originalError)
    this.name = 'SemverError'
  }
}

/**
 * 验证错误
 */
export class ValidationError extends MaintenanceError {
  constructor(
    message: string,
    public readonly filePath?: string,
    public readonly field?: string,
    originalError?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', originalError)
    this.name = 'ValidationError'
  }
}

/**
 * Git 操作错误
 */
export class GitError extends MaintenanceError {
  constructor(
    message: string,
    public readonly command?: string,
    originalError?: unknown
  ) {
    super(message, 'GIT_ERROR', originalError)
    this.name = 'GitError'
  }
}

/**
 * 发布错误
 */
export class PublishError extends MaintenanceError {
  constructor(
    message: string,
    public readonly command?: string,
    originalError?: unknown
  ) {
    super(message, 'PUBLISH_ERROR', originalError)
    this.name = 'PublishError'
  }
}
