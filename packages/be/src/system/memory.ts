import { freemem, totalmem } from 'node:os'

export interface MemoryInfo {
  total: number
  free: number
  used: number
  usedPercent: number
}

/**
 * 获取系统内存使用情况
 * @returns 总量、空闲、已用及使用率
 */
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
