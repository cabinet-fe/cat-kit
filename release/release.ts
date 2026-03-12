import { writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  incrementVersion,
  commitAndPush,
  type BumpType,
  type RollbackContext
} from '@cat-kit/maintenance/src'
import { select } from '@inquirer/prompts'
import chalk from 'chalk'
import { $ } from 'execa'

import { main, maintenance, tsconfig, agentContext, repo } from './groups'

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
  await $({ cwd: path.resolve(__dirname, '../packages/tests') })`bun run test`
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
    throw new Error('存在不一致的依赖: ' + inconsistentDeps.map((d) => d.name).join(', '))
  }
}

/**
 * 选择发布组
 */
async function chooseGroup() {
  const value = await select({
    message: '选择要发布的组',
    choices: [
      {
        value: 'main' as const,
        name: 'main',
        description: '@cat-kit/core, @cat-kit/fe, @cat-kit/be, @cat-kit/http, @cat-kit/excel'
      },
      { value: 'maintenance' as const, name: 'maintenance', description: '@cat-kit/maintenance' },
      { value: 'tsconfig' as const, name: 'tsconfig', description: '@cat-kit/tsconfig' },
      {
        value: 'agentContext' as const,
        name: 'agent-context',
        description: '@cat-kit/agent-context'
      }
    ]
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
  'prerelease'
]

/**
 * 交互式选择版本类型
 */
async function chooseVersion(currentVersion: string): Promise<BumpType | 'current'> {
  console.log(chalk.bold(`\n📦 当前版本: ${chalk.cyan(currentVersion)}`))

  const choices = BUMP_TYPES.map((type) => {
    const nextVersion = incrementVersion(currentVersion, type)
    return { value: type, name: `${type.padEnd(12)} → ${nextVersion}` }
  })

  const bumpType = await select({
    message: '选择版本类型',
    choices: [
      ...choices,
      { value: 'current' as const, name: `${'current'.padEnd(12)} → ${currentVersion}` }
    ]
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
  return { originalVersion, packageDirs: workspaces.map((ws) => ws.dir) }
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
 * 重置 Git 提交（使用 soft 重置，保留工作区更改）
 */
async function gitReset(commitHash: string): Promise<void> {
  console.log(chalk.yellow('⏪ 正在重置 Git 提交（soft）...'))
  await $({ cwd: repo.root.dir })`git reset --soft ${commitHash}^`
  console.log(chalk.green('✓ Git 已重置（保留工作区更改）'))
}

// ============================================================================
// 发布流程
// ============================================================================

const GROUP_MAP = { main, maintenance, tsconfig, agentContext }

/**
 * 发布指定组
 */
async function releaseGroup(
  groupName: 'main' | 'maintenance' | 'tsconfig' | 'agentContext'
): Promise<void> {
  const builder = GROUPS_BUILD[groupName]

  // 1. 构建
  if (builder) {
    console.log(chalk.bold('\n🔨 开始构建...'))
    await builder()
  }

  // 2. 获取当前版本
  const group = GROUP_MAP[groupName]
  const currentVersion: string = group.workspaces[0]?.pkg.version || '0.0.0'

  // 3. 选择版本
  const bumpType = await chooseVersion(currentVersion)

  // 4. 创建回滚上下文
  const rollbackCtx = createRollbackContext(group.workspaces, currentVersion)

  // 5. 更新版本
  let nextVersion: string | undefined
  if (bumpType === 'current') {
    nextVersion = currentVersion
  } else {
    console.log(chalk.bold('\n📝 更新版本...'))
    const { version } = await group.bumpVersion({ type: bumpType })
    nextVersion = version
  }

  // 6. Dry-run 验证发布
  console.log(chalk.bold('\n🔍 验证发布（dry-run）...'))
  try {
    await group.publish({ dryRun: true })
    console.log(chalk.green('✓ 发布验证通过'))
  } catch (err) {
    console.log(chalk.red('\n❌ 发布验证失败'))
    if (err instanceof Error) {
      console.log(chalk.dim(`  原因: ${err.message}`))
    }

    // 自动回滚版本
    console.log(chalk.yellow('\n⏪ 自动回滚版本...'))
    rollbackVersion(rollbackCtx)
    return
  }

  // 7. Git 提交
  console.log(chalk.bold('\n📤 提交变更...'))
  try {
    const commitResult = await commitAndPush({
      cwd: repo.root.dir,
      message: `chore(release): v${nextVersion}`
    })
    rollbackCtx.commitHash = commitResult.commitHash
    console.log(chalk.green(`✓ 已提交: chore(release): v${nextVersion}`))
  } catch (err) {
    console.error(chalk.red('Git 提交失败'))
    rollbackVersion(rollbackCtx)
    throw err
  }

  // 8. 真正发布
  console.log(chalk.bold('\n🚀 正式发布中...'))
  try {
    await group.publish({ access: 'public' })
  } catch (err) {
    console.log(chalk.red('\n⚠ 发布失败'))
    if (err instanceof Error) {
      console.log(chalk.dim(`  原因: ${err.message}`))
    }

    // 自动回滚
    console.log(chalk.yellow('\n⏪ 自动回滚...'))
    rollbackVersion(rollbackCtx)

    if (rollbackCtx.commitHash) {
      await gitReset(rollbackCtx.commitHash)
    }

    return
  }

  // 9. 完成
  console.log(chalk.bold(chalk.green(`\n✨ 发布完成！版本 ${nextVersion}`)))
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
release().catch((err) => {
  console.error(chalk.red('\n❌ 发布失败:'), err.message)
  process.exit(1)
})
