import { freemem, totalmem } from 'node:os'

/**
 * 内存信息
 */
export interface MemoryInfo {
  /** 总内存（字节） */
  total: number
  /** 空闲内存（字节） */
  free: number
  /** 已用内存（字节） */
  used: number
  /** 内存使用率（百分比） */
  usedPercent: number
}

/**
 * 获取系统内存使用情况
 *
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
