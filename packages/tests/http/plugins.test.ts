import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TokenPlugin, MethodOverridePlugin } from '@cat-kit/http/src'
import type { RequestConfig } from '@cat-kit/http/src'

describe('TokenPlugin', () => {
  describe('基本功能', () => {
    it('应该能创建 Token 插件', () => {
      const plugin = TokenPlugin({
        getter: () => 'test-token'
      })

      expect(plugin).toHaveProperty('beforeRequest')
      expect(typeof plugin.beforeRequest).toBe('function')
    })

    it('应该能添加 Bearer token', async () => {
      const plugin = TokenPlugin({
        getter: () => 'test-token',
        authType: 'Bearer'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result).toBeDefined()
      expect(result?.config?.headers).toBeDefined()
      expect(result?.config?.headers?.['Authorization']).toBe('Bearer')
    })

    it('应该支持异步 getter', async () => {
      const plugin = TokenPlugin({
        getter: async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'async-token'
        },
        authType: 'Bearer'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer')
    })

    it('当 getter 返回 null 时不应添加 token', async () => {
      const plugin = TokenPlugin({
        getter: () => null
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })

    it('当 getter 返回 undefined 时不应添加 token', async () => {
      const plugin = TokenPlugin({
        getter: () => undefined
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })
  })

  describe('授权类型', () => {
    it('应该支持 Bearer 授权', async () => {
      const plugin = TokenPlugin({
        getter: () => 'my-token',
        authType: 'Bearer'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer')
    })

    it('应该支持 Basic 授权', async () => {
      const plugin = TokenPlugin({
        getter: () => 'my-token',
        authType: 'Basic'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Basic')
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

      expect(result?.config?.headers?.['X-Auth-Token']).toBe('Bearer')
      expect(result?.config?.headers?.['Authorization']).toBeUndefined()
    })
  })

  describe('保留现有头部', () => {
    it('应该保留现有的请求头', async () => {
      const plugin = TokenPlugin({
        getter: () => 'test-token',
        authType: 'Bearer'
      })

      const config: RequestConfig = {
        method: 'GET',
        headers: {
          'X-Custom': 'value',
          'Content-Type': 'application/json'
        }
      }

      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers).toMatchObject({
        'X-Custom': 'value',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer'
      })
    })
  })

  describe('实际使用场景', () => {
    it('应该能模拟从 localStorage 获取 token', async () => {
      // 模拟 localStorage
      const storage: Record<string, string> = { token: 'stored-token' }

      const plugin = TokenPlugin({
        getter: () => storage.token,
        authType: 'Bearer'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer')
    })

    it('应该能模拟从异步 API 获取 token', async () => {
      const getTokenFromAPI = async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'api-token'
      }

      const plugin = TokenPlugin({
        getter: getTokenFromAPI,
        authType: 'Bearer'
      })

      const config: RequestConfig = { method: 'GET' }
      const result = await plugin.beforeRequest?.('/api/users', config)

      expect(result?.config?.headers?.['Authorization']).toBe('Bearer')
    })
  })
})

describe('MethodOverridePlugin', () => {
  describe('基本功能', () => {
    it('应该能创建方法重写插件', () => {
      const plugin = MethodOverridePlugin()

      expect(plugin).toHaveProperty('beforeRequest')
      expect(typeof plugin.beforeRequest).toBe('function')
    })

    it('应该重写 DELETE 方法', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'DELETE' }
      const result = plugin.beforeRequest?.('/api/users/1', config)

      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('DELETE')
    })

    it('应该重写 PUT 方法', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'PUT' }
      const result = plugin.beforeRequest?.('/api/users/1', config)

      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('PUT')
    })

    it('应该重写 PATCH 方法', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'PATCH' }
      const result = plugin.beforeRequest?.('/api/users/1', config)

      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('PATCH')
    })

    it('不应该重写 GET 方法', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'GET' }
      const result = plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })

    it('不应该重写 POST 方法', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = { method: 'POST' }
      const result = plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })
  })

  describe('自定义配置', () => {
    it('应该能自定义需要重写的方法', () => {
      const plugin = MethodOverridePlugin({
        methods: ['DELETE']
      })

      const deleteConfig: RequestConfig = { method: 'DELETE' }
      const deleteResult = plugin.beforeRequest?.('/api/users/1', deleteConfig)
      expect(deleteResult?.config?.method).toBe('POST')

      const putConfig: RequestConfig = { method: 'PUT' }
      const putResult = plugin.beforeRequest?.('/api/users/1', putConfig)
      expect(putResult).toEqual({})
    })

    it('应该能自定义重写后的方法', () => {
      const plugin = MethodOverridePlugin({
        overrideMethod: 'GET'
      })

      const config: RequestConfig = { method: 'DELETE' }
      const result = plugin.beforeRequest?.('/api/users/1', config)

      expect(result?.config?.method).toBe('GET')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('DELETE')
    })
  })

  describe('保留现有头部', () => {
    it('应该保留现有的请求头', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = {
        method: 'DELETE',
        headers: {
          'X-Custom': 'value',
          'Content-Type': 'application/json'
        }
      }

      const result = plugin.beforeRequest?.('/api/users/1', config)

      expect(result?.config?.headers).toMatchObject({
        'X-Custom': 'value',
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'DELETE'
      })
    })
  })

  describe('实际使用场景', () => {
    it('应该能绕过服务器对 DELETE 的限制', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }

      const result = plugin.beforeRequest?.('/api/users/1', config)

      // 服务器会收到 POST 请求，但通过 X-HTTP-Method-Override 知道这是 DELETE
      expect(result?.config?.method).toBe('POST')
      expect(result?.config?.headers?.['X-HTTP-Method-Override']).toBe('DELETE')
    })

    it('应该能处理复杂的 RESTful API 场景', () => {
      const plugin = MethodOverridePlugin({
        methods: ['PUT', 'PATCH', 'DELETE']
      })

      // 更新资源
      const putConfig: RequestConfig = {
        method: 'PUT',
        body: { name: 'updated' }
      }
      const putResult = plugin.beforeRequest?.('/api/users/1', putConfig)
      expect(putResult?.config?.method).toBe('POST')

      // 部分更新资源
      const patchConfig: RequestConfig = {
        method: 'PATCH',
        body: { age: 26 }
      }
      const patchResult = plugin.beforeRequest?.('/api/users/1', patchConfig)
      expect(patchResult?.config?.method).toBe('POST')

      // 删除资源
      const deleteConfig: RequestConfig = { method: 'DELETE' }
      const deleteResult = plugin.beforeRequest?.('/api/users/1', deleteConfig)
      expect(deleteResult?.config?.method).toBe('POST')
    })
  })

  describe('边缘情况', () => {
    it('应该处理未指定方法的情况', () => {
      const plugin = MethodOverridePlugin()

      const config: RequestConfig = {}
      const result = plugin.beforeRequest?.('/api/users', config)

      expect(result).toEqual({})
    })

    it('应该处理空配置', () => {
      const plugin = MethodOverridePlugin({
        methods: []
      })

      const config: RequestConfig = { method: 'DELETE' }
      const result = plugin.beforeRequest?.('/api/users/1', config)

      expect(result).toEqual({})
    })
  })
})

