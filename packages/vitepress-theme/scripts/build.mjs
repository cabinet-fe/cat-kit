import { cp, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(SCRIPT_DIR, '..')

async function run(cmd) {
  const proc = spawnSync(cmd[0], cmd.slice(1), {
    cwd: PKG_ROOT,
    stdio: 'inherit'
  })

  if (proc.status !== 0) {
    throw new Error(`${cmd.join(' ')} failed with exit ${proc.status}`)
  }
}

await rm(join(PKG_ROOT, 'dist'), { recursive: true, force: true })
await run(['bunx', 'tsc', '-p', 'tsconfig.build.json'])
await run(['bunx', 'vue-tsc', '-p', 'tsconfig.json', '--declaration', '--emitDeclarationOnly', '--outDir', 'dist'])
await cp(join(PKG_ROOT, 'src/components'), join(PKG_ROOT, 'dist/components'), { recursive: true })
await cp(join(PKG_ROOT, 'src/styles'), join(PKG_ROOT, 'dist/styles'), { recursive: true })
