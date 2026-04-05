import { relative } from 'node:path'

import { AC_ROOT_DIR } from '../constants'
import { readRawContext, validate, generateIndex } from '../workspace/index'

export async function indexCommand(): Promise<void> {
  const cwd = process.cwd()
  const { snapshot, currentPlanCount } = await readRawContext(cwd)
  const result = validate(snapshot, currentPlanCount)

  if (!result.valid) {
    for (const error of result.errors) {
      console.log(error) // eslint-disable-line no-console
    }
    process.exitCode = 1
    return
  }

  if (!snapshot) {
    console.log(`未找到 ${AC_ROOT_DIR} 目录。`) // eslint-disable-line no-console
    process.exitCode = 1
    return
  }

  const indexResult = await generateIndex(snapshot)
  console.log(`索引已生成：${relative(cwd, indexResult.path)}（${indexResult.entries} 个计划）`) // eslint-disable-line no-console
}
