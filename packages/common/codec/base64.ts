/*
 * @Author: whj
 * @Date: 2022-08-12 14:36:31
 * @LastEditors: whj
 * @LastEditTime: 2023-01-19 17:03:48
 * @FilePath: /cat-kit/packages/common/codec/base64.ts
 *
 */

import { getDataType } from "../data/data-type"

const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const textEncode = (input: string) => textEncoder.encode(input)
const textDecode = (input: BufferSource) => textDecoder.decode(input)


function encodeString(msg: string) {
  const u8a = textEncode(msg)
  const binaryArr = Array.from(u8a).map(n => {
    let binary = n.toFixed(2)
    return '0'.repeat(binary.length) + binary
  })
}

function encode(data: string | number) {
  let type = getDataType(data)

  if (type === 'string') {
    return encodeString(data as string)
  }
  if (type === 'number') {
    data = String(data)
  }
  else if (type === 'array') {
    data
  }
}

function decode() {

}

export default {
  encode,
  decode
}