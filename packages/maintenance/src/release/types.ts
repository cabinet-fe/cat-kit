/**
 * 创建 git tag 的选项
 */
export interface GitTagOptions {
  /** 仓库根目录（绝对路径） */
  cwd: string
  /** tag 名称 */
  tag: string
  /** 注释内容，未提供时使用 tag 文本 */
  message?: string
  /** 是否推送到远端 */
  push?: boolean
  /** 推送使用的远端名称，默认 origin */
  remote?: string
  /** 是否允许覆盖已有 tag */
  force?: boolean
}

/**
 * 提交并推送代码的选项
 */
export interface GitCommitAndPushOptions {
  /** 仓库根目录（绝对路径） */
  cwd: string
  /** 提交信息 */
  message: string
  /** 是否自动执行 git add -A，默认 true */
  addAll?: boolean
  /** 是否允许空提交 */
  allowEmpty?: boolean
  /** 推送远端名称，默认 origin */
  remote?: string
  /** 推送分支名称，默认当前分支 */
  branch?: string
  /** 是否同时推送所有 tag */
  pushTags?: boolean
}

/**
 * npm 发布选项
 */
export interface PublishOptions {
  /** 包所在目录（包含 package.json） */
  cwd: string
  /** 自定义 registry，默认使用 npm 官方源 */
  registry?: string
  /** 发布 dist-tag，默认 latest */
  tag?: string
  /** 2FA 动态验证码 */
  otp?: string
  /** 是否仅做 dry-run，不真正上传 */
  dryRun?: boolean
  /** 包访问级别 */
  access?: 'public' | 'restricted'
  /** 启用 provenance（npm 9+ 支持） */
  provenance?: boolean
}

/**
 * 提交结果
 */
export interface GitCommitResult {
  /** 完整提交哈希 */
  commitHash: string
  /** 推送的分支 */
  branch: string
}

/**
 * tag 结果
 */
export interface GitTagResult {
  /** 创建的 tag 名称 */
  tag: string
}

/**
 * 发布结果
 */
export interface PublishResult {
  /** 发布命令输出 */
  output: string
}
