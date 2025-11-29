import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { cookie } from '@cat-kit/fe/src'

const originalDocument = globalThis.document

function createMockDocument() {
  let store: Record<string, string> = {}

  return {
    get cookie() {
      return Object.entries(store)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    },
    set cookie(value: string) {
      const [pair, ...attrs] = value
        .split(';')
        .map(part => part.trim())
        .filter(Boolean)
      const [rawKey, rawValue] = (pair ?? '').split('=')
      const key = decodeURIComponent(rawKey ?? '')
      const val = decodeURIComponent(rawValue ?? '')

      const expiresAttr = attrs.find(attr =>
        attr.toLowerCase().startsWith('expires=')
      )
      if (expiresAttr) {
        const expTime = new Date(expiresAttr.split('=')[1] ?? '').getTime()
        if (!Number.isNaN(expTime) && expTime <= Date.now()) {
          delete store[key]
          return
        }
      }

      if (!val) {
        delete store[key]
        return
      }

      store[key] = val
    }
  } as unknown as Document
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'document', {
    value: createMockDocument(),
    writable: true
  })
})

afterAll(() => {
  Object.defineProperty(globalThis, 'document', {
    value: originalDocument,
    writable: true
  })
})

describe('cookie 工具', () => {
  it('应该设置、读取与检测存在性', () => {
    cookie.set('session id', 'cat 001')
    expect(cookie.get('session id')).toBe('cat 001')
    expect(cookie.has('session id')).toBe(true)
  })

  it('应该支持删除与过期逻辑', () => {
    cookie.set('token', 'abc')
    cookie.remove('token')
    expect(cookie.get('token')).toBeNull()

    cookie.set('expire', 'soon', { expires: new Date(Date.now() - 1000) })
    expect(cookie.get('expire')).toBeNull()
  })

  it('应该获取与清空全部 cookie', () => {
    cookie.set('a', '1')
    cookie.set('b', '2')
    expect(cookie.getAll()).toEqual({ a: '1', b: '2' })

    cookie.clear()
    expect(cookie.getAll()).toEqual({})
  })
})
