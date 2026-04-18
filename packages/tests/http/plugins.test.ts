import {
  HTTPClient,
  HTTPMethodOverridePlugin as MethodOverridePlugin,
  RetryPlugin,
  HTTPTokenPlugin as TokenPlugin
} from '@cat-kit/http/src'
import type { RequestConfig } from '@cat-kit/http/src'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const mockFetch = vi.fn()

if (typeof window === 'undefined') {
  // @ts-expect-error test env
  global.window = { fetch: mockFetch }
} else {
  window.fetch = mockFetch
}

global.fetch = mockFetch

const okJsonResponse = {
  ok: true,
  status: 200,
  headers: new Map([['content-type', 'application/json']]),
  text: async () => '{"message": "success"}',
  blob: async () => new Blob(),
  arrayBuffer: async () => new ArrayBuffer(8)
}

describe('TokenPlugin', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockFetch.mockResolvedValue(okJsonResponse)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('基本功能', () => {
    it('应该能创建 Token 插件', () => {
      const plugin = TokenPlugin({ getter: () => 'test-token' })

      expect(plugin).toHaveProperty('beforeRequest')
      expect(typeof plugin.beforeRequest).toBe('function')
    })

    it('应该能添加 Bearer token', async () => {
      const plugin = TokenPlugin({ getter: () => 'test-token', authType: 'Bearer' })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result).toBeDefined()
      expect(result?.config?.headers).toBeDefined()
      expect(result?.config?.headers?.['Authorization']).toBe('Bearer test-token')
    })

    it('应该支持异步 getter', async () => {
      const plugin = TokenPlugin({
        getter: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return 'async-token'
        },
        authType: 'Bearer'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer async-token')
    })

    it('当 getter 返回 null 时不应添加 token', async () => {
      const plugin = TokenPlugin({ getter: () => null })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })

    it('当 getter 返回 undefined 时不应添加 token', async () => {
      const plugin = TokenPlugin({ getter: () => undefined })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })
  })

  describe('授权类型', () => {
    it('应该支持 Bearer 授权', async () => {
      const plugin = TokenPlugin({ getter: () => 'my-token', authType: 'Bearer' })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer my-token')
    })

    it('应该支持 Basic 授权', async () => {
      const plugin = TokenPlugin({ getter: () => 'my-token', authType: 'Basic' })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Basic my-token')
    })

    it('应该支持自定义授权类型', async () => {
      const plugin = TokenPlugin({
        getter: () => 'my-token',
        authType: 'Custom',
        formatter: (token) => `Custom ${token}`
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Custom my-token')
    })
  })

  describe('自定义头部名称', () => {
    it('应该能使用自定义头部名称', async () => {
      const plugin = TokenPlugin({
        getter: () => 'test-token',
        headerName: 'X-Auth-Token',
        authType: 'Bearer'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['X-Auth-Token']).toBe('Bearer test-token')
      expect(result?.config?.headers?.['Authorization']).toBeUndefined()
    })
  })

  describe('保留现有头部', () => {
    it('应该保留现有的请求头', async () => {
      const plugin = TokenPlugin({ getter: () => 'test-token', authType: 'Bearer' })

      const config: RequestConfig = {
        method: 'GET',
        headers: { 'X-Custom': 'value', 'Content-Type': 'application/json' }
      }

      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers).toMatchObject({
        'X-Custom': 'value',
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token'
      })
    })
  })

  describe('实际使用场景', () => {
    it('应该能模拟从 localStorage 获取 token', async () => {
      // 模拟 localStorage
      const storage: Record<string, string> = { token: 'stored-token' }

      const plugin = TokenPlugin({ getter: () => storage.token, authType: 'Bearer' })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer stored-token')
    })

    it('应该能模拟从异步 API 获取 token', async () => {
      const getTokenFromAPI = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 'api-token'
      }

      const plugin = TokenPlugin({ getter: getTokenFromAPI, authType: 'Bearer' })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer api-token')
    })
  })

  describe('v2 刷新与排队', () => {
    it('access_token 过期时刷新一次并成功带上新 token', async () => {
      let token = 'old-token'
      let expired = true
      const onRefresh = vi.fn(async () => {
        expired = false
        token = 'new-token'
      })

      const client = new HTTPClient('', {
        plugins: [
          TokenPlugin({
            getter: () => token,
            authType: 'Bearer',
            onRefresh,
            isExpired: () => expired
          })
        ]
      })

      await client.get('/api')

      expect(onRefresh).toHaveBeenCalledTimes(1)
      const init = mockFetch.mock.calls[0]?.[1] as RequestInit
      const h = init.headers as Record<string, string>
      expect(h['Authorization']).toBe('Bearer new-token')
    })

    it('refresh_token 过期时调用 onRefreshExpired 并抛出错误', async () => {
      const onRefreshExpired = vi.fn()
      const client = new HTTPClient('', {
        plugins: [
          TokenPlugin({ getter: () => 'x', isRefreshExpired: () => true, onRefreshExpired })
        ]
      })

      await expect(client.get('/api')).rejects.toMatchObject({
        name: 'HTTPError',
        message: '刷新令牌已过期',
        code: 'UNKNOWN'
      })
      expect(onRefreshExpired).toHaveBeenCalledTimes(1)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('并发请求在 access 过期时只触发一次 onRefresh', async () => {
      let expired = true
      let refreshCount = 0
      const onRefresh = vi.fn(async () => {
        refreshCount += 1
        await new Promise((r) => setTimeout(r, 15))
        expired = false
      })

      const client = new HTTPClient('', {
        plugins: [TokenPlugin({ getter: () => 'tok', onRefresh, isExpired: () => expired })]
      })

      await Promise.all([client.get('/a'), client.get('/b'), client.get('/c')])

      expect(onRefresh).toHaveBeenCalledTimes(1)
      expect(refreshCount).toBe(1)
    })

    it('shouldRefresh 遇 401 时刷新并通过 retry 得到 200', async () => {
      const onRefresh = vi.fn(async () => {})
      let call = 0
      mockFetch.mockImplementation(() => {
        call += 1
        if (call === 1) {
          return Promise.resolve({
            ok: false,
            status: 401,
            headers: new Map([['content-type', 'application/json']]),
            text: async () => '{}',
            blob: async () => new Blob(),
            arrayBuffer: async () => new ArrayBuffer(8)
          })
        }
        return Promise.resolve(okJsonResponse)
      })

      const client = new HTTPClient('', {
        plugins: [
          TokenPlugin({
            getter: () => 'access',
            onRefresh,
            shouldRefresh: (res) => res.code === 401
          })
        ]
      })

      const res = await client.get('/secure')
      expect(res.code).toBe(200)
      expect(onRefresh).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('仅配置 shouldRefresh 而无 onRefresh 时不重试且不额外请求', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Map([['content-type', 'application/json']]),
        text: async () => '{}',
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(8)
      })

      const client = new HTTPClient('', {
        plugins: [TokenPlugin({ getter: () => 'access', shouldRefresh: (res) => res.code === 401 })]
      })

      await expect(client.get('/secure')).rejects.toMatchObject({ name: 'HTTPError' })
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})

describe('RetryPlugin', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockFetch.mockResolvedValue(okJsonResponse)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('默认配置下网络错误重试直至成功', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('e1'))
      .mockRejectedValueOnce(new Error('e2'))
      .mockResolvedValueOnce(okJsonResponse)

    const client = new HTTPClient('', { plugins: [RetryPlugin()] })
    const res = await client.get('/x')
    expect(res.code).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('超过 maxRetries 后抛出原始错误', async () => {
    mockFetch.mockRejectedValue(new Error('always'))

    const client = new HTTPClient('', { plugins: [RetryPlugin({ maxRetries: 2 })] })

    await expect(client.get('/x')).rejects.toThrow('网络错误')
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('retryOn 返回 false 时不重试', async () => {
    mockFetch.mockRejectedValueOnce(new Error('once'))

    const client = new HTTPClient('', { plugins: [RetryPlugin({ retryOn: () => false })] })

    await expect(client.get('/x')).rejects.toThrow('网络错误')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('函数 delay 通过定时器生效', async () => {
    vi.useFakeTimers()

    mockFetch.mockRejectedValue(new Error('fail'))

    const delayFn = vi.fn((a: number) => 100 + a * 50)
    const client = new HTTPClient('', { plugins: [RetryPlugin({ maxRetries: 1, delay: delayFn })] })

    const p = client.get('/t')
    const assertFail = expect(p).rejects.toThrow('网络错误')
    await vi.runAllTimersAsync()
    await assertFail

    expect(delayFn).toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('固定 delay 通过定时器生效', async () => {
    vi.useFakeTimers()

    mockFetch.mockRejectedValue(new Error('fail'))

    const client = new HTTPClient('', { plugins: [RetryPlugin({ maxRetries: 1, delay: 750 })] })

    const p = client.get('/t')
    const assertFail = expect(p).rejects.toThrow('网络错误')
    await vi.runAllTimersAsync()
    await assertFail

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('默认 delay 首次重试前等待 1000ms', async () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')

    mockFetch.mockRejectedValueOnce(new Error('e1')).mockResolvedValueOnce(okJsonResponse)

    const client = new HTTPClient('', { plugins: [RetryPlugin({ maxRetries: 2 })] })
    const p = client.get('/backoff')
    await vi.runAllTimersAsync()
    await p

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    setTimeoutSpy.mockRestore()
  })

  it('retryOnStatus 为 503 时在失败后重试成功', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: new Map([['content-type', 'application/json']]),
        text: async () => '{}',
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(8)
      })
      .mockResolvedValueOnce(okJsonResponse)

    const client = new HTTPClient('', {
      plugins: [RetryPlugin({ retryOnStatus: [503], delay: 0 })]
    })

    const res = await client.get('/svc')
    expect(res.code).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('MethodOverridePlugin', () => {
  describe('基本功能', () => {
    it('应该能创建方法重写插件', () => {
      const plugin = MethodOverridePlugin()

      expect(plugin).toHaveProperty('beforeRequest')
      expect(typeof plugin.beforeRequest).toBe('function')
    })

    it('应该重写 DELETE 方法', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'DELETE' }
      const result = await plugin.beforeRequest!('/api/users/1', config)

      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('DELETE')
    })

    it('应该重写 PUT 方法', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'PUT' }
      const result = await plugin.beforeRequest!('/api/users/1', config)

      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('PUT')
    })

    it('应该重写 PATCH 方法', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'PATCH' }
      const result = await plugin.beforeRequest!('/api/users/1', config)

      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('PATCH')
    })

    it('不应该重写 GET 方法', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest!('/api/users', config)

      expect(result).toEqual({})
    })

    it('不应该重写 POST 方法', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'POST' }
      const result = await plugin.beforeRequest!('/api/users', config)

      expect(result).toEqual({})
    })
  })

  describe('自定义配置', () => {
    it('应该能自定义需要重写的方法', async () => {
      const plugin = MethodOverridePlugin({ methods: ['DELETE'] })

      const deleteConfig: RequestConfig = { method: 'DELETE' }
      const deleteResult = await plugin.beforeRequest!('/api/users/1', deleteConfig)
      expect(deleteResult?.config?.method).toBe('POST')

      const putConfig: RequestConfig = { method: 'PUT' }
      const putResult = await plugin.beforeRequest!('/api/users/1', putConfig)
      expect(putResult).toEqual({})
    })

    it('应该能自定义重写后的方法', async () => {
      const plugin = MethodOverridePlugin({ overrideMethod: 'GET' })

      const config: RequestConfig = { method: 'DELETE' }
      const result = await plugin.beforeRequest!('/api/users/1', config)

      expect(result?.config?.method).toBe('GET')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('DELETE')
    })

    it('应该支持自定义方法覆盖请求头名称', async () => {
      const plugin = MethodOverridePlugin({ headerName: 'X-Method-Override' })

      const config: RequestConfig = { method: 'DELETE' }
      const result = await plugin.beforeRequest!('/api/users/1', config)

      expect(result?.config?.headers?.['X-Method-Override']).toBe('DELETE')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBeUndefined()
    })
  })

  describe('保留现有头部', () => {
    it('应该保留现有的请求头', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = {
        method: 'DELETE',
        headers: { 'X-Custom': 'value', 'Content-Type': 'application/json' }
      }

      const result = await plugin.beforeRequest!('/api/users/1', config)

      expect(result?.config?.headers).toMatchObject({
        'X-Custom': 'value',
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'DELETE'
      })
    })
  })

  describe('实际使用场景', () => {
    it('应该能绕过服务器对 DELETE 的限制', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }

      const result = await plugin.beforeRequest!('/api/users/1', config)

      // 服务器会收到 POST 请求，但通过 X-HTTP-Method-Override 知道这是 DELETE
      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('DELETE')
    })

    it('应该能处理复杂的 RESTful API 场景', async () => {
      const plugin = MethodOverridePlugin({ methods: ['PUT', 'PATCH', 'DELETE'] })

      // 更新资源
      const putConfig: RequestConfig = { method: 'PUT', body: { name: 'updated' } }
      const putResult = await plugin.beforeRequest!('/api/users/1', putConfig)
      expect(putResult?.config?.method).toBe('POST')

      // 部分更新资源
      const patchConfig: RequestConfig = { method: 'PATCH', body: { age: 26 } }
      const patchResult = await plugin.beforeRequest!('/api/users/1', patchConfig)
      expect(patchResult?.config?.method).toBe('POST')

      // 删除资源
      const deleteConfig: RequestConfig = { method: 'DELETE' }
      const deleteResult = await plugin.beforeRequest!('/api/users/1', deleteConfig)
      expect(deleteResult?.config?.method).toBe('POST')
    })
  })

  describe('边缘情况', () => {
    it('应该处理未指定方法的情况', async () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = {}
      const result = plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })

    it('应该处理空配置', () => {
      const plugin = MethodOverridePlugin({ methods: [] })

      const config: RequestConfig = { method: 'DELETE' }
      const result = plugin.beforeRequest?.('/api/users/1', config)

      expect(result).toEqual({})
    })
  })
})
