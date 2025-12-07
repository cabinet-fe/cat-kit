import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { FileCache, LRUCache, memoize } from '@cat-kit/be/src'

describe('@cat-kit/be 缓存工具', () => {
  describe('LRUCache', () => {
    it('应该淘汰最近最少使用的条目', () => {
      const cache = new LRUCache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.get('c')).toBe(3)
    })
  })

  describe('LRUCache TTL', () => {
    it('应该在 TTL 后使条目过期', () => {
      vi.useFakeTimers()
      const cache = new LRUCache<string, string>({ ttl: 100 })

      cache.set('token', 'value')
      vi.advanceTimersByTime(50)
      expect(cache.get('token')).toBe('value')

      vi.advanceTimersByTime(60)
      expect(cache.get('token')).toBeUndefined()
      vi.useRealTimers()
    })

    it('应该支持每个条目的 TTL 覆盖', () => {
      vi.useFakeTimers()
      const cache = new LRUCache<string, string>({ ttl: 1000 })

      cache.set('short', 'value1', 50)
      cache.set('long', 'value2')

      vi.advanceTimersByTime(60)
      expect(cache.get('short')).toBeUndefined()
      expect(cache.get('long')).toBe('value2')
      vi.useRealTimers()
    })
  })

  describe('FileCache', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'cat-kit-file-cache-'))
    })

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true })
    })

    it('应该将值持久化到磁盘', async () => {
      const cache = new FileCache<{ name: string }>({ dir: tempDir })
      await cache.set('user', { name: 'alice' })
      const value = await cache.get('user')
      expect(value).toEqual({ name: 'alice' })
    })
  })

  describe('memoize', () => {
    it('应该使用自定义解析器缓存函数结果', async () => {
      const spy = vi.fn(async (value: number) => value * 2)
      const memoized = memoize(spy, {
        resolver: (value: number) => `key:${value}`
      })

      await memoized(2)
      await memoized(2)

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})

