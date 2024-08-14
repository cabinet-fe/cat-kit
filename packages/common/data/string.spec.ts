import { str } from './string'

describe('字符串操作方法测试', () => {
  it('驼峰转中划线连接', () => {
    expect(str('aaBbCc').kebabCase()).toBe('aa-bb-cc')
    expect(str('AaBbCc').kebabCase()).toBe('aa-bb-cc')
    expect(str('-AaBbCc').kebabCase()).toBe('-AaBbCc')
    expect(str('-aaBbCc').kebabCase()).toBe('-aaBbCc')
  })

  const ss1 = 'aa-bb-cc'
  it('中划线转驼峰', () => {
    expect(str(ss1).camelCase()).toBe('aaBbCc')
    expect(str(ss1).camelCase('upper')).toBe('AaBbCc')
  })

  it('字符串拼接', () => {
    expect(str.joinPath('/a/', '/b', '/c')).toBe('/a/b/c')
    expect(str.joinPath('/a/', '/b', '/c/', '/d/')).toBe('/a/b/c/d/')
    expect(str.joinPath('a/', '/b', '/c/')).toBe('a/b/c/')
    expect(str.joinPath('/b', '')).toBe('/b')
  })
})
