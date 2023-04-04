import { cacheKey, WebCache } from './cache'

const session = WebCache.create('session')

describe('会话缓存', () => {
  let NAME = cacheKey<string>('name')
  let INFO = cacheKey<{ name: string; age: number; sex: 'male' | 'female' }>(
    'INFO'
  )

  it('set, get方法', () => {
    session.set(NAME, '张三')
    let name = session.get(NAME)

    session.set(INFO, {
      sex: 'male',
      name: '李四',
      age: 24
    })



    let values = session.get([NAME, INFO])

    expect(name).toBe('张三')
    expect(values).toEqual([
      '张三',
      {
        name: '李四',
        age: 24,
        sex: 'male'
      }
    ])
  })

  it('测试有效期', () => {
    let TOKEN = cacheKey<string>('TOKEN')
    session.set(TOKEN, 'my-token', 1)
    setTimeout(() => {
      expect(session.get('token')).toBeNull()
    }, 2)
  })

  it('测试移除', () => {
    session.remove(NAME)
    expect(session.get(NAME)).toBeNull()

    session.remove([INFO])

    expect(session.get([INFO])).toEqual([null])
  })
})
