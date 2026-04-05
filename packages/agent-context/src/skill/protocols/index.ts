import type { ToolTarget } from '../../types'
import { renderImplement } from './implement'
import { renderInit } from './init'
import { renderPatch } from './patch'
import { renderPlan } from './plan'
import { renderReplan } from './replan'
import { renderReview } from './review'
import { renderRush } from './rush'

export const PROTOCOL_NAMES = [
  'init',
  'plan',
  'replan',
  'implement',
  'patch',
  'rush',
  'review'
] as const
type ProtocolName = (typeof PROTOCOL_NAMES)[number]

export const PROTOCOL_RENDERERS: Record<ProtocolName, (target: ToolTarget) => string> = {
  init: renderInit,
  plan: renderPlan,
  replan: renderReplan,
  implement: renderImplement,
  patch: renderPatch,
  rush: renderRush,
  review: renderReview
}
