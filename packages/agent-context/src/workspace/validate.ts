import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { PLAN_FILE_NAME } from '../constants'
import type { ContextSnapshot, ValidateResult } from '../types'

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
    const planMd = join(snapshot.currentPlan.dir, PLAN_FILE_NAME)
    if (!existsSync(planMd)) {
      errors.push(`当前计划 plan-${snapshot.currentPlan.number} 缺少 plan.md。`)
    }

    if (snapshot.currentPlan.status === '未知') {
      errors.push(
        `当前计划 plan-${snapshot.currentPlan.number} 的状态格式严重不符合要求，请严格按照 "> 状态: 已执行" 或 "> 状态: 未执行" 的格式书写，禁止添加 emoji 或其他额外字符。`
      )
    }
  }

  for (const p of snapshot.preparing) {
    if (p.status === '未知') {
      errors.push(
        `待执行计划 plan-${p.number} 的状态格式严重不符合要求，请严格按照 "> 状态: 已执行" 或 "> 状态: 未执行" 的格式书写。`
      )
    }
  }

  const allNumbers: number[] = []
  for (const d of snapshot.done) allNumbers.push(d.number)
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

  allNumbers.sort((a, b) => a - b)
  for (let i = 0; i < allNumbers.length; i++) {
    if (allNumbers[i] !== i + 1) {
      errors.push(
        `计划序列不连续或未从 1 开始。预期出现编号 ${i + 1}，实际遇到编号 ${allNumbers[i]} (要求必须是从 1 开始顺序查询)。`
      )
      break
    }
  }

  return { valid: errors.length === 0, errors, context: snapshot }
}
