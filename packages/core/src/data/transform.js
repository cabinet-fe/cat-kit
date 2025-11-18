import { isInNode } from '../env/env';
import { isEmpty } from './type';
/**
 * 将字符串转换为 Uint8Array
 * @param data 输入字符串
 * @returns Uint8Array 类型的数据
 * @throws 当环境不支持转换时抛出错误
 */
export function str2u8a(data) {
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(data);
    }
    if (isInNode()) {
        return new Uint8Array(Buffer.from(data, 'utf-8'));
    }
    throw new Error('不支持的转换');
}
/**
 * 将 Uint8Array 转换为字符串
 * @param data Uint8Array 类型的数据
 * @returns 转换后的字符串
 * @throws 当环境不支持转换时抛出错误
 */
export function u8a2str(data) {
    if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder().decode(data);
    }
    if (isInNode()) {
        return Buffer.from(data).toString('utf-8');
    }
    throw new Error('不支持的转换');
}
/**
 * 将 Uint8Array 转换为十六进制字符串
 * @param u8a Uint8Array 类型的数据
 * @returns 十六进制字符串
 */
export function u8a2hex(u8a) {
    return Array.from(u8a)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
/**
 * 将十六进制字符串转换为 Uint8Array
 * @param hex 十六进制字符串
 * @returns Uint8Array 类型的数据
 */
export function hex2u8a(hex) {
    return new Uint8Array(Array.from(hex.match(/.{1,2}/g)).map(b => parseInt(b, 16)));
}
/**
 * 将 Base64 字符串转换为 Uint8Array
 * @param base64 Base64 字符串
 * @returns Uint8Array 类型的数据
 */
export function base642u8a(base64) {
    const binString = atob(base64);
    return new Uint8Array(binString.split('').map(char => char.charCodeAt(0)));
}
/**
 * 将 Uint8Array 转换为 Base64 字符串
 * @param u8a Uint8Array 类型的数据
 * @returns Base64 字符串
 */
export function u8a2base64(u8a) {
    return btoa(String.fromCharCode.apply(null, Array.from(u8a)));
}
/**
 * 将对象转换为 URL 查询字符串
 * @param obj 要转换的对象
 * @returns URL 查询字符串（不包含开头的 ?）
 */
export function obj2query(obj) {
    return Object.entries(obj)
        .map(([key, value]) => {
        const k = encodeURIComponent(key);
        const v = isEmpty(value) ? '' : encodeURIComponent(JSON.stringify(value));
        return `${k}=${v}`;
    })
        .join('&');
}
/**
 * 将 URL 查询字符串转换为对象
 * @param query URL 查询字符串（可以包含开头的 ?）
 * @returns 转换后的对象
 */
export function query2obj(query) {
    query = query.replace(/^\?/, '');
    if (!query)
        return {};
    return Object.fromEntries(query
        .split('&')
        .filter(pair => pair.includes('='))
        .map(pair => {
        const [key = '', value = ''] = pair.split('=');
        return [decodeURIComponent(key), decodeURIComponent(value)];
    }));
}
/**
 * 数据转换
 * @param data 需要转换的原始数据
 * @param transformChain 转换链，按顺序执行
 * @returns 转换后的数据
 */
export function transform(data, transformChain) {
    let val = data;
    transformChain.forEach(method => {
        val = method(val);
    });
    return val;
}
