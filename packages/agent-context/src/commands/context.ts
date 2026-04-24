import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { AC_ROOT_DIR, PLAN_FILE_NAME } from '../constants'
import { readRawContext, validate } from '../workspace/index'

const PATCH_FILE_RE = /^patch-([1-9]\d*)\.md$/
const PLAN_DIR_RE = /^plan-(\d+)$/
const DONE_DIR_RE = /^plan-(\d+)(?:-\d{8})?$/

export async function contextCommand(): Promise<void> {
  const cwd = process.cwd()

  const { snapshot, currentPlanCount } = await readRawContext(cwd)
  const validation = validate(snapshot, currentPlanCount)

  if (!validation.valid) {
    process.stderr.write('校验未通过，先修复再继续：\n')
    for (const error of validation.errors) {
      process.stderr.write('- ' + error + '\n')
    }
    process.exitCode = 1
    return
  }

  if (!snapshot) {
    process.stdout.write(
      JSON.stringify({ cwd, acRoot: join(cwd, AC_ROOT_DIR), initialized: false }, null, 2) + '\n'
    )
    return
  }

  const scopeDir = snapshot.root
  const currentPlan = snapshot.currentPlan
  const nextPatchNumber = currentPlan ? resolveNextPatchNumber(currentPlan.dir) : null

  const context = {
    cwd,
    acRoot: join(cwd, AC_ROOT_DIR),
    scope: snapshot.scope,
    scopeDir,
    preparingDir: join(scopeDir, 'preparing'),
    doneDir: join(scopeDir, 'done'),
    currentPlan,
    currentPlanNumber: currentPlan?.number ?? null,
    currentPlanStatus: currentPlan?.status ?? null,
    currentPlanDir: currentPlan?.dir ?? null,
    currentPlanFile: currentPlan ? join(currentPlan.dir, PLAN_FILE_NAME) : null,
    nextPlanNumber: resolveNextPlanNumber(scopeDir),
    nextPatchNumber
  }

  process.stdout.write(JSON.stringify(context, null, 2) + '\n')
}

function resolveNextPlanNumber(scopeDir: string): number {
  const numbers = [
    ...readPlanNumbers(scopeDir, PLAN_DIR_RE),
    ...readPlanNumbers(join(scopeDir, 'preparing'), PLAN_DIR_RE),
    ...readPlanNumbers(join(scopeDir, 'done'), DONE_DIR_RE)
  ]

  if (numbers.length === 0) return 1
  return Math.max(...numbers) + 1
}

function resolveNextPatchNumber(planDir: string): number | null {
  if (!existsSync(planDir)) return null

  const entries = readdirSync(planDir, { withFileTypes: true })
  let max = 0

  for (const entry of entries) {
    if (!entry.isFile()) continue
    const match = entry.name.match(PATCH_FILE_RE)
    if (!match?.[1]) continue
    const number = Number.parseInt(match[1], 10)
    if (number > max) max = number
  }

  return max + 1
}

function readPlanNumbers(parentDir: string, pattern: RegExp): number[] {
  if (!existsSync(parentDir)) return []

  return readdirSync(parentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name.match(pattern)?.[1])
    .filter((value): value is string => value !== undefined)
    .map((value) => Number.parseInt(value, 10))
    .sort((a, b) => a - b)
}
