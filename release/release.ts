import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { writeFileSync, readFileSync } from 'node:fs'
import { main, maintenance, tsconfig, repo } from './repo'
import { $ } from 'execa'
import { select, confirm } from '@inquirer/prompts'
import chalk from 'chalk'
import {
  incrementVersion,
  commitAndPush,
  type BumpType,
  type RollbackContext
} from '@cat-kit/maintenance/src'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 运行测试
 */
async function runTests(): Promise<void> {
  console.log(chalk.bold('\n🧪 运行测试...'))
  await $({
    cwd: path.resolve(__dirname, '../packages/tests'),
  })`bun run test`
  console.log(chalk.green('✓ 测试通过'))
}

/**
 * 验证 monorepo
 */
function validate(): void {
  console.log(chalk.bold('\n🔍 验证 monorepo...'))
  const { valid, hasCircular, inconsistentDeps } = repo.validate()
  if (valid) {
    console.log(chalk.green('✓ 验证通过'))
    return
  }
  if (hasCircular) {
    throw new Error('存在循环依赖')
  }
  if (inconsistentDeps.length) {
    throw new Error('存在不一致的依赖: ' + inconsistentDeps.map(d => d.name).join(', '))
  }
}

/**
 * 选择发布组
 */
async function chooseGroup(): Promise<'main' | 'maintenance' | 'tsconfig'> {
  const value = await select({
    message: '选择要发布的组',
    choices: [
      { value: 'main' as const, name: 'main', description: '@cat-kit/core, @cat-kit/fe, @cat-kit/be, @cat-kit/http, @cat-kit/excel' },
      { value: 'maintenance' as const, name: 'maintenance', description: '@cat-kit/maintenance' },
      { value: 'tsconfig' as const, name: 'tsconfig', description: '@cat-kit/tsconfig' },
    ],
  })

  return value
}

// ============================================================================
// 版本选择
// ============================================================================

const BUMP_TYPES: BumpType[] = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
]

/**
 * 交互式选择版本类型
 */
async function chooseVersion(currentVersion: string): Promise<BumpType> {
  console.log(chalk.bold(`\n📦 当前版本: ${chalk.cyan(currentVersion)}`))

  const choices = BUMP_TYPES.map(type => {
    const nextVersion = incrementVersion(currentVersion, type)
    return {
      value: type,
      name: `${type.padEnd(12)} → ${nextVersion}`,
    }
  })

  const bumpType = await select({
    message: '选择版本类型',
    choices,
  })

  return bumpType
}

// ============================================================================
// 回滚功能
// ============================================================================

/**
 * 创建回滚上下文
 */
function createRollbackContext(
  workspaces: { dir: string }[],
  originalVersion: string
): RollbackContext {
  return {
    originalVersion,
    packageDirs: workspaces.map(ws => ws.dir),
  }
}

/**
 * 回滚版本号
 */
function rollbackVersion(context: RollbackContext): void {
  console.log(chalk.yellow('\n⏪ 正在回滚版本...'))

  for (const dir of context.packageDirs) {
    const pkgPath = path.join(dir, 'package.json')
    try {
      const content = readFileSync(pkgPath, 'utf-8')
      const pkg = JSON.parse(content)
      pkg.version = context.originalVersion
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    } catch (err) {
      console.error(chalk.red(`  回滚失败: ${pkgPath}`))
    }
  }

  console.log(chalk.green(`✓ 版本已回滚到 ${context.originalVersion}`))
}

/**
 * 重置 Git 提交
 */
async function gitReset(commitHash: string): Promise<void> {
  console.log(chalk.yellow('⏪ 正在重置 Git 提交...'))
  await $({ cwd: repo.root.dir })`git reset --hard ${commitHash}^`
  console.log(chalk.green('✓ Git 已重置'))
}

interface FailedPackage {
  name: string
  error?: Error
}

/**
 * 提示用户是否回滚
 */
async function promptRollback(
  context: RollbackContext,
  failedPackages: FailedPackage[]
): Promise<void> {
  console.log(chalk.red(`\n⚠ 发布失败: ${failedPackages.length} 个包发布失败`))

  // 显示每个失败包的详细错误信息
  for (const pkg of failedPackages) {
    console.log(chalk.red(`  ✗ ${pkg.name}`))
    if (pkg.error) {
      // 尝试获取更详细的错误信息
      const err = pkg.error as any
      // PublishError 有 originalError 属性包含实际错误
      const detailMessage = err.originalError?.message || err.message
      console.log(chalk.dim(`    原因: ${detailMessage}`))
    }
  }

  const shouldRollback = await confirm({
    message: '是否回滚版本变更？',
    default: true,
  })

  if (shouldRollback) {
    rollbackVersion(context)

    if (context.commitHash) {
      const shouldResetGit = await confirm({
        message: '是否重置 Git 提交？',
        default: true,
      })

      if (shouldResetGit) {
        await gitReset(context.commitHash)
      }
    }
  } else {
    console.log(chalk.dim('保留当前状态，请稍后手动处理'))
  }
}

// ============================================================================
// 发布流程
// ============================================================================

type WorkspaceGroup = typeof main | typeof maintenance | typeof tsconfig

interface GroupConfig {
  group: WorkspaceGroup
  buildConfigs?: Parameters<typeof main.build>[0]
}

const GROUP_CONFIGS: Record<'main' | 'maintenance' | 'tsconfig', GroupConfig> = {
  main: {
    group: main,
    buildConfigs: {
      '@cat-kit/be': { platform: 'node' },
      '@cat-kit/excel': { platform: 'browser' },
    },
  },
  maintenance: {
    group: maintenance,
  },
  tsconfig: {
    group: tsconfig,
  },
}

/**
 * 发布指定组
 */
async function releaseGroup(groupName: 'main' | 'maintenance' | 'tsconfig'): Promise<void> {
  const config = GROUP_CONFIGS[groupName]
  const group = config.group

  // 1. 构建
  console.log(chalk.bold('\n🔨 开始构建...'))
  await group.build(config.buildConfigs as any)

  // 2. 获取当前版本
  const currentVersion = group.workspaces[0]?.pkg.version || '0.0.0'

  // 3. 选择版本
  const bumpType = await chooseVersion(currentVersion)

  // 4. 创建回滚上下文
  const rollbackCtx = createRollbackContext(group.workspaces, currentVersion)

  // 5. 更新版本
  console.log(chalk.bold('\n📝 更新版本...'))
  const { version: newVersion } = await group.bumpVersion({ type: bumpType })

  // 6. Git 提交
  console.log(chalk.bold('\n📤 提交变更...'))
  try {
    const commitResult = await commitAndPush({
      cwd: repo.root.dir,
      message: `chore(release): v${newVersion}`,
    })
    rollbackCtx.commitHash = commitResult.commitHash
    console.log(chalk.green(`✓ 已提交: chore(release): v${newVersion}`))
  } catch (err) {
    console.error(chalk.red('Git 提交失败'))
    rollbackVersion(rollbackCtx)
    throw err
  }

  // 7. 发布
  console.log(chalk.bold('\n🚀 发布中...'))
  const publishResult = await group.publish()

  if (publishResult.hasFailure) {
    const failedPackages = publishResult.results
      .filter(r => !r.success)
      .map(r => ({ name: r.name, error: r.error }))

    await promptRollback(rollbackCtx, failedPackages)
    return
  }

  // 8. 完成
  console.log(chalk.bold(chalk.green(`\n✨ 发布完成！版本 ${newVersion}`)))
}

/**
 * 主入口
 */
async function release(): Promise<void> {
  console.log(chalk.bold(chalk.cyan('\n🐱 Cat-Kit 发布工具\n')))

  // 1. 验证
  validate()

  // 2. 测试
  await runTests()

  // 3. 选择组
  const targetGroup = await chooseGroup()

  // 4. 执行发布
  await releaseGroup(targetGroup)
}

// 执行
release().catch(err => {
  console.error(chalk.red('\n❌ 发布失败:'), err.message)
  process.exit(1)
})