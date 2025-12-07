import { $ } from 'bun'
import { MonoRepo } from '@cat-kit/maintenance/src'
import type { BundlePackageOption } from '@cat-kit/maintenance/src'
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

// 构建需要发布的包配置
const buildPackages: BundlePackageOption[] = targets
  .filter(t => t.publish)
  .map(t => ({
    dir: path.join(repoRoot, t.dir),
    build: {
      input: 'src/index.ts',
      platform: ['be', 'maintenance'].some(name => t.dir.includes(name))
        ? 'node' as const
        : t.dir.includes('excel')
          ? 'browser' as const
          : 'neutral' as const
    }
  }))

// 创建 MonoRepo 实例
const repo = new MonoRepo({
  rootDir: repoRoot,
  packages: buildPackages
})

async function runStep(label: string, task: () => Promise<void>) {
  console.log(`\n› ${label}`)
  await task()
}

async function main() {
  await runStep('运行测试', async () => {
    $.cwd(path.join(repoRoot, 'packages/tests'))
    await $`bun run test`
  })

  await runStep('构建产物', async () => {
    await repo.build()
  })

  await runStep(`写入版本 ${version}`, async () => {
    // 收集所有包（包括不发布的）
    const allPackages = targets.map(t => ({
      dir: path.join(repoRoot, t.dir)
    }))

    // 临时创建一个包含所有包的 MonoRepo 用于版本更新
    const allRepo = new MonoRepo({
      rootDir: repoRoot,
      packages: allPackages.map(p => ({ dir: p.dir, build: { input: 'src/index.ts' } }))
    })

    const result = await allRepo.bumpVersion({
      type: 'patch',
      version
    })

    // 同步 peerDependencies
    await allRepo.syncPeerDeps(result.version)

    console.log(`✅ 更新到版本: ${result.version}`)
    result.updated.forEach(pkg => {
      console.log(`   ${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`)
    })
  })

  await runStep('发布所有包', async () => {
    $.cwd(repoRoot)
    for (const target of targets) {
      if (!target.publish) continue
      await $`npm publish --workspace ${target.name} --access public`
    }
  })
}

main().catch(err => {
  console.error('release 失败:', err)
  process.exit(1)
})
