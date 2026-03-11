import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { ContextSnapshot, ValidateResult } from '../types.js'

export function validate(
  snapshot: ContextSnapshot | null,
  currentPlanCount: number
): ValidateResult {
  if (snapshot === null) {
    return { valid: true, errors: [], context: null }
  }

  const errors: string[] = []

  if (currentPlanCount > 1) {
    errors.push(`存在 ${currentPlanCount} 个当前计划，应最多 1 个。`)
  }

  if (snapshot.currentPlan) {
    const planMd = join(snapshot.currentPlan.dir, 'plan.md')
    if (!existsSync(planMd)) {
      errors.push(`当前计划 plan-${snapshot.currentPlan.number} 缺少 plan.md。`)
    }
  }

  const allNumbers: number[] = []
  if (snapshot.currentPlan) allNumbers.push(snapshot.currentPlan.number)
  for (const p of snapshot.preparing) allNumbers.push(p.number)

  const seen = new Set<number>()
  const duplicates = new Set<number>()
  for (const n of allNumbers) {
    if (seen.has(n)) duplicates.add(n)
    seen.add(n)
  }

  if (duplicates.size > 0) {
    const nums = [...duplicates].sort((a, b) => a - b).join(', ')
    errors.push(`计划编号冲突: ${nums}。`)
  }

  return { valid: errors.length === 0, errors, context: snapshot }
}
