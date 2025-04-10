import { describe, expect, test } from 'bun:test'
import { str } from '../../../src/data/string'

describe('字符串工具函数测试', () => {
  describe('str', () => {
    test('应该返回一个CatString实例', () => {
      const result = str('test')
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })

  describe('camelCase', () => {
    test('应该将连字符分隔的字符串转换为小驼峰式(lowerCamelCase)', () => {
      expect(str('hello-world').camelCase()).toBe('helloWorld')
      expect(str('foo-bar').camelCase()).toBe('fooBar')
      expect(str('some_var').camelCase()).toBe('someVar')
    })

    test('应该将连字符分隔的字符串转换为大驼峰式(UpperCamelCase)', () => {
      expect(str('hello-world').camelCase('upper')).toBe('HelloWorld')
      expect(str('foo-bar').camelCase('upper')).toBe('FooBar')
      expect(str('some_var').camelCase('upper')).toBe('SomeVar')
    })

    test('应该处理开头有连字符的情况', () => {
      // 小驼峰
      expect(str('-hello').camelCase()).toBe('hello')
      expect(str('_world').camelCase()).toBe('world')

      // 大驼峰
      expect(str('-hello').camelCase('upper')).toBe('Hello')
      expect(str('_world').camelCase('upper')).toBe('World')
    })

    test('应该正确处理已经是驼峰式的字符串', () => {
      // 小驼峰
      expect(str('alreadyCamel').camelCase()).toBe('alreadyCamel')

      // 大驼峰
      expect(str('AlreadyCamel').camelCase('upper')).toBe('AlreadyCamel')
      expect(str('alreadyCamel').camelCase('upper')).toBe('AlreadyCamel')
    })
  })

  describe('kebabCase', () => {
    test('应该将驼峰式字符串转换为连字符分隔', () => {
      expect(str('helloWorld').kebabCase()).toBe('hello-world')
      expect(str('fooBar').kebabCase()).toBe('foo-bar')
    })

    test('应该将大写字母全部转为小写并添加连字符', () => {
      expect(str('HelloWorld').kebabCase()).toBe('hello-world')
      expect(str('FOOBar').kebabCase()).toBe('f-o-o-bar')
    })

    test('应该处理已经有连字符的字符串', () => {
      expect(str('already-kebab').kebabCase()).toBe('already-kebab')
    })
  })
})
