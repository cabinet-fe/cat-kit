import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { HTTPClient } from '@cat-kit/http/src'

// Mock 全局 fetch
const mockFetch = vi.fn()

// Mock window 对象（模拟浏览器环境）
if (typeof window === 'undefined') {
  (global as any).window = {
    fetch: mockFetch
  }
} else {
  (window as any).fetch = mockFetch
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
      json: async () => ({ message: 'success' }),
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
      const client = new HTTPClient('/api', {
        timeout: 5000,
        headers: { 'X-Custom': 'value' }
      })
      expect(client).toBeInstanceOf(HTTPClient)
    })
  })

  describe('GET 请求', () => {
    it('应该能发送基本的 GET 请求', async () => {
      const client = new HTTPClient()
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })

    it('应该能处理查询参数', async () => {
      const client = new HTTPClient()
      await client.get('/users', {
        query: { name: 'test', age: 25 }
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('?name=test&age=25'),
        expect.any(Object)
      )
    })

    it('应该能合并 URL 中已有的查询参数', async () => {
      const client = new HTTPClient()
      await client.get('/users?id=1', {
        query: { name: 'test' }
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('?id=1&name=test'),
        expect.any(Object)
      )
    })

    it('应该能拼接前缀', async () => {
      const client = new HTTPClient('/api')
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.any(Object)
      )
    })

    it('应该能处理完整的 URL', async () => {
      const client = new HTTPClient('/api')
      await client.get('https://example.com/users')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.any(Object)
      )
    })
  })

  describe('POST 请求', () => {
    it('应该能发送基本的 POST 请求', async () => {
      const client = new HTTPClient()
      const data = { name: 'test', age: 25 }

      await client.post('/users', data)

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      )
    })

    it('应该能发送 FormData', async () => {
      const client = new HTTPClient()
      const formData = new FormData()
      formData.append('name', 'test')

      await client.post('/upload', formData)

      expect(mockFetch).toHaveBeenCalledWith(
        '/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData
        })
      )
    })

    it('应该能添加自定义头部', async () => {
      const client = new HTTPClient()
      await client.post('/users', { name: 'test' }, {
        headers: { 'X-Custom-Header': 'value' }
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'value'
          })
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
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data)
        })
      )
    })
  })

  describe('DELETE 请求', () => {
    it('应该能发送 DELETE 请求', async () => {
      const client = new HTTPClient()
      await client.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/users/1',
        expect.objectContaining({
          method: 'DELETE'
        })
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
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data)
        })
      )
    })
  })

  describe('HEAD 请求', () => {
    it('应该能发送 HEAD 请求', async () => {
      const client = new HTTPClient()
      await client.head('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'HEAD'
        })
      )
    })
  })

  describe('OPTIONS 请求', () => {
    it('应该能发送 OPTIONS 请求', async () => {
      const client = new HTTPClient()
      await client.options('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'OPTIONS'
        })
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

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users/profile',
        expect.any(Object)
      )
    })
  })

  describe('请求配置合并', () => {
    it('应该能合并全局头部和请求头部', async () => {
      const client = new HTTPClient('/api', {
        headers: {
          'X-Global': 'global-value',
          'X-Override': 'global'
        }
      })

      await client.get('/users', {
        headers: {
          'X-Custom': 'custom-value',
          'X-Override': 'local'
        }
      })

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
      const textResponse = await client.get('/data', {
        responseType: 'text'
      })
      expect(textResponse.data).toBeDefined()
    })
  })

  describe('插件系统', () => {
    it('应该能执行 beforeRequest 钩子', async () => {
      const beforeRequest = vi.fn(async (url, config) => {
        return {
          config: {
            ...config,
            headers: {
              ...config.headers,
              'X-Plugin': 'added-by-plugin'
            }
          }
        }
      })

      const client = new HTTPClient('/api', {
        plugins: [{ beforeRequest }]
      })

      await client.get('/users')

      expect(beforeRequest).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Plugin': 'added-by-plugin'
          })
        })
      )
    })

    it('应该能执行 afterRespond 钩子', async () => {
      const afterRespond = vi.fn(async (response) => {
        return {
          ...response,
          data: { ...response.data, modified: true }
        }
      })

      const client = new HTTPClient('/api', {
        plugins: [{ afterRespond }]
      })

      const response = await client.get('/users')

      expect(afterRespond).toHaveBeenCalled()
      expect(response.data).toHaveProperty('modified', true)
    })

    it('应该能按顺序执行多个插件', async () => {
      const order: number[] = []

      const plugin1 = {
        beforeRequest: vi.fn(async () => {
          order.push(1)
          return {}
        })
      }

      const plugin2 = {
        beforeRequest: vi.fn(async () => {
          order.push(2)
          return {}
        })
      }

      const client = new HTTPClient('/api', {
        plugins: [plugin1, plugin2]
      })

      await client.get('/users')

      expect(order).toEqual([1, 2])
    })
  })

  describe('URL 处理', () => {
    it('应该能正确解码 URL', async () => {
      const client = new HTTPClient()
      const encodedUrl = encodeURIComponent('/users/张三')

      await client.get(encodedUrl)

      expect(mockFetch).toHaveBeenCalledWith(
        '/users/张三',
        expect.any(Object)
      )
    })

    it('应该能正确拼接路径', async () => {
      const client = new HTTPClient('/api/')
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.any(Object)
      )
    })
  })
})

