import { HTTPClient, HTTPError } from '@cat-kit/http'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

const mockFetch = vi.fn()

if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = { fetch: mockFetch }
} else {
  window.fetch = mockFetch
}

global.fetch = mockFetch

describe('HTTPClient.registerPlugin', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      text: async () => '{}',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registerPlugin 能成功注册并按注册顺序触发 beforeRequest/afterRespond', async () => {
    const order: string[] = []
    const client = new HTTPClient()

    client.registerPlugin({
      name: 'p1',
      beforeRequest() {
        order.push('p1-before')
      },
      afterRespond() {
        order.push('p1-after')
      }
    })
    client.registerPlugin({
      name: 'p2',
      beforeRequest() {
        order.push('p2-before')
      },
      afterRespond() {
        order.push('p2-after')
      }
    })

    await client.get('/users')

    expect(order).toEqual(['p1-before', 'p2-before', 'p1-after', 'p2-after'])
  })

  it('构造函数传入两个同 name 插件应抛 HTTPError({ code: PLUGIN })', () => {
    expect(() => new HTTPClient('', { plugins: [{ name: 'dup' }, { name: 'dup' }] })).toThrowError(
      HTTPError
    )

    try {
      new HTTPClient('', { plugins: [{ name: 'dup' }, { name: 'dup' }] })
    } catch (err) {
      expect(err).toBeInstanceOf(HTTPError)
      expect((err as HTTPError).code).toBe('PLUGIN')
    }
  })

  it('registerPlugin 传入非法 plugin 应抛 HTTPError({ code: PLUGIN })', () => {
    const client = new HTTPClient()

    const assertPluginError = (fn: () => void): void => {
      try {
        fn()
        throw new Error('expected throw')
      } catch (err) {
        expect(err).toBeInstanceOf(HTTPError)
        expect((err as HTTPError).code).toBe('PLUGIN')
      }
    }

    assertPluginError(() => client.registerPlugin({ name: '' } as never))
    assertPluginError(() => client.registerPlugin({} as never))
    assertPluginError(() => client.registerPlugin(null as never))
  })

  it('registerPlugin 注册同 name 插件应抛 HTTPError({ code: PLUGIN })', () => {
    const client = new HTTPClient()
    client.registerPlugin({ name: 'dup' })

    try {
      client.registerPlugin({ name: 'dup' })
      throw new Error('expected throw')
    } catch (err) {
      expect(err).toBeInstanceOf(HTTPError)
      expect((err as HTTPError).code).toBe('PLUGIN')
      expect((err as HTTPError).message).toContain('dup')
    }
  })

  it('group 派生：父插件先于子插件执行，且父在派生后再注册的插件对子生效', async () => {
    const order: string[] = []
    const parent = new HTTPClient('/api')
    parent.registerPlugin({
      name: 'parent-a',
      beforeRequest() {
        order.push('parent-a')
      }
    })

    const child = parent.group('/users')
    child.registerPlugin({
      name: 'child-a',
      beforeRequest() {
        order.push('child-a')
      }
    })

    parent.registerPlugin({
      name: 'parent-b',
      beforeRequest() {
        order.push('parent-b')
      }
    })

    await child.get('/list')

    expect(order).toEqual(['parent-a', 'parent-b', 'child-a'])
  })

  it('子 client 注册的插件不影响父 client；子注册与父链重名抛错', async () => {
    const parent = new HTTPClient('/api')
    parent.registerPlugin({ name: 'p-base', beforeRequest() {} })
    const child = parent.group('/sub')

    const childSpy = vi.fn()
    child.registerPlugin({ name: 'only-child', beforeRequest: childSpy })

    await parent.get('/ping')
    expect(childSpy).not.toHaveBeenCalled()

    try {
      child.registerPlugin({ name: 'p-base' })
      throw new Error('expected throw')
    } catch (err) {
      expect(err).toBeInstanceOf(HTTPError)
      expect((err as HTTPError).code).toBe('PLUGIN')
    }
  })
})
