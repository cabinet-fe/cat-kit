import path from 'node:path'

import { str } from '@cat-kit/core'
import type { Plugin } from 'vitepress'

export interface ImportExamplesOptions {
  /** examples 目录的绝对路径 */
  examplesDir: string
}

export function importExamples(options: ImportExamplesOptions): Plugin {
  const { examplesDir } = options

  return {
    name: 'md-transform',
    enforce: 'pre',
    async transform(code, id) {
      // id是文件路径标识
      if (!id.endsWith('.md')) return
      const demos = [...code.matchAll(/^:::\s+demo\s*(.*)$/gm)]

      const demoPaths = demos.map((demo) => demo[1]!)

      if (demoPaths.length) {
        const importExpressions = demoPaths.map((demoPath) => {
          const ComponentName = str(path.basename(demoPath, '.vue')).camelCase('upper')

          const relativePath = path
            .relative(path.dirname(id), path.join(examplesDir, demoPath))
            .replaceAll(path.sep, '/')
          return `import ${ComponentName} from '${relativePath}'`
        })

        const script = `<script setup>
            ${importExpressions.join('\n')}
            </script>`

        code = insertScriptAfterFrontmatter(code, script)
      }
      return code
    }
  }
}

function insertScriptAfterFrontmatter(code: string, script: string) {
  const frontmatterMatch = code.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)

  if (!frontmatterMatch) {
    return `${script}\n${code}`
  }

  const frontmatter = frontmatterMatch[0]
  const rest = code.slice(frontmatter.length)
  return `${frontmatter}${script}\n${rest}`
}
