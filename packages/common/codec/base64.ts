/*
 * @Author: whj
 * @Date: 2022-08-12 14:36:31
 * @LastEditors: whj
 * @LastEditTime: 2023-01-29 11:29:06
 * @FilePath: /cat-kit/packages/common/codec/base64.ts
 *
 */
import { getDataType } from '../data/data-type'

/** 字符映射表 */
const table =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const textEncode = (input: string) => textEncoder.encode(input)
const textDecode = (input: BufferSource) => textDecoder.decode(input)

function stringGroup(s: string, itemLen: number): string[] {
  let i = 0,
    sLen = s.length
  let result: string[] = []
  while (i < sLen) {
    result.push(s.slice(i, i + itemLen))
    i += itemLen
  }
  return result
}

function encodeArray(arr: Uint8Array) {
   // 生成二进制数组
   const binaryArr = Array.from(arr).map(n => {
    let binary = n.toString(2)
    return '0'.repeat(8 - binary.length) + binary
  })


  const binaryGroup: string[] = []
  // 三个字节为一组分组
  let i = 0,
    bLen = binaryArr.length
  while (i < bLen) {
    binaryGroup.push(
      binaryArr[i] + (binaryArr[i + 1] ?? '') + (binaryArr[i + 2] ?? '')
    )
    i += 3
  }

  let result = ''
  const padding = '0'
  const lastGroupItem = binaryGroup.pop()
  // 每组分成4组
  binaryGroup.forEach(groupItem => {
    stringGroup(groupItem, 6).forEach(item => {

      result += table[parseInt(padding.repeat(2) + item, 2)]
    })
  })

  if (!lastGroupItem) return result

  stringGroup(lastGroupItem, 6).forEach(item => {
    let s = padding.repeat(2) + item
    s += padding.repeat(8 - s.length)
    result += table[parseInt(s, 2)]
  })

  if (lastGroupItem.length === 8) {
    result += '=='
  } else if (lastGroupItem.length === 16) {
    result += '='
  }

  return result
}

function encodeString(msg: string) {
  return encodeArray(textEncode(msg))
}

/**
 * base编码
 * @param data 原始数据
 * @returns
 */
function encode(data: string | number): string
function encode(data: Blob): Promise<string>
function encode(data: string | number | Blob): string | Promise<string> {
  let type = getDataType(data)

  if (type === 'string') {
    return encodeString(data as string)
  }
  if (type === 'number') {
    return encodeString(String(data))
  }
  if (type === 'blob') {
    return (data as Blob).arrayBuffer().then(buf => {
      return encodeArray(new Uint8Array(buf))
    })
  }
  throw new Error('data类型错误')
}

function decode(encodedStr: string): string {
  let groups = stringGroup(encodedStr, 4).map(s => {
    return s.slice()
  })

  return ''
}

export default {
  encode,
  decode
}
