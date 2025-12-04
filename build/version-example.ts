/**
 * 版本管理示例
 *
 * 展示如何使用 @cat-kit/maintenance 的版本管理功能
 */
import { bumpVersion, syncPeerDependencies } from '@cat-kit/maintenance/src'
import type { PackageVersionConfig } from '@cat-kit/maintenance/src'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

// 定义要管理的包
const packages: PackageVersionConfig[] = [
  { dir: path.join(repoRoot, 'packages/core') },
  { dir: path.join(repoRoot, 'packages/fe') },
  { dir: path.join(repoRoot, 'packages/http') },
  { dir: path.join(repoRoot, 'packages/be') },
  { dir: path.join(repoRoot, 'packages/excel') },
  { dir: path.join(repoRoot, 'packages/maintenance') }
]

async function main() {
  // 示例 1: 递增 minor 版本
  console.log('\n📦 递增 minor 版本号...')
  const result = await bumpVersion(packages, {
    type: 'minor',
    syncPeer: true
  })

  console.log(`✅ 更新到版本: ${result.version}`)
  result.updated.forEach(pkg => {
    console.log(`   ${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`)
  })

  // 示例 2: 设置特定版本
  // const result = await bumpVersion(packages, {
  //   type: 'patch',
  //   version: '1.0.0-alpha.2'
  // })

  // 示例 3: 创建预发布版本
  // const result = await bumpVersion(packages, {
  //   type: 'prerelease',
  //   preid: 'beta'
  // })

  // 示例 4: 单独同步 peerDependencies
  // await syncPeerDependencies(packages, '1.0.0')
}

main().catch(err => {
  console.error('❌ 版本更新失败:', err)
  process.exit(1)
})
