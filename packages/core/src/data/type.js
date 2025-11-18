/**
 * 获取值对应的类型字符串
 * @param value 值
 * @returns 类型字符串
 */
export function getDataType(value) {
    return Object.prototype.toString
        .call(value)
        .slice(8, -1)
        .toLowerCase();
}
/**
 * 是否是对象
 * @param value 值
 */
export function isObj(value) {
    return getDataType(value) === 'object';
}
/**
 * 是否是数组
 * @param value 值
 */
export function isArray(value) {
    return getDataType(value) === 'array';
}
/**
 * 是否是字符串
 * @param value 值
 */
export function isString(value) {
    return getDataType(value) === 'string';
}
/**
 * 是否是数字
 * @param value 值
 */
export function isNumber(value) {
    return getDataType(value) === 'number';
}
/**
 * 是否是Blob
 * @param value 值
 */
export function isBlob(value) {
    return getDataType(value) === 'blob';
}
/**
 * 是否是
 * @param value 值
 */
export function isDate(value) {
    return getDataType(value) === 'date';
}
/**
 * 是否是函数
 * @param value 值
 */
export function isFunction(value) {
    return getDataType(value) === 'function';
}
/**
 * 是否是布尔值
 * @param value 值
 */
export function isBol(value) {
    return getDataType(value) === 'boolean';
}
/**
 * 是否是文件
 * @param value 值
 */
export function isFile(value) {
    return getDataType(value) === 'file';
}
/**
 * 是否是表单数据
 * @param value 值
 */
export function isFormData(value) {
    return getDataType(value) === 'formdata';
}
/**
 * 是否是Symbol
 * @param value 值
 */
export function isSymbol(value) {
    return getDataType(value) === 'symbol';
}
/**
 * 是否是Promise
 * @param value 值
 */
export function isPromise(value) {
    return getDataType(value) === 'promise';
}
/**
 * 是否是ArrayBuffer
 * @param value 值
 */
export function isArrayBuffer(value) {
    return value instanceof ArrayBuffer;
}
/**
 * 是否是Uint8Array
 * @param value 值
 */
export function isUint8Array(value) {
    return value instanceof Uint8Array;
}
/**
 * 是否是Uint16Array
 * @param value 值
 */
export function isUint16Array(value) {
    return value instanceof Uint16Array;
}
/**
 * 是否是Uint32Array
 * @param value 值
 */
export function isUint32Array(value) {
    return value instanceof Uint32Array;
}
/**
 * 是否是Int8Array
 * @param value 值
 */
export function isInt8Array(value) {
    return value instanceof Int8Array;
}
/**
 * 是否是Int16Array
 * @param value 值
 */
export function isInt16Array(value) {
    return value instanceof Int16Array;
}
/**
 * 是否是Int32Array
 * @param value 值
 */
export function isInt32Array(value) {
    return value instanceof Int32Array;
}
/**
 * 是否是null
 * @param value 值
 */
export function isNull(value) {
    return value === null;
}
/**
 * 是否是未定义
 * @param value 值
 */
export function isUndef(value) {
    return value === undefined;
}
/**
 * 是否是空值, 当值为null或undefined时返回true
 * @param value 值
 */
export function isEmpty(value) {
    return value === null || value === undefined;
}
