import { AC_ROOT_DIR } from '../constants'
import { readRawContext, validate } from '../workspace/index'

export async function validateCommand(): Promise<void> {
  const { snapshot, currentPlanCount } = await readRawContext(process.cwd())
  const result = validate(snapshot, currentPlanCount)

  if (result.context === null) {
    console.log(`未找到 ${AC_ROOT_DIR} 目录。`)
    return
  }

  if (result.valid) {
    console.log('校验通过。')
    const ctx = result.context
    console.log(`  当前作用域: ${ctx.scope}`)
    const current = ctx.currentPlan
      ? `plan-${ctx.currentPlan.number} (${ctx.currentPlan.status})`
      : '无'
    console.log(`  当前计划: ${current}`)
    console.log(`  待执行: ${ctx.preparing.length} 个`)
    console.log(`  已归档: ${ctx.done.length} 个`)
    return
  }

  for (const error of result.errors) {
    console.log(error)
  }
  process.exitCode = 1
}
