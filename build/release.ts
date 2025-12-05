import { $ } from 'bun'
import { bumpVersion } from '@cat-kit/maintenance/src'
import type { PackageVersionConfig } from '@cat-kit/maintenance/src'
import path from 'path'
import { fileURLToPath } from 'url'

type ReleaseTarget = {
  name: string
  dir: string
  publish: boolean
}

const version = process.argv[2] ?? '1.0.0-alpha.1'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const targets: ReleaseTarget[] = [
  { name: 'root', dir: '.', publish: false },
  { name: '@cat-kit/tests', dir: 'packages/tests', publish: false },
  { name: '@cat-kit/docs', dir: 'docs', publish: false },
  { name: '@cat-kit/core', dir: 'packages/core', publish: true },
  { name: '@cat-kit/fe', dir: 'packages/fe', publish: true },
  { name: '@cat-kit/http', dir: 'packages/http', publish: true },
  { name: '@cat-kit/excel', dir: 'packages/excel', publish: true },
  { name: '@cat-kit/be', dir: 'packages/be', publish: true },
  { name: '@cat-kit/maintenance', dir: 'packages/maintenance', publish: true }
]

async function runStep(label: string, task: () => Promise<void>) {
  console.log(`\n› ${label}`)
  await task()
}

async function updateAllVersions() {
  // 收集所有包（包括不发布的）
  const allPackages: PackageVersionConfig[] = targets.map(t => ({
    dir: path.join(repoRoot, t.dir)
  }))

  // 使用 bumpVersion 统一更新版本
  const result = await bumpVersion(allPackages, {
    type: 'patch',
    version,
    syncPeer: true
  })

  console.log(`✅ 更新到版本: ${result.version}`)
  result.updated.forEach(pkg => {
    console.log(`   ${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`)
  })
}

async function main() {
  await runStep('运行测试', async () => {
    await $({
      cwd: path.join(repoRoot, 'packages/tests'),
      stdio: 'inherit'
    })`bun run test`
  })

  await runStep('构建产物', async () => {
    await $({
      cwd: path.join(repoRoot, 'build'),
      stdio: 'inherit'
    })`bun run build`
  })

  await runStep(`写入版本 ${version}`, async () => {
    await updateAllVersions()
  })

  await runStep('发布所有包', async () => {
    for (const target of targets) {
      if (!target.publish) continue
      await $({
        cwd: repoRoot,
        stdio: 'inherit'
      })`npm publish --workspace ${target.name} --access public`
    }
  })
}

main().catch(err => {
  console.error('release 失败:', err)
  process.exit(1)
})
