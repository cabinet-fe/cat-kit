import { readRawContext, validate } from '../context/index.js'

export async function validateCommand(): Promise<void> {
  const { snapshot, currentPlanCount } = await readRawContext(process.cwd())
  const result = validate(snapshot, currentPlanCount)

  if (result.context === null) {
    console.log('⚠️ 无 .agent-context 目录')
    return
  }

  if (result.valid) {
    console.log('✅ 校验通过')
    const ctx = result.context
    const current = ctx.currentPlan
      ? `plan-${ctx.currentPlan.number} (${ctx.currentPlan.status})`
      : '无'
    console.log(`  当前计划: ${current}`)
    console.log(`  待执行: ${ctx.preparing.length} 个`)
    console.log(`  已归档: ${ctx.done.length} 个`)
    return
  }

  for (const error of result.errors) {
    console.log(`❌ ${error}`)
  }
  process.exitCode = 1
}
