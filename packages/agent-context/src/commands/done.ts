import { basename } from 'node:path'

import { confirm } from '@inquirer/prompts'

import { archive, generateIndex, readContext, readRawContext, validate } from '../workspace/index'

export async function doneCommand(options: { yes?: boolean }): Promise<void> {
  const { snapshot, currentPlanCount } = await readRawContext(process.cwd())
  const result = validate(snapshot, currentPlanCount)

  if (!result.valid) {
    for (const error of result.errors) {
      console.log(error) // eslint-disable-line no-console
    }
    process.exitCode = 1
    return
  }

  if (!snapshot || !snapshot.currentPlan) {
    console.log('无当前计划。') // eslint-disable-line no-console
    process.exitCode = 1
    return
  }

  if (snapshot.currentPlan.status !== '已执行') {
    console.log(`当前计划 plan-${snapshot.currentPlan.number} 尚未执行，不能归档。`) // eslint-disable-line no-console
    process.exitCode = 1
    return
  }

  if (!options.yes) {
    const confirmed = await confirm({ message: `确认归档 plan-${snapshot.currentPlan.number}？` })
    if (!confirmed) {
      console.log('已取消。') // eslint-disable-line no-console
      return
    }
  }

  const archiveResult = await archive(snapshot)
  const archiveName = basename(archiveResult.archivedTo)

  console.log(`已归档 plan-${snapshot.currentPlan.number} -> done/${archiveName}`) // eslint-disable-line no-console

  if (archiveResult.promoted !== null) {
    console.log(`plan-${archiveResult.promoted} 已设为当前计划。`) // eslint-disable-line no-console
  }

  if (archiveResult.remainingPreparing > 0) {
    console.log(`待执行队列还剩 ${archiveResult.remainingPreparing} 个计划。`) // eslint-disable-line no-console
  } else if (archiveResult.promoted === null) {
    console.log('没有更多待执行计划。') // eslint-disable-line no-console
  }

  const freshSnapshot = await readContext(process.cwd())
  if (freshSnapshot) {
    await generateIndex(freshSnapshot)
    console.log('索引已更新。') // eslint-disable-line no-console
  }
}
