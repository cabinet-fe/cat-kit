import {
  isArray,
  isArrayBuffer,
  isBlob,
  isBol,
  isDate,
  isFile,
  isFormData,
  isFunction,
  isNumber,
  isObj,
  isPromise,
  isString,
  isSymbol,
  isUndef,
  isNull
} from './data-type'

function test(method: Function, index: number) {
  const data = [
    '',
    {},
    null,
    undefined,
    [],
    1,
    true,
    Symbol(),
    new FormData(),
    new Blob(),
    new Date(),
    new File([], 'name'),
    Promise.resolve(),
    function a() {},
    new ArrayBuffer(10)
  ]
  const result = data.map(item => method(item))
  expect(result[index]).toBeTruthy()
  result.splice(index, 1)
  expect(result.every(v => !v)).toBeTruthy()
}

describe('测试类型检查函数', () => {
  it('是否为字符串', () => {
    test(isString, 0)
  })

  it('是否为对象', () => {
    test(isObj, 1)
  })

  it('是否为null', () => {
    test(isNull, 2)
  })

  it('是否为undefined', () => {
    test(isUndef, 3)
  })

  it('是否为数组', () => {
    test(isArray, 4)
  })

  it('是否为数字', () => {
    test(isNumber, 5)
  })

  it('是否为布尔值', () => {
    test(isBol, 6)
  })

  it('是否为Symbol', () => {
    test(isSymbol, 7)
  })

  it('是否为FormData', () => {
    test(isFormData, 8)
  })

  it('是否为Blob', () => {
    test(isBlob, 9)
  })

  it('是否为日期', () => {
    test(isDate, 10)
  })

  it('是否为文件', () => {
    test(isFile, 11)
  })

  it('是否为Promise', () => {
    test(isPromise, 12)
  })

  it('是否为函数', () => {
    test(isFunction, 13)
  })

  it('是否为ArrayBuffer', () => {
    test(isArrayBuffer, 14)
  })
})
