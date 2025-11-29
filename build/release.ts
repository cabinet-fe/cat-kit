import { $ } from 'bun'
import { readFile, writeFile } from 'fs/promises'
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
const catKitPkgs = [
  '@cat-kit/core',
  '@cat-kit/fe',
  '@cat-kit/http',
  '@cat-kit/excel',
  '@cat-kit/be'
]

const targets: ReleaseTarget[] = [
  { name: 'root', dir: '.', publish: false },
  { name: '@cat-kit/tests', dir: 'packages/tests', publish: false },
  { name: '@cat-kit/docs', dir: 'docs', publish: false },
  { name: '@cat-kit/core', dir: 'packages/core', publish: true },
  { name: '@cat-kit/fe', dir: 'packages/fe', publish: true },
  { name: '@cat-kit/http', dir: 'packages/http', publish: true },
  { name: '@cat-kit/excel', dir: 'packages/excel', publish: true },
  { name: '@cat-kit/be', dir: 'packages/be', publish: true }
]

async function runStep(label: string, task: () => Promise<void>) {
  console.log(`\n› ${label}`)
  await task()
}

function resolvePkgJson(dir: string) {
  return path.join(repoRoot, dir, 'package.json')
}

async function updateVersion(target: ReleaseTarget) {
  const pkgPath = resolvePkgJson(target.dir)
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
  pkg.version = version

  if (pkg.peerDependencies) {
    Object.keys(pkg.peerDependencies).forEach(dep => {
      if (catKitPkgs.includes(dep)) {
        pkg.peerDependencies[dep] = `>=${version}`
      }
    })
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

async function main() {
  await runStep('运行测试', async () => {
    await $({ cwd: path.join(repoRoot, 'packages/tests'), stdio: 'inherit' })`bun run test`
  })

  await runStep('构建产物', async () => {
    await $({ cwd: path.join(repoRoot, 'build'), stdio: 'inherit' })`bun run build`
  })

  await runStep(`写入版本 ${version}`, async () => {
    for (const target of targets) {
      await updateVersion(target)
    }
  })

  await runStep('发布所有包', async () => {
    for (const target of targets) {
      if (!target.publish) continue
      await $({ cwd: repoRoot, stdio: 'inherit' })`npm publish --workspace ${target.name} --access public`
    }
  })
}

main().catch(err => {
  console.error('release 失败:', err)
  process.exit(1)
})
