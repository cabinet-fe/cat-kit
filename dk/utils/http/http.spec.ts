import Http from './http'

describe('http测试', () => {
  const http = new Http({
    baseUrl: '/api',
    withCredentials: false,
    before(conf) {
      conf.headers['Authorization'] = 'auth token'
      return conf
    }
  })
  it('test', async () => {
    const defaultConfig = http.getDefaultConfig()

    expect(defaultConfig).toEqual({
      headers: {},
      baseUrl: '/api',
      timeout: 0,
      withCredentials: false
    })
  })

  it('before', async () => {
    let http = new Http({
      before(conf) {
        expect(typeof conf.data).toBe('object')
        expect(conf.data).toEqual({ name: '张三' })
        return conf
      }
    })
    http.post('/test', { name: '张三' })
  })
})
