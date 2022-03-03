type DataType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'blob'
  | 'date'
  | 'undefined'
  | 'function'
  | 'boolean'
  | 'file'
  | 'formdata'
  | 'symbol'
  | 'promise'
  | 'null'

/**
 * 获取值对应的类型字符串
 * @param value 值
 */
export function getDataType(value: any) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase() as DataType
}

/**
 * 是否是对象
 * @param value 值
 */
export function isObj(value: any): value is Record<string, any> {
  return getDataType(value) === 'object'
}

/**
 * 是否是数组
 * @param value 值
 */
export function isArray(value: any): value is Array<any> {
  return getDataType(value) === 'array'
}

/**
 * 是否是字符串
 * @param value 值
 */
export function isString(value: any): value is string {
  return getDataType(value) === 'string'
}

/**
 * 是否是数字
 * @param value 值
 */
export function isNumber(value: any): value is string {
  return getDataType(value) === 'number'
}

/**
 * 是否是Blob流
 * @param value 值
 */
export function isBlob(value: any): value is Blob {
  return getDataType(value) === 'blob'
}

/**
 * 是否是
 * @param value 值
 */
export function isDate(value: any): value is Date {
  return getDataType(value) === 'date'
}

/**
 * 是否是未定义
 * @param value 值
 */
export function isUndef(value: any): value is undefined {
  return value === undefined
}

/**
 * 是否是函数
 * @param value 值
 */
export function isFunction(value: any): value is Function {
  return getDataType(value) === 'function'
}

/**
 * 是否是布尔值
 * @param value 值
 */
export function isBol(value: any): value is boolean {
  return getDataType(value) === 'boolean'
}

/**
 * 是否是文件
 * @param value 值
 */
export function isFile(value: any): value is File {
  return getDataType(value) === 'file'
}

/**
 * 是否是表单数据
 * @param value 值
 */
export function isFormData(value: any): value is FormData {
  return getDataType(value) === 'formdata'
}

/**
 * 是否是Symbol
 * @param value 值
 */
export function isSymbol(value: any): value is symbol {
  return getDataType(value) === 'symbol'
}

/**
 * 是否是Promise
 * @param value 值
 */
export function isPromise(value: any): value is Promise<any> {
  return getDataType(value) === 'promise'
}

/**
 * 是否是ArrayBuffer
 * @param value 值
 */
export function isArrayBuffer(value: any): value  is ArrayBuffer {
  return value instanceof ArrayBuffer
}

/**
 * 是否是Uint8Array
 * @param value 值
 */
export function isUint8Array(value: any): value is Uint8Array {
  return value instanceof Uint8Array
}

/**
 * 是否是Uint16Array
 * @param value 值
 */
export function isUint16Array(value: any): value is Uint16Array {
  return value instanceof Uint16Array
}

/**
 * 是否是Uint32Array
 * @param value 值
 */
export function isUint32Array(value: any): value is Uint32Array {
  return value instanceof Uint32Array
}

/**
 * 是否是Int8Array
 * @param value 值
 */
export function isInt8Array(value: any): value is Int8Array {
  return value instanceof Int8Array
}

/**
 * 是否是Int16Array
 * @param value 值
 */
export function isInt16Array(value: any): value is Int16Array {
  return value instanceof Int16Array
}

/**
 * 是否是Int32Array
 * @param value 值
 */
export function isInt32Array(value: any): value is Int32Array {
  return value instanceof Int32Array
}

/**
 * 是否是null
 * @param value 值
 */
 export function isNull(value: any): value is null {
  return value === null
}