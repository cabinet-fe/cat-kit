import { describe, it, expect } from 'vitest'
import {
  vObject,
  vString,
  vNumber,
  vBoolean,
  vDate,
  vOptional,
  ValidationError
} from '@cat-kit/core/src'

describe('Validator', () => {
  it('object.safeParse 应该返回 success: true 与数据', () => {
    const user = vObject({
      id: vNumber(),
      name: vString(),
      active: vBoolean(),
      createdAt: vDate()
    })

    const input = {
      id: 1,
      name: 'cat',
      active: true,
      createdAt: new Date('2024-01-01')
    }

    const result = user.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(input)
      expect(result.data.createdAt).toBeInstanceOf(Date)
    }
  })

  it('object.safeParse 应该收集字段错误并返回路径', () => {
    const user = vObject({
      id: vNumber(),
      name: vString()
    })

    const result = user.safeParse({ id: '1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.map(i => i.path).sort()).toEqual(['id', 'name'])
    }
  })

  it('optional 应该允许字段缺省并返回 undefined', () => {
    const v = vObject({
      age: vOptional(vNumber())
    })

    const result = v.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.age).toBeUndefined()
    }
  })

  it('optional 默认值应该在 undefined 时生效', () => {
    const v = vObject({
      age: vOptional(vNumber(), { default: 18 })
    })

    const result = v.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.age).toBe(18)
    }
  })

  it('parse 失败时应该抛出 ValidationError', () => {
    const v = vObject({
      id: vNumber()
    })
    expect(() => v.parse({ id: '1' })).toThrow(ValidationError)
  })
})
