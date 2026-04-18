import { HTTPClient, HTTPError, mergeRequestConfig } from '@cat-kit/http/src'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock 全局 fetch
const mockFetch = vi.fn()

// Mock window 对象（模拟浏览器环境）
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = { fetch: mockFetch }
} else {
  window.fetch = mockFetch
}

global.fetch = mockFetch

describe('HTTPClient', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // 默认的成功响应
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      text: async () => '{"message": "success"}',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(8)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该能创建基本的客户端实例', () => {
      const client = new HTTPClient()
      expect(client).toBeInstanceOf(HTTPClient)
    })

    it('应该能创建带前缀的客户端实例', () => {
      const client = new HTTPClient('/api')
      expect(client).toBeInstanceOf(HTTPClient)
    })

    it('应该能创建带配置的客户端实例', () => {
      const client = new HTTPClient('/api', { timeout: 5000, headers: { 'X-Custom': 'value' } })
      expect(client).toBeInstanceOf(HTTPClient)
    })
  })

  describe('GET 请求', () => {
    it('应该能发送基本的 GET 请求', async () => {
      const client = new HTTPClient()
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledWith('/users', expect.objectContaining({ method: 'GET' }))
    })

    it('应该能处理查询参数', async () => {
      const client = new HTTPClient()
      await client.get('/users', { query: { name: 'test', age: 25 } })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('?name=test&age=25'),
        expect.any(Object)
      )
    })

    it('应该能合并 URL 中已有的查询参数', async () => {
      const client = new HTTPClient()
      await client.get('/users?id=1', { query: { name: 'test' } })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('?id=1&name=test'),
        expect.any(Object)
      )
    })

    it('应该能拼接前缀', async () => {
      const client = new HTTPClient('/api')
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledWith('/api/users', expect.any(Object))
    })

    it('应该能处理完整的 URL', async () => {
      const client = new HTTPClient('/api')
      await client.get('https://example.com/users')

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/users', expect.any(Object))
    })
  })

  describe('POST 请求', () => {
    it('应该能发送基本的 POST 请求', async () => {
      const client = new HTTPClient()
      const data = { name: 'test', age: 25 }

      await client.post('/users', data)

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({ method: 'POST', body: JSON.stringify(data) })
      )
    })

    it('应该能发送 FormData', async () => {
      const client = new HTTPClient()
      const formData = new FormData()
      formData.append('name', 'test')

      await client.post('/upload', formData)

      expect(mockFetch).toHaveBeenCalledWith(
        '/upload',
        expect.objectContaining({ method: 'POST', body: formData })
      )
    })

    it('应该能添加自定义头部', async () => {
      const client = new HTTPClient()
      await client.post('/users', { name: 'test' }, { headers: { 'X-Custom-Header': 'value' } })

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Custom-Header': 'value' })
        })
      )
    })
  })

  describe('PUT 请求', () => {
    it('应该能发送 PUT 请求', async () => {
      const client = new HTTPClient()
      const data = { name: 'updated' }

      await client.put('/users/1', data)

      expect(mockFetch).toHaveBeenCalledWith(
        '/users/1',
        expect.objectContaining({ method: 'PUT', body: JSON.stringify(data) })
      )
    })
  })

  describe('DELETE 请求', () => {
    it('应该能发送 DELETE 请求', async () => {
      const client = new HTTPClient()
      await client.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/users/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('PATCH 请求', () => {
    it('应该能发送 PATCH 请求', async () => {
      const client = new HTTPClient()
      const data = { age: 26 }

      await client.patch('/users/1', data)

      expect(mockFetch).toHaveBeenCalledWith(
        '/users/1',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(data) })
      )
    })
  })

  describe('HEAD 请求', () => {
    it('应该能发送 HEAD 请求', async () => {
      const client = new HTTPClient()
      await client.head('/users')

      expect(mockFetch).toHaveBeenCalledWith('/users', expect.objectContaining({ method: 'HEAD' }))
    })
  })

  describe('OPTIONS 请求', () => {
    it('应该能发送 OPTIONS 请求', async () => {
      const client = new HTTPClient()
      await client.options('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({ method: 'OPTIONS' })
      )
    })
  })

  describe('请求分组', () => {
    it('应该能创建请求分组', () => {
      const client = new HTTPClient('/api')
      const userGroup = client.group('/users')

      expect(userGroup).toBeInstanceOf(HTTPClient)
    })

    it('分组请求应该拼接正确的路径', async () => {
      const client = new HTTPClient('/api')
      const userGroup = client.group('/users')

      await userGroup.get('/profile')

      expect(mockFetch).toHaveBeenCalledWith('/api/users/profile', expect.any(Object))
    })
  })

  describe('请求配置合并', () => {
    it('应该能合并全局头部和请求头部', async () => {
      const client = new HTTPClient('/api', {
        headers: { 'X-Global': 'global-value', 'X-Override': 'global' }
      })

      await client.get('/users', { headers: { 'X-Custom': 'custom-value', 'X-Override': 'local' } })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Global': 'global-value',
            'X-Custom': 'custom-value',
            'X-Override': 'local' // 应该被请求头覆盖
          })
        })
      )
    })

    it('不应该将客户端插件配置透传给 fetch', async () => {
      const client = new HTTPClient('/api', {
        plugins: [
          {
            name: 'noop',
            beforeRequest() {
              return
            }
          }
        ],
        timeout: 3000
      })

      await client.get('/users')

      const [, requestInit] = mockFetch.mock.calls[0] as [string, RequestInit]

      expect((requestInit as any).plugins).toBeUndefined()
      expect((requestInit as any).origin).toBeUndefined()
      expect(requestInit.signal).toBeDefined()
    })
  })

  describe('响应处理', () => {
    it('应该能正确解析 JSON 响应', async () => {
      const client = new HTTPClient()
      const response = await client.get('/users')

      expect(response.data).toEqual({ message: 'success' })
      expect(response.code).toBe(200)
    })

    it('应该能处理不同的响应类型', async () => {
      const client = new HTTPClient()

      // 测试 text 类型
      const textResponse = await client.get('/data', { responseType: 'text' })
      expect(textResponse.data).toBeDefined()
    })

    it('应该保留原始响应对象', async () => {
      const client = new HTTPClient()
      const response = await client.get('/users')

      expect(response.raw).toBeDefined()
    })

    it('空响应体在 json 模式下应返回 null', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Map([['content-type', 'application/json']]),
        text: async () => '',
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(8)
      })

      const client = new HTTPClient()
      const response = await client.get('/empty')

      expect(response.data).toBeNull()
      expect(response.code).toBe(204)
    })

    it('fetch 遇到非 2xx 响应时应抛出 HTTPError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map([['content-type', 'application/json']]),
        text: async () => '{"message": "not found"}',
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(8)
      })

      const client = new HTTPClient()

      await expect(client.get('/missing')).rejects.toMatchObject({
        name: 'HTTPError',
        message: '请求失败，状态码: 404',
        code: 'NETWORK',
        response: expect.objectContaining({ code: 404, data: { message: 'not found' } })
      } satisfies Partial<HTTPError>)
    })
  })

  describe('插件系统', () => {
    it('应该能执行 beforeRequest 钩子', async () => {
      const beforeRequest = vi.fn(async (url, config) => {
        return {
          config: { ...config, headers: { ...config.headers, 'X-Plugin': 'added-by-plugin' } }
        }
      })

      const client = new HTTPClient('/api', { plugins: [{ name: 'before-request', beforeRequest }] })

      await client.get('/users')

      expect(beforeRequest).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Plugin': 'added-by-plugin' })
        })
      )
    })

    it('应该能执行 afterRespond 钩子', async () => {
      const afterRespond = vi.fn(async (response) => {
        return { ...response, data: { ...response.data, modified: true } }
      })

      const client = new HTTPClient('/api', { plugins: [{ name: 'after-respond', afterRespond }] })

      const response = await client.get('/users')

      expect(afterRespond).toHaveBeenCalled()
      expect(response.data).toHaveProperty('modified', true)
    })

    it('应该能按顺序执行多个插件', async () => {
      const order: number[] = []

      const plugin1 = {
        name: 'plugin-1',
        beforeRequest: vi.fn(async () => {
          order.push(1)
          return {}
        })
      }

      const plugin2 = {
        name: 'plugin-2',
        beforeRequest: vi.fn(async () => {
          order.push(2)
          return {}
        })
      }

      const client = new HTTPClient('/api', { plugins: [plugin1, plugin2] })

      await client.get('/users')

      expect(order).toEqual([1, 2])
    })

    it('请求失败时应触发 onError 钩子', async () => {
      const onError = vi.fn()
      const networkError = new Error('fetch failed')
      mockFetch.mockRejectedValueOnce(networkError)

      const client = new HTTPClient('/api', { plugins: [{ name: 'on-error', onError }] })

      await expect(client.get('/users')).rejects.toThrow('网络错误')

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError.mock.calls[0]?.[1]).toMatchObject({
        url: '/api/users',
        config: expect.objectContaining({ method: 'GET' })
      })
    })
  })

  describe('URL 处理', () => {
    it('应该保留传入 URL 的编码状态', async () => {
      const client = new HTTPClient()
      const encodedUrl = encodeURIComponent('/users/张三')

      await client.get(encodedUrl)

      expect(mockFetch).toHaveBeenCalledWith(`/${encodedUrl}`, expect.any(Object))
    })

    it('完整 URL 应保留编码路径', async () => {
      const client = new HTTPClient('/api')

      await client.get('https://example.com/%E8%B5%84%E6%BA%90')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/%E8%B5%84%E6%BA%90',
        expect.any(Object)
      )
    })

    it('应该能正确拼接路径', async () => {
      const client = new HTTPClient('/api/')
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledWith('/api/users', expect.any(Object))
    })

    it('数组查询参数应重复 key 并忽略 undefined', async () => {
      const client = new HTTPClient()

      await client.get('/users', { query: { tag: ['a', 'b'], skip: undefined, empty: null } })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users?tag=a&tag=b&empty=null'),
        expect.any(Object)
      )
    })
  })

  describe('signal 与超时', () => {
    it('per-request signal 中止时抛出 ABORTED', async () => {
      mockFetch.mockImplementation((_url, init) => {
        return new Promise((_resolve, reject) => {
          const sig = (init as RequestInit).signal
          if (!sig) {
            reject(new Error('no signal'))
            return
          }
          const onAbort = (): void => {
            const err = new Error('aborted')
            err.name = 'AbortError'
            reject(err)
          }
          if (sig.aborted) {
            onAbort()
            return
          }
          sig.addEventListener('abort', onAbort)
        })
      })

      const client = new HTTPClient()
      const ac = new AbortController()
      const p = client.get('/users', { signal: ac.signal })
      ac.abort()

      await expect(p).rejects.toMatchObject({ name: 'HTTPError', code: 'ABORTED' })
    })

    it('超时触发 TIMEOUT，不与外部 signal 语义混淆', async () => {
      vi.useFakeTimers()
      mockFetch.mockImplementation((_url, init) => {
        return new Promise((_resolve, reject) => {
          const sig = (init as RequestInit).signal
          if (!sig) {
            reject(new Error('no signal'))
            return
          }
          const onAbort = (): void => {
            const err = new Error('aborted')
            err.name = 'AbortError'
            reject(err)
          }
          if (sig.aborted) {
            onAbort()
            return
          }
          sig.addEventListener('abort', onAbort)
        })
      })

      const client = new HTTPClient()
      const p = client.get('/slow', { timeout: 80 })
      const assertRejected = expect(p).rejects.toMatchObject({ name: 'HTTPError', code: 'TIMEOUT' })

      await vi.advanceTimersByTimeAsync(80)
      await assertRejected
      vi.useRealTimers()
    })
  })

  describe('mergeRequestConfig', () => {
    it('headers/query 对象合并且 undefined 不清空已有字段', () => {
      const base: Parameters<typeof mergeRequestConfig>[0] = {
        method: 'GET',
        timeout: 5000,
        headers: { a: '1', b: '2' },
        query: { x: 1, y: 2 }
      }
      const patch = { headers: { b: '3', c: '4' }, query: { y: 9 }, timeout: 100 }
      const m = mergeRequestConfig(base, patch)
      expect(m.headers).toEqual({ a: '1', b: '3', c: '4' })
      expect(m.query).toEqual({ x: 1, y: 9 })
      expect(m.timeout).toBe(100)
    })
  })

  describe('PluginContext.retry 与 onError 恢复', () => {
    it('afterRespond 通过 context.retry 重试时 mockFetch 调用 2 次', async () => {
      let n = 0
      const afterRespond = vi.fn(async (_res, _url, _cfg, ctx) => {
        n += 1
        if (n === 1 && ctx) {
          return ctx.retry()
        }
        return undefined
      })

      const client = new HTTPClient('', { plugins: [{ name: 'retry-ctx', afterRespond }] })
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('retry 合并 headers/query/timeout 符合规则', async () => {
      let n = 0
      const afterRespond = vi.fn(async (_res, _url, _cfg, ctx) => {
        n += 1
        if (n === 1 && ctx) {
          return ctx.retry({ headers: { 'X-R': 'retry' }, query: { q: '1' }, timeout: 9999 })
        }
        return undefined
      })

      const client = new HTTPClient('', {
        plugins: [{ name: 'retry-merge', afterRespond }],
        headers: { 'X-Base': 'b' },
        timeout: 100
      })

      await client.get('/api', { headers: { 'X-Req': 'r' }, timeout: 200, query: { a: '0' } })

      const second = mockFetch.mock.calls[1] as [string, RequestInit]
      expect(second[0]).toContain('q=1')
      expect(second[0]).toContain('a=0')
      const h = second[1].headers as Record<string, string>
      expect(h['X-Base']).toBe('b')
      expect(h['X-Req']).toBe('r')
      expect(h['X-R']).toBe('retry')
    })

    it('onError 返回 HTTPResponse 时 request 不抛错', async () => {
      mockFetch.mockRejectedValueOnce(new Error('boom'))
      const recovered = { data: { ok: true }, code: 200, headers: {} }
      const onError = vi.fn(() => recovered)

      const client = new HTTPClient('', { plugins: [{ name: 'recover', onError }] })
      const res = await client.get('/x')

      expect(res).toEqual(recovered)
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('onError 首个恢复结果不被后续插件覆盖且后续仍执行', async () => {
      mockFetch.mockRejectedValueOnce(new Error('boom'))
      const first = { data: { which: 'first' }, code: 200, headers: {} }
      const second = { data: { which: 'second' }, code: 201, headers: {} }
      const side = vi.fn()
      const client = new HTTPClient('', {
        plugins: [
          { name: 'recover-first', onError: () => first },
          {
            name: 'recover-second',
            onError: () => {
              side()
              return second
            }
          }
        ]
      })

      const res = await client.get('/x')
      expect(res.data).toEqual({ which: 'first' })
      expect(side).toHaveBeenCalledTimes(1)
    })

    it('afterRespond 无限 retry 最终 RETRY_LIMIT_EXCEEDED', async () => {
      const afterRespond = vi.fn(async (_res, _url, _cfg, ctx) => {
        if (ctx) {
          return ctx.retry()
        }
      })

      const client = new HTTPClient('', { plugins: [{ name: 'retry-loop', afterRespond }] })

      await expect(client.get('/loop')).rejects.toMatchObject({
        code: 'RETRY_LIMIT_EXCEEDED',
        message: expect.stringContaining('最大重试次数')
      })

      expect(mockFetch.mock.calls.length).toBe(11)
    })
  })
})
