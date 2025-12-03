import { freemem, totalmem } from 'node:os'

export interface MemoryInfo {
  total: number
  free: number
  used: number
  usedPercent: number
}

export function getMemoryInfo(): MemoryInfo {
  const total = totalmem()
  const free = freemem()
  const used = total - free
  const usedPercent = total === 0 ? 0 : (used / total) * 100

  return {
    total,
    free,
    used,
    usedPercent
  }
}

