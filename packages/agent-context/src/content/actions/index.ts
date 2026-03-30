import type { ToolTarget } from '../../types.js'
import { renderImplement } from './implement.js'
import { renderInit } from './init.js'
import { renderPatch } from './patch.js'
import { renderPlan } from './plan.js'
import { renderReplan } from './replan.js'
import { renderReview } from './review.js'
import { renderRush } from './rush.js'

export const ACTION_NAMES = [
  'init',
  'plan',
  'replan',
  'implement',
  'patch',
  'rush',
  'review'
] as const
type ActionName = (typeof ACTION_NAMES)[number]

export const ACTION_RENDERERS: Record<ActionName, (target: ToolTarget) => string> = {
  init: renderInit,
  plan: renderPlan,
  replan: renderReplan,
  implement: renderImplement,
  patch: renderPatch,
  rush: renderRush,
  review: renderReview
}
