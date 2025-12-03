import { cpus, loadavg } from 'node:os'

/**
 * CPU 基本信息
 */
export interface CpuInfo {
  /** CPU 型号 */
  model: string
  /** CPU 核心数 */
  cores: number
  /** CPU 主频（MHz） */
  speed: number
  /** 系统平均负载（1分钟、5分钟、15分钟） */
  loadAverage: [number, number, number]
}

/**
 * CPU 使用情况
 */
export interface CpuUsage {
  /** 用户态时间（毫秒） */
  user: number
  /** 系统态时间（毫秒） */
  system: number
  /** 空闲时间（毫秒） */
  idle: number
  /** 总时间（毫秒） */
  total: number
  /** CPU 使用率（百分比） */
  percent: number
}

/**
 * 获取 CPU 基本信息
 *
 * @returns CPU 型号、核心数、主频与平均负载
 */
export function getCpuInfo(): CpuInfo {
  const cpuList = cpus()
  const primary = cpuList?.[0]

  return {
    model: primary?.model ?? 'unknown',
    cores: cpuList.length,
    speed: primary?.speed ?? 0,
    loadAverage: loadavg() as [number, number, number]
  }
}

function aggregateCpuTimes(): CpuUsage {
  const cpuList = cpus()
  let user = 0
  let system = 0
  let idle = 0

  cpuList.forEach(cpu => {
    user += cpu.times.user
    system += cpu.times.sys
    idle += cpu.times.idle
  })

  const total = user + system + idle

  return {
    user,
    system,
    idle,
    total,
    percent: total === 0 ? 0 : ((total - idle) / total) * 100
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * 采样 CPU 使用情况
 *
 * 通过采样一段时间内的 CPU 时间来计算使用率。
 *
 * @param interval - 采样间隔（毫秒），默认 500ms
 * @returns 采样区间内的 CPU 使用统计
 */
export async function getCpuUsage(interval = 500): Promise<CpuUsage> {
  const start = aggregateCpuTimes()
  await sleep(interval)
  const end = aggregateCpuTimes()

  const user = end.user - start.user
  const system = end.system - start.system
  const idle = end.idle - start.idle
  const total = user + system + idle

  return {
    user,
    system,
    idle,
    total,
    percent: total === 0 ? 0 : ((total - idle) / total) * 100
  }
}
