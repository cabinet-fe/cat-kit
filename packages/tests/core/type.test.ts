import { describe, it, expect } from 'vitest'
import {
  getDataType,
  isObj,
  isArray,
  isString,
  isNumber,
  isBlob,
  isDate,
  isFunction,
  isBol,
  isFile,
  isFormData,
  isSymbol,
  isPromise,
  isArrayBuffer,
  isUint8Array,
  isUint16Array,
  isUint32Array,
  isInt8Array,
  isInt16Array,
  isInt32Array,
  isNull,
  isUndef,
  isEmpty
} from '@cat-kit/core/src'

describe('类型判断函数', () => {
  describe('getDataType', () => {
    it('应该识别对象', () => {
      expect(getDataType({})).toBe('object')
      expect(getDataType({ a: 1 })).toBe('object')
    })

    it('应该识别数组', () => {
      expect(getDataType([])).toBe('array')
      expect(getDataType([1, 2, 3])).toBe('array')
    })

    it('应该识别字符串', () => {
      expect(getDataType('')).toBe('string')
      expect(getDataType('hello')).toBe('string')
    })

    it('应该识别数字', () => {
      expect(getDataType(0)).toBe('number')
      expect(getDataType(123)).toBe('number')
      expect(getDataType(NaN)).toBe('number')
    })

    it('应该识别布尔值', () => {
      expect(getDataType(true)).toBe('boolean')
      expect(getDataType(false)).toBe('boolean')
    })

    it('应该识别 null', () => {
      expect(getDataType(null)).toBe('null')
    })

    it('应该识别 undefined', () => {
      expect(getDataType(undefined)).toBe('undefined')
    })

    it('应该识别函数', () => {
      expect(getDataType(() => {})).toBe('function')
      expect(getDataType(function() {})).toBe('function')
    })

    it('应该识别 Symbol', () => {
      expect(getDataType(Symbol('test'))).toBe('symbol')
    })

    it('应该识别 Promise', () => {
      expect(getDataType(Promise.resolve())).toBe('promise')
    })

    it('应该识别 Date', () => {
      expect(getDataType(new Date())).toBe('date')
    })
  })

  describe('isObj', () => {
    it('应该识别对象', () => {
      expect(isObj({})).toBe(true)
      expect(isObj({ a: 1 })).toBe(true)
    })

    it('应该排除非对象', () => {
      expect(isObj([])).toBe(false)
      expect(isObj(null)).toBe(false)
      expect(isObj('string')).toBe(false)
      expect(isObj(123)).toBe(false)
    })
  })

  describe('isArray', () => {
    it('应该识别数组', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
    })

    it('应该排除非数组', () => {
      expect(isArray({})).toBe(false)
      expect(isArray('string')).toBe(false)
    })
  })

  describe('isString', () => {
    it('应该识别字符串', () => {
      expect(isString('')).toBe(true)
      expect(isString('hello')).toBe(true)
    })

    it('应该排除非字符串', () => {
      expect(isString(123)).toBe(false)
      expect(isString([])).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('应该识别数字', () => {
      expect(isNumber(0)).toBe(true)
      expect(isNumber(123)).toBe(true)
      expect(isNumber(-456)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
      expect(isNumber(NaN)).toBe(true)
    })

    it('应该排除非数字', () => {
      expect(isNumber('123')).toBe(false)
      expect(isNumber([])).toBe(false)
    })
  })

  describe('isDate', () => {
    it('应该识别 Date', () => {
      expect(isDate(new Date())).toBe(true)
    })

    it('应该排除非 Date', () => {
      expect(isDate('2024-01-01')).toBe(false)
      expect(isDate(123456789)).toBe(false)
    })
  })

  describe('isFunction', () => {
    it('应该识别函数', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(function() {})).toBe(true)
      // async函数被识别为asyncfunction
    })

    it('应该排除非函数', () => {
      expect(isFunction({})).toBe(false)
      expect(isFunction(null)).toBe(false)
    })
  })

  describe('isBol', () => {
    it('应该识别布尔值', () => {
      expect(isBol(true)).toBe(true)
      expect(isBol(false)).toBe(true)
    })

    it('应该排除非布尔值', () => {
      expect(isBol(1)).toBe(false)
      expect(isBol('true')).toBe(false)
      expect(isBol(null)).toBe(false)
    })
  })

  describe('isSymbol', () => {
    it('应该识别 Symbol', () => {
      expect(isSymbol(Symbol())).toBe(true)
      expect(isSymbol(Symbol('test'))).toBe(true)
    })

    it('应该排除非 Symbol', () => {
      expect(isSymbol('symbol')).toBe(false)
      expect(isSymbol({})).toBe(false)
    })
  })

  describe('isPromise', () => {
    it('应该识别 Promise', () => {
      expect(isPromise(Promise.resolve())).toBe(true)
      expect(isPromise(Promise.reject().catch(() => {}))).toBe(true)
      expect(isPromise(new Promise(() => {}))).toBe(true)
    })

    it('应该排除非 Promise', () => {
      expect(isPromise({})).toBe(false)
      expect(isPromise(() => {})).toBe(false)
    })
  })

  describe('isArrayBuffer', () => {
    it('应该识别 ArrayBuffer', () => {
      expect(isArrayBuffer(new ArrayBuffer(8))).toBe(true)
    })

    it('应该排除非 ArrayBuffer', () => {
      expect(isArrayBuffer([])).toBe(false)
      expect(isArrayBuffer(new Uint8Array(8))).toBe(false)
    })
  })

  describe('TypedArray 检测', () => {
    it('应该识别 Uint8Array', () => {
      expect(isUint8Array(new Uint8Array(8))).toBe(true)
      expect(isUint8Array(new Int8Array(8))).toBe(false)
    })

    it('应该识别 Uint16Array', () => {
      expect(isUint16Array(new Uint16Array(8))).toBe(true)
      expect(isUint16Array(new Uint8Array(8))).toBe(false)
    })

    it('应该识别 Uint32Array', () => {
      expect(isUint32Array(new Uint32Array(8))).toBe(true)
      expect(isUint32Array(new Uint16Array(8))).toBe(false)
    })

    it('应该识别 Int8Array', () => {
      expect(isInt8Array(new Int8Array(8))).toBe(true)
      expect(isInt8Array(new Uint8Array(8))).toBe(false)
    })

    it('应该识别 Int16Array', () => {
      expect(isInt16Array(new Int16Array(8))).toBe(true)
      expect(isInt16Array(new Int8Array(8))).toBe(false)
    })

    it('应该识别 Int32Array', () => {
      expect(isInt32Array(new Int32Array(8))).toBe(true)
      expect(isInt32Array(new Int16Array(8))).toBe(false)
    })
  })

  describe('isNull', () => {
    it('应该识别 null', () => {
      expect(isNull(null)).toBe(true)
    })

    it('应该排除非 null', () => {
      expect(isNull(undefined)).toBe(false)
      expect(isNull(0)).toBe(false)
      expect(isNull('')).toBe(false)
      expect(isNull(false)).toBe(false)
    })
  })

  describe('isUndef', () => {
    it('应该识别 undefined', () => {
      expect(isUndef(undefined)).toBe(true)
    })

    it('应该排除非 undefined', () => {
      expect(isUndef(null)).toBe(false)
      expect(isUndef(0)).toBe(false)
      expect(isUndef('')).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('应该识别空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('应该排除非空值', () => {
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty('')).toBe(false)
      expect(isEmpty(false)).toBe(false)
      expect(isEmpty([])).toBe(false)
      expect(isEmpty({})).toBe(false)
    })
  })
})

