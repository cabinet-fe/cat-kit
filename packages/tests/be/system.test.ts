import {
  getCpuInfo,
  getCpuUsage,
  getDiskInfo,
  getMemoryInfo,
  getNetworkInterfaces
} from '@cat-kit/be/src/system'

describe('@cat-kit/be system utilities', () => {
  it('returns cpu information', () => {
    const info = getCpuInfo()
    expect(info.cores).toBeGreaterThan(0)
    expect(Array.isArray(info.loadAverage)).toBe(true)
  })

  it('collects cpu usage over time', async () => {
    const usage = await getCpuUsage(10)
    expect(usage.total).toBeGreaterThan(0)
    expect(usage.percent).toBeGreaterThanOrEqual(0)
    expect(usage.percent).toBeLessThanOrEqual(100)
  })

  it('returns memory info', () => {
    const memory = getMemoryInfo()
    expect(memory.total).toBeGreaterThan(0)
    const diff = Math.abs(memory.total - (memory.used + memory.free))
    expect(diff).toBeLessThan(memory.total * 0.05)
  })

  it('reads disk info for current path', async () => {
    const disk = await getDiskInfo(process.cwd())
    expect(disk.total).toBeGreaterThan(0)
    expect(disk.usedPercent).toBeGreaterThanOrEqual(0)
  })

  it('lists network interfaces', () => {
    const interfaces = getNetworkInterfaces({ includeInternal: true })
    expect(Array.isArray(interfaces)).toBe(true)
    expect(interfaces.length).toBeGreaterThan(0)
  })
})

