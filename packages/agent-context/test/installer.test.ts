import { existsSync } from 'node:fs'
import { lstat, mkdtemp, readlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

import { runInstall } from '../src/skill/installer'

async function createTempProject(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'agent-context-'))
}

async function removeTempProject(cwd: string): Promise<void> {
  await rm(cwd, { recursive: true, force: true })
}

describe('runInstall', () => {
  it('默认只安装 canonical source', async () => {
    const cwd = await createTempProject()

    try {
      await runInstall({ cwd })

      expect(existsSync(join(cwd, '.agents/skills/ac-workflow/SKILL.md'))).toBe(true)
      expect(existsSync(join(cwd, '.codex/skills/ac-workflow/SKILL.md'))).toBe(false)
      expect(existsSync(join(cwd, '.claude/skills/ac-workflow/SKILL.md'))).toBe(false)
    } finally {
      await removeTempProject(cwd)
    }
  })

  it('指定 tools 时创建指向 canonical source 的兼容入口', async () => {
    const cwd = await createTempProject()

    try {
      await runInstall({ cwd, tools: ['codex'] })

      const canonicalDir = resolve(cwd, '.agents/skills/ac-workflow')
      const compatDir = resolve(cwd, '.codex/skills/ac-workflow')
      const compatStat = await lstat(compatDir)

      expect(existsSync(join(canonicalDir, 'SKILL.md'))).toBe(true)
      expect(existsSync(join(compatDir, 'SKILL.md'))).toBe(true)

      if (compatStat.isSymbolicLink()) {
        const linkTarget = await readlink(compatDir)
        expect(resolve(dirname(compatDir), linkTarget)).toBe(canonicalDir)
      } else {
        expect(compatStat.isDirectory()).toBe(true)
      }
    } finally {
      await removeTempProject(cwd)
    }
  })
})
