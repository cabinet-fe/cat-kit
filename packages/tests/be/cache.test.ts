import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  FileCache,
  LRUCache,
  TTLCache,
  memoize
} from '@cat-kit/be/src/cache'

describe('@cat-kit/be cache utilities', () => {
  describe('LRUCache', () => {
    it('evicts least recently used entries', () => {
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

  describe('TTLCache', () => {
    it('expires entries after ttl', async () => {
      vi.useFakeTimers()
      const cache = new TTLCache<string, string>({ ttl: 100 })

      cache.set('token', 'value')
      vi.advanceTimersByTime(50)
      expect(cache.get('token')).toBe('value')

      vi.advanceTimersByTime(60)
      expect(cache.get('token')).toBeUndefined()
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

    it('persists values to disk', async () => {
      const cache = new FileCache<{ name: string }>({ dir: tempDir })
      await cache.set('user', { name: 'alice' })
      const value = await cache.get('user')
      expect(value).toEqual({ name: 'alice' })
    })
  })

  describe('memoize', () => {
    it('caches function results with custom resolver', async () => {
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

