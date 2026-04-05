import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 与当前包 `package.json` 的 `version` 一致（用于 SKILL frontmatter metadata） */
export function readAgentContextPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url))
  const pkgPath = resolve(here, '..', 'package.json')
  const raw = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: unknown }
  if (typeof raw.version !== 'string' || raw.version.length === 0) {
    throw new Error('@cat-kit/agent-context：package.json 缺少有效 version 字段')
  }
  return raw.version
}
