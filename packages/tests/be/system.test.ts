import {
  getCpuInfo,
  getCpuUsage,
  getDiskInfo,
  getMemoryInfo,
  getNetworkInterfaces
} from '@cat-kit/be/src'

describe('@cat-kit/be 系统工具', () => {
  it('应该返回 CPU 信息', () => {
    const info = getCpuInfo()
    expect(info.cores).toBeGreaterThan(0)
    expect(Array.isArray(info.loadAverage)).toBe(true)
  })

  it('应该收集一段时间内的 CPU 使用率', async () => {
    const usage = await getCpuUsage(10)
    expect(usage.total).toBeGreaterThan(0)
    expect(usage.percent).toBeGreaterThanOrEqual(0)
    expect(usage.percent).toBeLessThanOrEqual(100)
  })

  it('应该返回内存信息', () => {
    const memory = getMemoryInfo()
    expect(memory.total).toBeGreaterThan(0)
    const diff = Math.abs(memory.total - (memory.used + memory.free))
    expect(diff).toBeLessThan(memory.total * 0.05)
  })

  it('应该读取当前路径的磁盘信息', async () => {
    const disk = await getDiskInfo(process.cwd())
    expect(disk.total).toBeGreaterThan(0)
    expect(disk.usedPercent).toBeGreaterThanOrEqual(0)
  })

  it('应该列出网络接口', () => {
    const interfaces = getNetworkInterfaces({ includeInternal: true })
    expect(Array.isArray(interfaces)).toBe(true)
    expect(interfaces.length).toBeGreaterThan(0)
  })
})

