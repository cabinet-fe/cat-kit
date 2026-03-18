import { existsSync } from 'node:fs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

export async function resolveScope(acRoot: string): Promise<string> {
  const envPath = join(acRoot, '.env')

  if (existsSync(envPath)) {
    const content = await readFile(envPath, 'utf-8')
    const match = content.match(/^SCOPE=(.+)$/m)
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return initScope(acRoot)
}

export async function initScope(acRoot: string, manualScope?: string): Promise<string> {
  let scope: string

  if (manualScope) {
    scope = normalizeScope(manualScope)
  } else {
    let userName: string
    try {
      userName = execSync('git config user.name', { encoding: 'utf-8' }).trim()
    } catch {
      throw new Error('未找到 git user.name，请先运行 git config user.name <name>')
    }

    if (!userName) {
      throw new Error('未找到 git user.name，请先运行 git config user.name <name>')
    }

    scope = normalizeScope(userName)
  }

  const envPath = join(acRoot, '.env')
  await writeFile(envPath, `SCOPE=${scope}\n`, 'utf-8')

  await ensureGitignoreHasEnv(acRoot)

  const scopeDir = join(acRoot, scope)
  await mkdir(scopeDir, { recursive: true })

  return scope
}

export function normalizeScope(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

async function ensureGitignoreHasEnv(acRoot: string): Promise<void> {
  const gitignorePath = join(acRoot, '.gitignore')

  if (existsSync(gitignorePath)) {
    const content = await readFile(gitignorePath, 'utf-8')
    if (!content.split('\n').some((line) => line.trim() === '.env')) {
      await writeFile(gitignorePath, content.trimEnd() + '\n.env\n', 'utf-8')
    }
  } else {
    await writeFile(gitignorePath, '.env\n', 'utf-8')
  }
}
