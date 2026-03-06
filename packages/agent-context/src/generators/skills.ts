import { resolve } from 'node:path'

import { renderSkillArtifacts } from '../domain/skills-content.js'
import type { FileMutation } from '../domain/types.js'

export function renderSkillMutations(cwd: string): FileMutation[] {
  const skillsDir = resolve(cwd, 'skills')

  return renderSkillArtifacts().flatMap((skill) => {
    const skillRoot = resolve(skillsDir, skill.directoryName)

    return [
      {
        path: resolve(skillRoot, 'SKILL.md'),
        body: skill.skillDocument
      },
      {
        path: resolve(skillRoot, 'scripts', 'README.md'),
        body: skill.scriptPlaceholder
      },
      {
        path: resolve(skillRoot, 'templates', 'README.md'),
        body: skill.templatePlaceholder
      },
      {
        path: resolve(skillRoot, 'references', 'README.md'),
        body: skill.referencePlaceholder
      }
    ]
  })
}
