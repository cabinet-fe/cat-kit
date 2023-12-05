import { getDeviceType, getRuntime } from './env'

describe('环境', () => {
  test('获取运行环境', () => {
    expect(getRuntime()).toBe('web')
  })

  test('获取设备类型', () => {
    expect(getDeviceType()).toBe('desktop')
  })
})
