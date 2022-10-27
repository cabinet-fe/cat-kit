import { pick, omit, objEach, objMap } from './object'

describe('对象操作方法测试', () => {
  const originObject = {
    name: '张三',
    age: 20,
    school: {
      name: '清华大学',
      address: '北京市'
    }
  }
  it('pick方法', () => {
    let obj = pick(originObject, ['name', 'school'])
    expect(obj).toEqual({
      name: '张三',
      school: {
        name: '清华大学',
        address: '北京市'
      }
    })

    expect(originObject.school === obj.school).toBe(true)
  })

  it('omit方法', () => {
    let obj = omit(originObject, ['name', 'age'])
    expect(obj).toEqual({
      school: {
        name: '清华大学',
        address: '北京市'
      }
    })
    expect(originObject.school === obj.school).toBe(true)
  })

  it('objEach方法', () => {
    let result: any[] = []
    objEach(originObject, (v, k) => {
      result.push({
        key: k,
        value: v
      })
    })
    expect(result).toEqual([
      { key: 'name', value: '张三' },
      { key: 'age', value: 20 },
      {
        key: 'school',
        value: {
          name: '清华大学',
          address: '北京市'
        }
      }
    ])
  })

  it('objMap方法', () => {
    let result = objMap(originObject, (v, k) => {
      return k
    })
    expect(result).toEqual({
      name: 'name',
      age: 'age',
      school: 'school'
    })
  })
})
