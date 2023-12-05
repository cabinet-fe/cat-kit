import { safeRun } from './safe'

describe('程序安全优化', () => {
  test('安全运行', () => {
    const origin = '{]'
    expect(safeRun(() => JSON.parse(origin))).toBe(undefined)
    expect(safeRun(() => JSON.parse(origin), origin)).toBe(origin)
  })
})
