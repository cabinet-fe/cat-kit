import { readRawContext, validate } from '../context'

export async function validateCommand(): Promise<void> {
  const { snapshot, currentPlanCount } = await readRawContext(process.cwd())
  const result = validate(snapshot, currentPlanCount)

  if (result.context === null) {
    console.log('ℹ 无 .agent-context 目录') // eslint-disable-line no-console
    return
  }

  if (result.valid) {
    console.log('✅ 校验通过') // eslint-disable-line no-console
    const ctx = result.context
    const current = ctx.currentPlan
      ? `plan-${ctx.currentPlan.number} (${ctx.currentPlan.status})`
      : '无'
    console.log(`  当前计划: ${current}`) // eslint-disable-line no-console
    console.log(`  待执行: ${ctx.preparing.length} 个`) // eslint-disable-line no-console
    console.log(`  已归档: ${ctx.doneCount} 个`) // eslint-disable-line no-console
    return
  }

  for (const error of result.errors) {
    console.log(`❌ ${error}`) // eslint-disable-line no-console
  }
  process.exitCode = 1
}
