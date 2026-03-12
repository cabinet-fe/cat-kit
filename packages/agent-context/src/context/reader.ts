import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { ContextSnapshot, PlanInfo, PlanStatus } from '../types.js'

const PLAN_DIR_RE = /^plan-(\d+)$/
const DONE_DIR_RE = /^plan-(\d+)(?:-\d{8})?$/
const EXACT_STATUS_RE = /^>\s*状态:\s*(未执行|已执行)$/m
const LOOSE_STATUS_RE = /^>?[ \t]*状态[：:].*$/m

// ── Public API ───────────────────────────────────────

export async function readContext(cwd: string): Promise<ContextSnapshot | null> {
  const { snapshot } = await readRawContext(cwd)
  return snapshot
}

export async function readRawContext(
  cwd: string
): Promise<{ snapshot: ContextSnapshot | null; currentPlanCount: number }> {
  const root = join(cwd, '.agent-context')

  if (!existsSync(root)) {
    return { snapshot: null, currentPlanCount: 0 }
  }

  const currentPlans = await readPlanDirs(root)
  const preparing = await readPlanDirs(join(root, 'preparing'))
  const done = await readDonePlans(join(root, 'done'))

  const snapshot: ContextSnapshot = {
    root,
    currentPlan: currentPlans[0] ?? null,
    preparing,
    done
  }

  return { snapshot, currentPlanCount: currentPlans.length }
}

export async function readPlanStatus(planDir: string): Promise<PlanStatus> {
  const planFile = join(planDir, 'plan.md')

  if (!existsSync(planFile)) {
    return '未执行'
  }

  const content = await readFile(planFile, 'utf-8')
  
  const exactMatch = content.match(EXACT_STATUS_RE)
  if (exactMatch) {
    return exactMatch[1] as PlanStatus
  }

  if (LOOSE_STATUS_RE.test(content)) {
    return '未知'
  }

  return '未执行'
}

// ── Helpers ──────────────────────────────────────────

async function readPlanDirs(parentDir: string): Promise<PlanInfo[]> {
  if (!existsSync(parentDir)) return []

  const entries = await readdir(parentDir, { withFileTypes: true })
  const plans: PlanInfo[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const match = entry.name.match(PLAN_DIR_RE)
    if (!match?.[1]) continue
    const number = parseInt(match[1], 10)
    const dir = join(parentDir, entry.name)
    const status = await readPlanStatus(dir)
    plans.push({ number, status, dir })
  }

  return plans.sort((a, b) => a.number - b.number)
}

async function readDonePlans(parentDir: string): Promise<Pick<PlanInfo, 'number' | 'dir'>[]> {
  if (!existsSync(parentDir)) return []
  const entries = await readdir(parentDir, { withFileTypes: true })
  const plans: Pick<PlanInfo, 'number' | 'dir'>[] = []
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const match = entry.name.match(DONE_DIR_RE)
    if (!match?.[1]) continue
    plans.push({
      number: parseInt(match[1], 10),
      dir: join(parentDir, entry.name)
    })
  }

  return plans.sort((a, b) => a.number - b.number)
}
