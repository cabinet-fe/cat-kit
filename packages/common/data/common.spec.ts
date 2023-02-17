import { isEmpty, getChainValue, oneOf, deepCopy, merge, equal, serialize, deserialize } from './common'

describe('通用数据操作测试', () => {
  it('isEmpty', () => {
    expect(isEmpty({})).toBeTruthy()
    expect(isEmpty({ name: '张三' })).toBeFalsy()
  })

  it('getChainValue', () => {
    expect(getChainValue({ school: { name: '清华大学' } }, 'school.name')).toBe('清华大学')
    expect(getChainValue({ school: { name: '清华大学' } }, 'school.address')).toBeUndefined()
  })

  it('oneOf', () => {
    expect(oneOf(2, [1, 3])).toBeFalsy()
    expect(oneOf(2, [1, 2, 3])).toBeTruthy()
  })

  it('deepCopy', () => {
    let origin = { school: { name: '清华大学' } }
    let result = deepCopy(origin)
    expect(result).toEqual(origin)
    expect(origin !== result && origin.school !== result.school).toBeTruthy()
  })

  it('equal', () => {
    let a = { name: '张三' }
    let b = { name: '张三' }
    let c = { name: '张三', id: '1' }
    let d = { name: '李四', id: '1' }

    expect(equal(a, b)).toBeTruthy()
    expect(equal(c, d)).toBeFalsy()
    expect(equal(c, d, 'id')).toBeTruthy()
    expect(equal(c, d, 'name')).toBeFalsy()
  })

  it('merge', () => {
    let baseConf = { name: 'my-config', input: 'src/main.ts', output: { file: 'file.js' } }
    let confA = { plugins: [{ name: '插件A' }], mode: 'dev' }
    let confB = { plugins: [{ name: '插件B' }, { name: '插件C' }], mode: 'prod' }

    expect(merge(baseConf, confA)).toEqual({
      name: 'my-config',
      input: 'src/main.ts',
      output: { file: 'file.js' },
      plugins: [{ name: '插件A' }],
      mode: 'dev'
    })
    expect(merge(baseConf, confB)).toEqual({
      name: 'my-config',
      input: 'src/main.ts',
      output: { file: 'file.js' },
      plugins: [{ name: '插件B' }, { name: '插件C' }],
      mode: 'prod'
    })

    expect(merge(baseConf, confA, confB)).toEqual({
      name: 'my-config',
      input: 'src/main.ts',
      output: { file: 'file.js' },
      plugins: [{ name: '插件A' }, { name: '插件B' }, { name: '插件C' }],
      mode: 'prod'
    })
    expect(merge(baseConf, confB, confA)).toEqual({
      name: 'my-config',
      input: 'src/main.ts',
      output: { file: 'file.js' },
      plugins: [{ name: '插件B' }, { name: '插件C' }, { name: '插件A' }],
      mode: 'dev'
    })
  })


  it('serialize', () => {
    expect(serialize({ a: 1 })).toBe('a=1')
  })

  it('deserialize', () => {
    expect(deserialize('a=1')).toEqual({ a: 1 })
    expect(deserialize('a={"a":1}')).toEqual({ a: { a: 1 } })
    expect(deserialize('a={"a":"1"}')).toEqual({ a: { a: "1" } })
  })
})
