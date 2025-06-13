import { describe, it, expect } from 'vitest'
import { str, $str } from '../src/data/string'

describe('CatString', () => {
  describe('camelCase', () => {
    it('应该将连字符命名转换为小驼峰', () => {
      expect(str('hello-world').camelCase()).toBe('helloWorld')
      expect(str('hello-world-test').camelCase()).toBe('helloWorldTest')
      expect(str('hello_world').camelCase()).toBe('helloWorld')
    })

    it('应该将连字符命名转换为大驼峰', () => {
      expect(str('hello-world').camelCase('upper')).toBe('HelloWorld')
      expect(str('hello-world-test').camelCase('upper')).toBe('HelloWorldTest')
      expect(str('hello_world').camelCase('upper')).toBe('HelloWorld')
    })

    it('应该处理空字符串', () => {
      expect(str('').camelCase()).toBe('')
      expect(str('').camelCase('upper')).toBe('')
    })

    it('应该处理单个单词', () => {
      expect(str('hello').camelCase()).toBe('hello')
      expect(str('hello').camelCase('upper')).toBe('Hello')
    })

    it('应该处理以连字符开头的字符串', () => {
      expect(str('-hello-world').camelCase()).toBe('helloWorld')
      expect(str('-hello-world').camelCase('upper')).toBe('HelloWorld')
    })
  })

  describe('kebabCase', () => {
    it('应该将驼峰命名转换为连字符命名', () => {
      expect(str('helloWorld').kebabCase()).toBe('hello-world')
      expect(str('HelloWorld').kebabCase()).toBe('-hello-world')
      expect(str('helloWorldTest').kebabCase()).toBe('hello-world-test')
    })

    it('应该处理空字符串', () => {
      expect(str('').kebabCase()).toBe('')
    })

    it('应该处理单个单词', () => {
      expect(str('hello').kebabCase()).toBe('hello')
      expect(str('Hello').kebabCase()).toBe('-hello')
    })

    it('应该处理连续大写字母', () => {
      expect(str('XMLHttpRequest').kebabCase()).toBe('-x-m-l-http-request')
    })
  })
})

describe('$str', () => {
  describe('joinUrlPath', () => {
    it('应该拼接简单路径', () => {
      expect($str.joinUrlPath('path', 'to', 'resource')).toBe(
        'path/to/resource'
      )
      expect($str.joinUrlPath('path/', 'to/', 'resource')).toBe(
        'path/to/resource'
      )
    })

    it('应该拼接带协议的URL', () => {
      expect(
        $str.joinUrlPath('https://example.com', 'path', 'to', 'resource')
      ).toBe('https://example.com/path/to/resource')
      expect(
        $str.joinUrlPath('http://example.com/', 'path/', 'to/', 'resource')
      ).toBe('http://example.com/path/to/resource')
    })

    it('应该处理多个连续斜杠', () => {
      expect(
        $str.joinUrlPath(
          'https://example.com///',
          '//path///',
          '//to///',
          'resource'
        )
      ).toBe('https://example.com/path/to/resource')
      expect($str.joinUrlPath('path///', '//to///', 'resource')).toBe(
        'path/to/resource'
      )
    })

    it('应该保留尾部斜杠', () => {
      expect(
        $str.joinUrlPath('https://example.com', 'path', 'to', 'resource/')
      ).toBe('https://example.com/path/to/resource/')
      expect($str.joinUrlPath('path', 'to', 'resource/')).toBe(
        'path/to/resource/'
      )
    })

    it('应该处理FTP协议', () => {
      expect(
        $str.joinUrlPath('ftp://example.com', 'path', 'to', 'resource')
      ).toBe('ftp://example.com/path/to/resource')
    })

    it('应该处理file协议', () => {
      expect($str.joinUrlPath('file:///', 'path', 'to', 'resource')).toBe(
        'file:///path/to/resource'
      )
    })

    it('应该处理单个路径', () => {
      expect($str.joinUrlPath('https://example.com')).toBe(
        'https://example.com'
      )
      expect($str.joinUrlPath('path')).toBe('path')
    })

    it('应该处理空路径', () => {
      expect($str.joinUrlPath('https://example.com', '', 'path')).toBe(
        'https://example.com/path'
      )
    })
  })
})
