import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WebStorage, storageKey } from '@cat-kit/fe/src'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys())
    return keys[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

describe('WebStorage', () => {
  const TOKEN = storageKey<string>('token')
  const COUNT = storageKey<number>('count')
  let memory: MemoryStorage
  let storage: WebStorage

  beforeEach(() => {
    vi.useRealTimers()
    memory = new MemoryStorage()
    storage = new WebStorage(memory)
  })

  it('应该支持过期时间与默认值', () => {
    vi.useFakeTimers()
    storage.set(TOKEN, 'cat', 1)
    expect(storage.get(TOKEN)).toBe('cat')

    vi.advanceTimersByTime(1200)
    expect(storage.get(TOKEN, 'default-token')).toBe('default-token')
    expect(memory.length).toBe(0)
  })

  it('应该支持批量读取与非法类型过滤', () => {
    storage
      .set(TOKEN, 'meow')
      .set(COUNT, 3)
      // @ts-expect-error: 函数类型应被忽略
      .set('fn', () => 'nope')

    expect(storage.get([TOKEN, COUNT])).toEqual(['meow', 3])
    expect(memory.length).toBe(2)
  })

  it('应该触发监听并返回过期时间', () => {
    const handler = vi.fn()
    storage.on('token', handler)

    const start = Date.now()
    storage.set(TOKEN, 'catnip', 60)

    expect(handler).toHaveBeenCalledTimes(1)
    const [, , temp] = handler.mock.calls[0]!
    expect(temp?.exp).toBeGreaterThan(start)
    expect(temp?.exp).toBeLessThan(start + 61000)
    expect(storage.getExpire(TOKEN)).toBe(temp?.exp)
  })

  it('应该支持移除单个、多个与全部记录', () => {
    const NAME = storageKey('name')
    const COLOR = storageKey('color')
    storage.set(TOKEN, 'a').set(NAME, 'b').set(COLOR, 'c')

    storage.remove(TOKEN)
    expect(storage.get(TOKEN)).toBeNull()
    expect(memory.length).toBe(2)

    storage.remove([NAME, COLOR])
    expect(memory.length).toBe(0)

    storage.set(TOKEN, 'again')
    expect(memory.length).toBe(1)
    storage.remove()
    expect(memory.length).toBe(0)
  })
})
