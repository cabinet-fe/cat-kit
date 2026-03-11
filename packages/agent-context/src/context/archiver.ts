import { rename, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import type { ArchiveResult, ContextSnapshot } from '../types.js'

export async function archive(context: ContextSnapshot): Promise<ArchiveResult> {
  if (!context.currentPlan) {
    throw new Error('无当前计划')
  }

  if (context.currentPlan.status !== '已执行') {
    throw new Error('当前计划尚未执行')
  }

  const archiveName = `plan-${context.currentPlan.number}-${formatDate()}`
  const doneDir = join(context.root, 'done')
  const archivedTo = join(doneDir, archiveName)

  await mkdir(doneDir, { recursive: true })
  await rename(context.currentPlan.dir, archivedTo)

  let promoted: number | null = null
  const first = context.preparing[0]
  if (first) {
    const targetDir = join(context.root, `plan-${first.number}`)
    await rename(first.dir, targetDir)
    promoted = first.number
  }

  return {
    archivedTo,
    promoted,
    remainingPreparing: context.preparing.length - (promoted !== null ? 1 : 0)
  }
}

// ── Helpers ──────────────────────────────────────────

function formatDate(): string {
  const d = new Date()
  const y = String(d.getFullYear())
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}
