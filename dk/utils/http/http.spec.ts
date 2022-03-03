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
})
