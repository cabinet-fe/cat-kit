import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import type { ContextSnapshot, PlanInfo } from '../types.js'

const H1_RE = /^#\s+(.+)$/m

export interface IndexResult {
  path: string
  entries: number
}

export async function generateIndex(context: ContextSnapshot): Promise<IndexResult> {
  const lines: string[] = []

  for (const plan of context.done) {
    const title = await extractTitle(plan.dir)
    const rel = `./${relative(context.root, plan.dir)}/plan.md`
    lines.push(`- [x] [${title}](${rel})`)
  }

  if (context.currentPlan) {
    const title = await extractTitle(context.currentPlan.dir)
    const rel = `./${relative(context.root, context.currentPlan.dir)}/plan.md`
    const check = context.currentPlan.status === '已执行' ? 'x' : ' '
    lines.push(`- [${check}] [${title}](${rel})`)
  }

  for (const plan of context.preparing) {
    const title = await extractTitle(plan.dir)
    const rel = `./${relative(context.root, plan.dir)}/plan.md`
    lines.push(`- [ ] [${title}](${rel})`)
  }

  const indexPath = join(context.root, 'index.md')
  await writeFile(indexPath, lines.join('\n') + '\n', 'utf-8')

  return { path: indexPath, entries: lines.length }
}

async function extractTitle(planDir: string): Promise<string> {
  const planFile = join(planDir, 'plan.md')

  if (!existsSync(planFile)) {
    return `plan-${planDir.split('/').pop() ?? 'unknown'}`
  }

  const content = await readFile(planFile, 'utf-8')
  const match = content.match(H1_RE)
  return match?.[1]?.trim() ?? `plan-${planDir.split('/').pop() ?? 'unknown'}`
}
