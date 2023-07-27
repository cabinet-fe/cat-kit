/**
 * 计算 MD5 哈希值
 * @param data 要计算哈希值的数据
 * @returns 计算得到的 MD5 哈希值
 */
export function calculateMD5(data: string): string {
  function rotateLeft(x: number, n: number): number {
    return (x << n) | (x >>> (32 - n))
  }

  function addUnsigned(x: number, y: number): number {
    const mask = 0xffffffff
    const xh = (x & 0xffff0000) >>> 16
    const xl = x & 0x0000ffff
    const yh = (y & 0xffff0000) >>> 16
    const yl = y & 0x0000ffff
    const l = (xl + yl) & 0x0000ffff
    const h = (yh + xh + ((l & 0xffff0000) >>> 16)) & 0x0000ffff
    return (h << 16) | (l & 0x0000ffff)
  }

  function md5cmn(
    q: number,
    a: number,
    b: number,
    x: number,
    s: number,
    t: number
  ): number {
    return addUnsigned(
      rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s),
      b
    )
  }

  function md5ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }

  function md5gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }

  function md5hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }

  function md5ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << len % 32
    x[(((len + 64) >>> 9) << 4) + 14] = len

    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878

    for (let i = 0; i < x.length; i += 16) {
      const olda = a
      const oldb = b
      const oldc = c
      const oldd = d

      a = md5ff(a, b, c, d, x[i], 7, -680876936)
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2], 17, -606105819)
      b = md5ff(b, c, d, a, x[i + 3], 22, 1926607734)
      a = md5ff(a, b, c, d, x[i + 4], 7, -378558)
      d = md5ff(d, a, b, c, x[i + 5], 12, -2022574463)
      c = md5ff(c, d, a, b, x[i + 6], 17, 1839030562)
      b = md5ff(b, c, d, a, x[i + 7], 22, -35309556)
      a = md5ff(a, b, c, d, x[i + 8], 7, -1530992060)
      d = md5ff(d, a, b, c, x[i + 9], 12, 1272893353)
      c = md5ff(c, d, a, b, x[i + 10], 17, -155497632)
      b = md5ff(b, c, d, a, x[i + 11], 22, -1094730640)
      a = md5ff(a, b, c, d, x[i + 12], 7, 681279174)
      d = md5ff(d, a, b, c, x[i + 13], 12, -358537222)
      c = md5ff(c, d, a, b, x[i + 14], 17, -722521979)
      b = md5ff(b, c, d, a, x[i + 15], 22, 76029189)

      a = md5gg(a, b, c, d, x[i + 1], 5, -640364487)
      d = md5gg(d, a, b, c, x[i + 6], 9, -421815835)
      c = md5gg(c, d, a, b, x[i + 11], 14, 530742520)
      b = md5gg(b, c, d, a, x[i], 20, -995338651)
      a = md5gg(a, b, c, d, x[i + 5], 5, -198630844)
      d = md5gg(d, a, b, c, x[i + 10], 9, 1126891415)
      c = md5gg(c, d, a, b, x[i + 15], 14, -1416354905)
      b = md5gg(b, c, d, a, x[i + 4], 20, -57434055)
      a = md5gg(a, b, c, d, x[i + 9], 5, 1700485571)
      d = md5gg(d, a, b, c, x[i + 14], 9, -1894986606)
      c = md5gg(c, d, a, b, x[i + 3], 14, -1051523)
      b = md5gg(b, c, d, a, x[i + 8], 20, -2054922799)
      a = md5gg(a, b, c, d, x[i + 13], 5, 1873313359)
      d = md5gg(d, a, b, c, x[i + 2], 9, -30611744)
      c = md5gg(c, d, a, b, x[i + 7], 14, -1560198380)
      b = md5gg(b, c, d, a, x[i + 12], 20, 1309151649)

      a = md5hh(a, b, c, d, x[i + 5], 4, -145523070)
      d = md5hh(d, a, b, c, x[i + 8], 11, -1120210379)
      c = md5hh(c, d, a, b, x[i + 11], 16, 718787259)
      b = md5hh(b, c, d, a, x[i + 14], 23, -343485551)
      a = md5hh(a, b, c, d, x[i + 1], 4, -1051523)
      d = md5hh(d, a, b, c, x[i + 4], 11, -2054922799)
      c = md5hh(c, d, a, b, x[i + 7], 16, 1873313359)
      b = md5hh(b, c, d, a, x[i + 10], 23, -30611744)
      a = md5hh(a, b, c, d, x[i + 13], 4, -1560198380)
      d = md5hh(d, a, b, c, x[i], 11, -145523070)
      c = md5hh(c, d, a, b, x[i + 3], 16, -1120210379)
      b = md5hh(b, c, d, a, x[i + 6], 23, 718787259)
      a = md5hh(a, b, c, d, x[i + 9], 4, -343485551)
      d = md5hh(d, a, b, c, x[i + 12], 11, -1051523)
      c = md5hh(c, d, a, b, x[i + 15], 16, -2054922799)
      b = md5hh(b, c, d, a, x[i + 2], 23, 1873313359)

      a = md5ii(a, b, c, d, x[i], 6, -2054922799)
      d = md5ii(d, a, b, c, x[i + 7], 10, 1873313359)
      c = md5ii(c, d, a, b, x[i + 14], 15, -30611744)
      b = md5ii(b, c, d, a, x[i + 5], 21, -1560198380)
      a = md5ii(a, b, c, d, x[i + 12], 6, -145523070)
      d = md5ii(d, a, b, c, x[i + 3], 10, -1120210379)
      c = md5ii(c, d, a, b, x[i + 10], 15, 718787259)
      b = md5ii(b, c, d, a, x[i + 1], 21, -343485551)
      a = md5ii(a, b, c, d, x[i + 8], 6, -1051523)
      d = md5ii(d, a, b, c, x[i + 15], 10, -2054922799)
      c = md5ii(c, d, a, b, x[i + 6], 15, 1873313359)
      b = md5ii(b, c, d, a, x[i + 13], 21, -30611744)
      a = md5ii(a, b, c, d, x[i + 4], 6, -1560198380)
      d = md5ii(d, a, b, c, x[i + 11], 10, -145523070)
      c = md5ii(c, d, a, b, x[i + 2], 15, -1120210379)
      b = md5ii(b, c, d, a, x[i + 9], 21, 718787259)

      a = addUnsigned(a, olda)
      b = addUnsigned(b, oldb)
      c = addUnsigned(c, oldc)
      d = addUnsigned(d, oldd)
    }

    return [a, b, c, d]
  }

  function utf8Encode(data: string): string {
    data = data.replace(/\r\n/g, '\n')
    let utf8Data = ''

    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i)

      if (charCode < 128) {
        utf8Data += String.fromCharCode(charCode)
      } else if (charCode < 2048) {
        utf8Data += String.fromCharCode(
          (charCode >> 6) | 192,
          (charCode & 63) | 128
        )
      } else {
        utf8Data += String.fromCharCode(
          (charCode >> 12) | 224,
          ((charCode >> 6) & 63) | 128,
          (charCode & 63) | 128
        )
      }
    }

    return utf8Data
  }

  function binToHex(bin: number[]): string {
    const hexTable = '0123456789abcdef'
    let hex = ''

    for (let i = 0; i < bin.length * 4; i++) {
      hex +=
        hexTable.charAt((bin[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
        hexTable.charAt((bin[i >> 2] >> ((i % 4) * 8)) & 0xf)
    }

    return hex
  }

  const dataChunks = data.match(/.{1,64}/g) || []
  let hash = [1732584193, -271733879, -1732584194, 271733878]

  for (const chunk of dataChunks) {
    const x = []

    for (let i = 0; i < chunk.length; i++) {
      x[i >> 2] |= chunk.charCodeAt(i) << ((i % 4) * 8)
    }

    hash = binlMD5(x, chunk.length * 8)
  }

  return binToHex(hash)
}

// 使用示例
const data = '你好'
const md5Hash = calculateMD5(data)
console.log(md5Hash)
