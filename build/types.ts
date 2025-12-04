// Re-export from @cat-kit/maintenance
export type {
  BundlePackageOption,
  BundlePackageConfig,
  BundleBuildConfig,
  BundleOutputConfig,
  BundleResult,
  BatchBuildResult,
  BuildSummary
} from '@cat-kit/maintenance/src'

// 为了向后兼容，保留原有类型别名
export type PackageOption = BundlePackageOption
export type PackageConfig = BundlePackageConfig
