import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { renderSkillArtifacts } from '../../agent-context/src/content/index'
import { resolveSkillPaths, resolveToolTargets } from '../../agent-context/src/tools'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const targets = resolveToolTargets(['claude', 'cursor', 'antigravity'])

describe('agent-context skill content', () => {
  for (const target of targets) {
    it(`应与 ${target.name} 的仓库内 skill 文件保持同步`, () => {
      const artifacts = renderSkillArtifacts(target)
      const paths = resolveSkillPaths(target, repoRoot)

      for (const artifact of artifacts.files) {
        const artifactPath =
          artifact.relativePath === 'SKILL.md'
            ? paths.skillFile
            : path.resolve(paths.skillDir, artifact.relativePath)
        const expected = readFileSync(artifactPath, 'utf-8')
        const actual = artifact.body.endsWith('\n') ? artifact.body : `${artifact.body}\n`

        expect(actual).toBe(expected)
      }
    })
  }

  it('应为 Codex 生成 OpenAI metadata 文件', () => {
    const [target] = resolveToolTargets(['codex'])
    const artifacts = renderSkillArtifacts(target)
    const metadata = artifacts.files.find((file) => file.relativePath === 'agents/openai.yaml')

    expect(metadata?.body).toContain('display_name: "Agent Context Workflow"')
    expect(metadata?.body).toContain('allow_implicit_invocation: true')
  })
})
