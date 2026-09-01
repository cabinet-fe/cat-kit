import { copy } from '@cat-kit/core'
import { describe, expect, it, vi } from 'vitest'
import { isReactive, isReadonly, reactive, readonly } from 'vue'

function markVue<T extends object>(obj: T, kind: 'vue3' | 'vue2' = 'vue3'): T {
  if (kind === 'vue2') {
    Object.defineProperty(obj, '__ob__', { value: {} })
    return obj
  }
  Object.defineProperty(obj, '__v_raw', { value: obj })
  Object.defineProperty(obj, '__v_isReactive', { value: true })
  return obj
}

describe('copy', () => {
  describe('原始值', () => {
    it('应该原样返回原始值', () => {
      expect(copy(1)).toBe(1)
      expect(copy('a')).toBe('a')
      expect(copy(true)).toBe(true)
      expect(copy(null)).toBe(null)
      expect(copy(undefined)).toBe(undefined)
      const sym = Symbol('s')
      expect(copy(sym)).toBe(sym)
    })
  })

  describe('普通对象与数组', () => {
    it('应该深拷贝嵌套对象和数组', () => {
      const obj = { a: 1, b: { c: 2 }, d: [3, 4] }
      const cloned = copy(obj)

      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
      expect(cloned.d).not.toBe(obj.d)
    })
  })

  describe('内置类型', () => {
    it('应该拷贝 Date', () => {
      const date = new Date('2024-01-15T00:00:00.000Z')
      const cloned = copy(date)

      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
      expect(cloned.getTime()).toBe(date.getTime())
    })

    it('应该拷贝 Map 与 Set', () => {
      const nested = { inner: 2 }
      const map = new Map<unknown, unknown>([
        ['a', 1],
        ['obj', nested]
      ])
      const set = new Set([{ n: 1 }, 2])

      const clonedMap = copy(map)
      const clonedSet = copy(set)

      expect(clonedMap).not.toBe(map)
      expect(clonedMap.get('a')).toBe(1)
      expect(clonedMap.get('obj')).toEqual(nested)
      expect(clonedMap.get('obj')).not.toBe(nested)

      expect(clonedSet).not.toBe(set)
      expect([...clonedSet]).toEqual([{ n: 1 }, 2])
      expect([...clonedSet][0]).not.toBe([...set][0])
    })

    it('应该拷贝 TypedArray', () => {
      const arr = new Uint8Array([1, 2, 3])
      const cloned = copy(arr)

      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      cloned[0] = 9
      expect(arr[0]).toBe(1)
    })
  })

  describe('循环引用与隔离', () => {
    it('应该保留循环引用', () => {
      const obj: { a: number; self?: unknown } = { a: 1 }
      obj.self = obj

      const cloned = copy(obj)

      expect(cloned.a).toBe(1)
      expect(cloned.self).toBe(cloned)
      expect(cloned).not.toBe(obj)
    })

    it('修改拷贝不应该影响原值', () => {
      const obj = { a: 1, b: { c: 2 }, d: [3] }
      const cloned = copy(obj)

      cloned.a = 999
      cloned.b.c = 999
      cloned.d.push(4)

      expect(obj.a).toBe(1)
      expect(obj.b.c).toBe(2)
      expect(obj.d).toEqual([3])
    })
  })

  describe('Proxy 与 Vue 标记', () => {
    it('应该拷贝普通 Proxy 且不抛错', () => {
      const target = { a: 1, b: { c: 2 } }
      const proxy = new Proxy(target, {})

      expect(() => structuredClone(proxy)).toThrow()

      const cloned = copy(proxy)
      expect(cloned).toEqual(target)
      expect(cloned).not.toBe(target)
      expect(cloned.b).not.toBe(target.b)
    })

    it('应该跳过 structuredClone 并拷贝带 Vue 3 标记的对象', () => {
      const obj = markVue({ a: 1, b: { c: 2 } })
      const cloned = copy(obj)

      expect(cloned).toEqual({ a: 1, b: { c: 2 } })
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('应该拷贝带 Vue 2 __ob__ 标记的对象', () => {
      const obj = markVue({ a: 1, nested: { b: 2 } }, 'vue2')
      const cloned = copy(obj)

      expect(cloned).toEqual({ a: 1, nested: { b: 2 } })
      expect(cloned.nested).not.toBe(obj.nested)
    })
  })

  describe('真实 Vue 3', () => {
    it('应该把 reactive 拷成普通对象且不抛错', () => {
      const state = reactive({ a: 1, nested: { b: 2 } })
      const spy = vi.spyOn(globalThis, 'structuredClone')
      const cloned = copy(state)

      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
      expect(cloned).toEqual({ a: 1, nested: { b: 2 } })
      expect(isReactive(cloned)).toBe(false)
      expect(isReactive(cloned.nested)).toBe(false)
      cloned.a = 9
      expect(state.a).toBe(1)
    })

    it('应该把 readonly 拷成普通对象且不抛错', () => {
      const state = readonly({ a: 1, nested: { b: 2 } })
      const cloned = copy(state)

      expect(cloned).toEqual({ a: 1, nested: { b: 2 } })
      expect(isReadonly(cloned)).toBe(false)
      expect(cloned.nested).not.toBe(state.nested)
    })
  })

  describe('函数', () => {
    it('应该保留同一函数引用', () => {
      const fn = () => 'test'
      const obj = { a: 1, fn }
      const cloned = copy(obj)

      expect(cloned.a).toBe(1)
      expect(cloned.fn).toBe(fn)
      expect(cloned).not.toBe(obj)
    })
  })

  describe('无 structuredClone', () => {
    it('应该走回退路径并正确拷贝', () => {
      const original = globalThis.structuredClone
      // @ts-expect-error 模拟旧环境
      globalThis.structuredClone = undefined

      try {
        expect(typeof globalThis.structuredClone).not.toBe('function')

        const nested = { v: 1 }
        const obj = {
          a: 1,
          b: { c: 2 },
          d: new Date('2024-01-01T00:00:00.000Z'),
          e: new Map([['k', nested]]),
          f: new Set([nested]),
          g: new Uint8Array([1, 2]),
          h: /ab/gi
        }
        const cloned = copy(obj)

        expect(cloned).not.toBe(obj)
        expect(cloned.b).not.toBe(obj.b)
        expect(cloned.b.c).toBe(2)
        expect(cloned.d).toEqual(obj.d)
        expect(cloned.d).not.toBe(obj.d)
        expect(cloned.e.get('k')).toEqual(nested)
        expect(cloned.e.get('k')).not.toBe(nested)
        expect([...cloned.f][0]).toEqual(nested)
        expect([...cloned.f][0]).not.toBe(nested)
        expect(cloned.g).toEqual(obj.g)
        expect(cloned.g).not.toBe(obj.g)
        expect(cloned.h).toEqual(obj.h)
        expect(cloned.h).not.toBe(obj.h)

        const key = Symbol('k')
        const withSymbol = { a: 1, [key]: { n: 2 } }
        const clonedSymbol = copy(withSymbol)
        expect(clonedSymbol[key]).toEqual({ n: 2 })
        expect(clonedSymbol[key]).not.toBe(withSymbol[key])

        const cyclic: { n: number; self?: unknown } = { n: 1 }
        cyclic.self = cyclic
        const clonedCyclic = copy(cyclic)
        expect(clonedCyclic.self).toBe(clonedCyclic)
      } finally {
        globalThis.structuredClone = original
      }
    })
  })
})
