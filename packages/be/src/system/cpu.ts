import { cpus, loadavg } from 'node:os'

export interface CpuInfo {
  model: string
  cores: number
  speed: number
  loadAverage: [number, number, number]
}

export interface CpuUsage {
  user: number
  system: number
  idle: number
  total: number
  percent: number
}

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

