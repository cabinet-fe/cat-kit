import { readRawContext, validate } from '../context/index.js'

export async function statusCommand(): Promise<void> {
  const { snapshot, currentPlanCount } = await readRawContext(process.cwd())
  const result = validate(snapshot, currentPlanCount)

  if (!result.valid) {
    for (const error of result.errors) {
      console.log(`❌ ${error}`) // eslint-disable-line no-console
    }
    process.exitCode = 1
    return
  }

  if (result.context === null) {
    console.log('ℹ 无活跃上下文') // eslint-disable-line no-console
    return
  }

  const ctx = result.context
  const current = ctx.currentPlan
    ? `plan-${ctx.currentPlan.number} (${ctx.currentPlan.status})`
    : '无'
  const preparing =
    ctx.preparing.length > 0 ? ctx.preparing.map((p) => `plan-${p.number}`).join(', ') : '无'

  console.log('')
  console.log('Agent Context Status')
  console.log('────────────────────')
  console.log(`当前作用域: ${ctx.scope}`)
  console.log(`当前计划:  ${current}`)
  console.log(`待执行队列: ${preparing}`)
  console.log(`已归档:    ${ctx.done.length} 个`)
}
