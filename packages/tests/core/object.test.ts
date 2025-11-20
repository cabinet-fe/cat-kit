import { describe, it, expect, vi } from 'vitest'
import { o } from '@cat-kit/core/src'

describe('对象工具函数', () => {
  describe('o() - CatObject', () => {
    describe('keys', () => {
      it('应该返回对象的所有键', () => {
        const obj = { a: 1, b: 2, c: 3 }
        expect(o(obj).keys()).toEqual(['a', 'b', 'c'])
      })

      it('应该处理空对象', () => {
        expect(o({}).keys()).toEqual([])
      })
    })

    describe('each', () => {
      it('应该遍历对象的所有键值对', () => {
        const obj = { a: 1, b: 2, c: 3 }
        const result: [string, number][] = []

        o(obj).each((key, value) => {
          result.push([key, value])
        })

        expect(result).toEqual([
          ['a', 1],
          ['b', 2],
          ['c', 3]
        ])
      })

      it('应该返回自身以支持链式调用', () => {
        const obj = { a: 1 }
        const wrapped = o(obj)
        const returned = wrapped.each(() => {})
        expect(returned).toBe(wrapped)
      })
    })

    describe('pick', () => {
      it('应该挑选指定的键', () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 }
        const picked = o(obj).pick(['a', 'c'])

        expect(picked).toEqual({ a: 1, c: 3 })
      })

      it('应该忽略不存在的键', () => {
        const obj = { a: 1, b: 2 }
        const picked = o(obj).pick(['a', 'c'] as any[])

        expect(picked).toEqual({ a: 1, c: undefined })
      })

      it('应该返回新对象', () => {
        const obj = { a: 1, b: 2 }
        const picked = o(obj).pick(['a'])

        picked.a = 999
        expect(obj.a).toBe(1)
      })
    })

    describe('omit', () => {
      it('应该忽略指定的键', () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 }
        const omitted = o(obj).omit(['b', 'd'])

        expect(omitted).toEqual({ a: 1, c: 3 })
      })

      it('应该返回新对象', () => {
        const obj = { a: 1, b: 2 }
        const omitted = o(obj).omit(['b'])

        omitted.a = 999
        expect(obj.a).toBe(1)
      })
    })

    describe('extend', () => {
      it('应该从源对象继承存在的属性', () => {
        const obj = { a: 1, b: 2 }
        const source = { a: 10, b: 20, c: 30 }

        o(obj).extend(source)

        expect(obj).toEqual({ a: 10, b: 20 })
      })

      it('应该跳过空值', () => {
        const obj = { a: 1, b: 2 }
        const source = { a: null, b: 20 }

        o(obj).extend(source)

        expect(obj).toEqual({ a: 1, b: 20 })
      })

      it('应该支持数组形式的多个源对象', () => {
        const obj = { a: 1, b: 2, c: 3 }

        o(obj).extend([{ a: 10 }, { b: 20 }, { c: 30 }])

        expect(obj).toEqual({ a: 10, b: 20, c: 30 })
      })

      it('应该警告类型不一致', () => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {})

        const obj = { a: 1 }
        const source = { a: '10' }

        o(obj).extend(source)

        expect(consoleWarnSpy).toHaveBeenCalledWith('a类型不一致')
        expect(obj.a).toBe(1)

        consoleWarnSpy.mockRestore()
      })

      it('应该填充原本为空的属性', () => {
        const obj = { a: null, b: undefined }
        const source = { a: 10, b: 20 }

        o(obj).extend(source)

        expect(obj).toEqual({ a: 10, b: 20 })
      })
    })

    describe('deepExtend', () => {
      it('应该深度继承嵌套对象', () => {
        const obj = {
          a: 1,
          b: {
            c: 2,
            d: 3
          }
        }
        const source = {
          a: 10,
          b: {
            c: 20
          }
        }

        o(obj).deepExtend(source)

        expect(obj).toEqual({
          a: 10,
          b: {
            c: 20,
            d: 3
          }
        })
      })

      it('应该支持数组形式的多个源对象', () => {
        const obj = {
          a: 1,
          b: { c: 2 }
        }

        o(obj).deepExtend([{ a: 10 }, { b: { c: 20 } }])

        expect(obj).toEqual({
          a: 10,
          b: { c: 20 }
        })
      })

      it('应该警告类型不一致', () => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {})

        const obj = { a: { b: 1 } }
        const source = { a: '10' }

        o(obj).deepExtend(source)

        expect(consoleWarnSpy).toHaveBeenCalledWith('a类型不一致')

        consoleWarnSpy.mockRestore()
      })
    })

    describe('copy', () => {
      it('应该创建对象的深拷贝', () => {
        const obj = {
          a: 1,
          b: {
            c: 2,
            d: [3, 4, 5]
          }
        }

        const copied = o(obj).copy()

        expect(copied).toEqual(obj)
        expect(copied).not.toBe(obj)
        expect(copied.b).not.toBe(obj.b)
      })

      it('修改拷贝不应该影响原对象', () => {
        const obj = { a: 1, b: { c: 2 } }
        const copied = o(obj).copy()

        copied.a = 999
        copied.b.c = 999

        expect(obj.a).toBe(1)
        expect(obj.b.c).toBe(2)
      })

      it('应该忽略函数', () => {
        const obj = {
          a: 1,
          fn: () => 'test'
        }

        const copied = o(obj).copy()

        expect(copied.a).toBe(1)
        expect(copied.fn).toBeUndefined()
      })
    })

    describe('merge', () => {
      it('应该合并对象', () => {
        const obj = { a: 1, b: 2 }
        const source = { b: 20, c: 30 }

        o(obj).merge(source)

        expect(obj).toEqual({ a: 1, b: 20, c: 30 })
      })

      it('应该深度合并嵌套对象', () => {
        const obj = {
          a: 1,
          b: {
            c: 2,
            d: 3
          }
        }
        const source = {
          b: {
            d: 30,
            e: 40
          },
          f: 50
        }

        o(obj).merge(source)

        expect(obj).toEqual({
          a: 1,
          b: {
            c: 2,
            d: 30,
            e: 40
          },
          f: 50
        })
      })

      it('应该支持数组形式的多个源对象', () => {
        const obj = { a: 1 }

        o(obj).merge([{ b: 2 }, { c: 3 }])

        expect(obj).toEqual({ a: 1, b: 2, c: 3 })
      })

      it('应该跳过空值', () => {
        const obj = { a: 1, b: 2 }
        const source = { a: null, c: 3 }

        o(obj).merge(source)

        expect(obj).toEqual({ a: 1, b: 2, c: 3 })
      })

      it('应该覆盖类型不一致的值', () => {
        const obj = { a: 1 }
        const source = { a: '10' }

        o(obj).merge(source)

        expect(obj.a).toBe('10')
      })
    })

    describe('get', () => {
      it('应该获取简单属性', () => {
        const obj = { a: 1, b: 2 }

        expect(o(obj).get('a')).toBe(1)
        expect(o(obj).get('b')).toBe(2)
      })

      it('应该支持链式属性访问', () => {
        const obj = {
          a: {
            b: {
              c: 'value'
            }
          }
        }

        expect(o(obj).get('a.b.c')).toBe('value')
      })
    })

    describe('set', () => {
      it('应该设置简单属性', () => {
        const obj = { a: 1 }

        o(obj).set('a', 10)

        expect(obj.a).toBe(10)
      })

      it('应该支持链式属性设置', () => {
        const obj: any = {}

        o(obj).set('a.b.c', 'value')

        expect(obj.a.b.c).toBe('value')
      })

      it('应该自动创建不存在的中间对象', () => {
        const obj: any = {}

        o(obj).set('x.y.z', 123)

        expect(obj).toEqual({
          x: {
            y: {
              z: 123
            }
          }
        })
      })

      it('应该返回设置值的父对象', () => {
        const obj: any = {}

        const parent = o(obj).set('a.b.c', 'value')

        expect(parent).toEqual({ c: 'value' })
        expect(parent).toBe(obj.a.b)
      })
    })
  })
})
