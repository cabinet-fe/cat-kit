import { describe, expect, test } from 'bun:test'
import {
  getRuntime,
  isInBrowser,
  isInNode,
  getDeviceType,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice
} from '../../src/env/env'

describe('环境工具函数测试', () => {
  describe('运行环境检测', () => {
    // 由于在 bun 环境下运行，预期环境是 Node
    test('getRuntime 应该返回当前运行环境', () => {
      expect(getRuntime()).toBe('node')
    })

    test('isInBrowser 应该在浏览器环境返回 true，其他环境返回 false', () => {
      expect(isInBrowser()).toBe(false)
    })

    test('isInNode 应该在 Node 环境返回 true', () => {
      expect(isInNode()).toBe(true)
    })
  })

  // 注意：以下测试可能在不同环境表现不同，我们模拟一些场景

  describe('设备类型检测 - 基本测试', () => {
    test('应该正确返回设备类型', () => {
      // 在 Node 环境中可能会返回 Unknown，这取决于具体实现
      const deviceType = getDeviceType()
      expect(['Desktop', 'Mobile', 'Tablet', 'Unknown']).toContain(deviceType)
    })
  })

  describe('设备功能测试', () => {
    test('isMobile, isTablet, isDesktop 返回类型应该为布尔值', () => {
      expect(typeof isMobile()).toBe('boolean')
      expect(typeof isTablet()).toBe('boolean')
      expect(typeof isDesktop()).toBe('boolean')
      expect(typeof isTouchDevice()).toBe('boolean')
    })
  })

  // 高级测试 - 如果有全局 window 对象的模拟能力，可以添加以下测试

  // describe('浏览器环境模拟', () => {
  //   // 此处需要模拟浏览器环境，例如添加 window 对象
  //   // 这通常需要更复杂的环境模拟库
  //   // 在真实浏览器环境中运行这些测试会更准确
  // })
})
