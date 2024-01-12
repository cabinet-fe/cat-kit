import { readFile } from '@cat-kit/fe'
import { encodeUTF8ToU8A, hex } from './shared/helper'

type _Hash = [number, number, number, number]

/** refer: spark-md5 */
function concatArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
  const result = new Uint8Array(buffer1.byteLength + buffer2.byteLength)

  result.set(new Uint8Array(buffer1))
  result.set(new Uint8Array(buffer2), buffer1.byteLength)

  return result
}

function md5cycle(x: _Hash, k: any[]) {
  let a = x[0],
    b = x[1],
    c = x[2],
    d = x[3]

  a += (((b & c) | (~b & d)) + k[0] - 680876936) | 0
  a = (((a << 7) | (a >>> 25)) + b) | 0
  d += (((a & b) | (~a & c)) + k[1] - 389564586) | 0
  d = (((d << 12) | (d >>> 20)) + a) | 0
  c += (((d & a) | (~d & b)) + k[2] + 606105819) | 0
  c = (((c << 17) | (c >>> 15)) + d) | 0
  b += (((c & d) | (~c & a)) + k[3] - 1044525330) | 0
  b = (((b << 22) | (b >>> 10)) + c) | 0
  a += (((b & c) | (~b & d)) + k[4] - 176418897) | 0
  a = (((a << 7) | (a >>> 25)) + b) | 0
  d += (((a & b) | (~a & c)) + k[5] + 1200080426) | 0
  d = (((d << 12) | (d >>> 20)) + a) | 0
  c += (((d & a) | (~d & b)) + k[6] - 1473231341) | 0
  c = (((c << 17) | (c >>> 15)) + d) | 0
  b += (((c & d) | (~c & a)) + k[7] - 45705983) | 0
  b = (((b << 22) | (b >>> 10)) + c) | 0
  a += (((b & c) | (~b & d)) + k[8] + 1770035416) | 0
  a = (((a << 7) | (a >>> 25)) + b) | 0
  d += (((a & b) | (~a & c)) + k[9] - 1958414417) | 0
  d = (((d << 12) | (d >>> 20)) + a) | 0
  c += (((d & a) | (~d & b)) + k[10] - 42063) | 0
  c = (((c << 17) | (c >>> 15)) + d) | 0
  b += (((c & d) | (~c & a)) + k[11] - 1990404162) | 0
  b = (((b << 22) | (b >>> 10)) + c) | 0
  a += (((b & c) | (~b & d)) + k[12] + 1804603682) | 0
  a = (((a << 7) | (a >>> 25)) + b) | 0
  d += (((a & b) | (~a & c)) + k[13] - 40341101) | 0
  d = (((d << 12) | (d >>> 20)) + a) | 0
  c += (((d & a) | (~d & b)) + k[14] - 1502002290) | 0
  c = (((c << 17) | (c >>> 15)) + d) | 0
  b += (((c & d) | (~c & a)) + k[15] + 1236535329) | 0
  b = (((b << 22) | (b >>> 10)) + c) | 0

  a += (((b & d) | (c & ~d)) + k[1] - 165796510) | 0
  a = (((a << 5) | (a >>> 27)) + b) | 0
  d += (((a & c) | (b & ~c)) + k[6] - 1069501632) | 0
  d = (((d << 9) | (d >>> 23)) + a) | 0
  c += (((d & b) | (a & ~b)) + k[11] + 643717713) | 0
  c = (((c << 14) | (c >>> 18)) + d) | 0
  b += (((c & a) | (d & ~a)) + k[0] - 373897302) | 0
  b = (((b << 20) | (b >>> 12)) + c) | 0
  a += (((b & d) | (c & ~d)) + k[5] - 701558691) | 0
  a = (((a << 5) | (a >>> 27)) + b) | 0
  d += (((a & c) | (b & ~c)) + k[10] + 38016083) | 0
  d = (((d << 9) | (d >>> 23)) + a) | 0
  c += (((d & b) | (a & ~b)) + k[15] - 660478335) | 0
  c = (((c << 14) | (c >>> 18)) + d) | 0
  b += (((c & a) | (d & ~a)) + k[4] - 405537848) | 0
  b = (((b << 20) | (b >>> 12)) + c) | 0
  a += (((b & d) | (c & ~d)) + k[9] + 568446438) | 0
  a = (((a << 5) | (a >>> 27)) + b) | 0
  d += (((a & c) | (b & ~c)) + k[14] - 1019803690) | 0
  d = (((d << 9) | (d >>> 23)) + a) | 0
  c += (((d & b) | (a & ~b)) + k[3] - 187363961) | 0
  c = (((c << 14) | (c >>> 18)) + d) | 0
  b += (((c & a) | (d & ~a)) + k[8] + 1163531501) | 0
  b = (((b << 20) | (b >>> 12)) + c) | 0
  a += (((b & d) | (c & ~d)) + k[13] - 1444681467) | 0
  a = (((a << 5) | (a >>> 27)) + b) | 0
  d += (((a & c) | (b & ~c)) + k[2] - 51403784) | 0
  d = (((d << 9) | (d >>> 23)) + a) | 0
  c += (((d & b) | (a & ~b)) + k[7] + 1735328473) | 0
  c = (((c << 14) | (c >>> 18)) + d) | 0
  b += (((c & a) | (d & ~a)) + k[12] - 1926607734) | 0
  b = (((b << 20) | (b >>> 12)) + c) | 0

  a += ((b ^ c ^ d) + k[5] - 378558) | 0
  a = (((a << 4) | (a >>> 28)) + b) | 0
  d += ((a ^ b ^ c) + k[8] - 2022574463) | 0
  d = (((d << 11) | (d >>> 21)) + a) | 0
  c += ((d ^ a ^ b) + k[11] + 1839030562) | 0
  c = (((c << 16) | (c >>> 16)) + d) | 0
  b += ((c ^ d ^ a) + k[14] - 35309556) | 0
  b = (((b << 23) | (b >>> 9)) + c) | 0
  a += ((b ^ c ^ d) + k[1] - 1530992060) | 0
  a = (((a << 4) | (a >>> 28)) + b) | 0
  d += ((a ^ b ^ c) + k[4] + 1272893353) | 0
  d = (((d << 11) | (d >>> 21)) + a) | 0
  c += ((d ^ a ^ b) + k[7] - 155497632) | 0
  c = (((c << 16) | (c >>> 16)) + d) | 0
  b += ((c ^ d ^ a) + k[10] - 1094730640) | 0
  b = (((b << 23) | (b >>> 9)) + c) | 0
  a += ((b ^ c ^ d) + k[13] + 681279174) | 0
  a = (((a << 4) | (a >>> 28)) + b) | 0
  d += ((a ^ b ^ c) + k[0] - 358537222) | 0
  d = (((d << 11) | (d >>> 21)) + a) | 0
  c += ((d ^ a ^ b) + k[3] - 722521979) | 0
  c = (((c << 16) | (c >>> 16)) + d) | 0
  b += ((c ^ d ^ a) + k[6] + 76029189) | 0
  b = (((b << 23) | (b >>> 9)) + c) | 0
  a += ((b ^ c ^ d) + k[9] - 640364487) | 0
  a = (((a << 4) | (a >>> 28)) + b) | 0
  d += ((a ^ b ^ c) + k[12] - 421815835) | 0
  d = (((d << 11) | (d >>> 21)) + a) | 0
  c += ((d ^ a ^ b) + k[15] + 530742520) | 0
  c = (((c << 16) | (c >>> 16)) + d) | 0
  b += ((c ^ d ^ a) + k[2] - 995338651) | 0
  b = (((b << 23) | (b >>> 9)) + c) | 0

  a += ((c ^ (b | ~d)) + k[0] - 198630844) | 0
  a = (((a << 6) | (a >>> 26)) + b) | 0
  d += ((b ^ (a | ~c)) + k[7] + 1126891415) | 0
  d = (((d << 10) | (d >>> 22)) + a) | 0
  c += ((a ^ (d | ~b)) + k[14] - 1416354905) | 0
  c = (((c << 15) | (c >>> 17)) + d) | 0
  b += ((d ^ (c | ~a)) + k[5] - 57434055) | 0
  b = (((b << 21) | (b >>> 11)) + c) | 0
  a += ((c ^ (b | ~d)) + k[12] + 1700485571) | 0
  a = (((a << 6) | (a >>> 26)) + b) | 0
  d += ((b ^ (a | ~c)) + k[3] - 1894986606) | 0
  d = (((d << 10) | (d >>> 22)) + a) | 0
  c += ((a ^ (d | ~b)) + k[10] - 1051523) | 0
  c = (((c << 15) | (c >>> 17)) + d) | 0
  b += ((d ^ (c | ~a)) + k[1] - 2054922799) | 0
  b = (((b << 21) | (b >>> 11)) + c) | 0
  a += ((c ^ (b | ~d)) + k[8] + 1873313359) | 0
  a = (((a << 6) | (a >>> 26)) + b) | 0
  d += ((b ^ (a | ~c)) + k[15] - 30611744) | 0
  d = (((d << 10) | (d >>> 22)) + a) | 0
  c += ((a ^ (d | ~b)) + k[6] - 1560198380) | 0
  c = (((c << 15) | (c >>> 17)) + d) | 0
  b += ((d ^ (c | ~a)) + k[13] + 1309151649) | 0
  b = (((b << 21) | (b >>> 11)) + c) | 0
  a += ((c ^ (b | ~d)) + k[4] - 145523070) | 0
  a = (((a << 6) | (a >>> 26)) + b) | 0
  d += ((b ^ (a | ~c)) + k[11] - 1120210379) | 0
  d = (((d << 10) | (d >>> 22)) + a) | 0
  c += ((a ^ (d | ~b)) + k[2] + 718787259) | 0
  c = (((c << 15) | (c >>> 17)) + d) | 0
  b += ((d ^ (c | ~a)) + k[9] - 343485551) | 0
  b = (((b << 21) | (b >>> 11)) + c) | 0

  x[0] = (a + x[0]) | 0
  x[1] = (b + x[1]) | 0
  x[2] = (c + x[2]) | 0
  x[3] = (d + x[3]) | 0
}

function md5blk_array(a) {
  let md5blks: number[] = []

  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24)
  }
  return md5blks
}

class MD5HashAlgorithm {
  private u8a?: Uint8Array

  private length?: number

  private _hash?: _Hash

  constructor() {
    this.reset()
  }

  update(buffer: ArrayBuffer | Uint8Array) {
    if (!this.u8a) return

    const result = concatArrayBuffers(
        this.u8a.buffer,
        buffer instanceof Uint8Array ? buffer.buffer : buffer
      ),
      length = result.length

    let i: number

    this.length! += buffer.byteLength
    for (i = 64; i <= length; i += 64) {
      md5cycle(this._hash!, md5blk_array(result.subarray(i - 64, i)))
    }

    this.u8a =
      i - 64 < length
        ? new Uint8Array(result.buffer.slice(i - 64))
        : new Uint8Array(0)

    return this
  }

  finalize() {
    const { u8a } = this
    if (!u8a) return
    const length = u8a.length,
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    for (let i = 0; i < length; i += 1) {
      tail[i >> 2] |= u8a[i]! << (i % 4 << 3)
    }
    this.finish(tail, length)

    const ret = hex(this._hash!)

    this.reset()
    return ret
  }

  reset() {
    this.u8a = new Uint8Array()
    this.length = 0
    this._hash = [1732584193, -271733879, -1732584194, 271733878]

    return this
  }

  destroy() {
    delete this.u8a
    delete this.length
    delete this._hash
  }

  private finish(tail: number[], length: number) {
    if (!this._hash) return
    let i = length,
      tmp: RegExpMatchArray,
      lo: number,
      hi: number

    tail[i >> 2] |= 0x80 << (i % 4 << 3)
    if (i > 55) {
      md5cycle(this._hash, tail)
      for (i = 0; i < 16; i += 1) {
        tail[i] = 0
      }
    }

    // Do the final computation based on the tail and length
    // Beware that the final length may not fit in 32 bits so we take care of that
    tmp = (this.length! * 8).toString(16).match(/(.*?)(.{0,8})$/)!
    lo = parseInt(tmp[2]!, 16)
    hi = parseInt(tmp[1]!, 16) || 0

    tail[14] = lo
    tail[15] = hi
    md5cycle(this._hash, tail)
  }
}

interface MD5Config {
  /** 文件块大小(单位：字节)，默认为10MB(1024 * 1024 * 10) */
  chunkSize?: number
  /** 进度 */
  onProgress?(progress: number): void
}



function msgMD5(msg: string) {
  const hasher = new MD5HashAlgorithm()
  hasher.update(encodeUTF8ToU8A(msg))
  const result = hasher.finalize()

  hasher.destroy()
  return result
}

async function fileMD5(file: Blob, cfg?: MD5Config) {
  // 每块大小为2MB
  const { chunkSize = 2097152, onProgress } = cfg || {}

  // 创建MD5哈希算法实例
  const hasher = new MD5HashAlgorithm()

  let i = 0
  while (i < file.size) {
    const { result } = await readFile(
      file.slice(i, i + chunkSize),
      'arrayBuffer'
    )

    // 将ArrayBuffer转换为WordArray
    hasher.update(result)

    i += chunkSize
    onProgress?.(i > file.size ? 1 : i / file.size)
  }
  const result = hasher.finalize()
  hasher.destroy()
  return result
}

/**
 * 计算字符串的MD5
 * @param msg 消息
 */
export function MD5(msg: string): Promise<string>
/**
 * 计算文件的MD5
 * @param file 文件
 * @param cfg  配置
 */
export function MD5(file: Blob, cfg?: MD5Config): Promise<string>
export function MD5(content: Blob | string, cfg?: MD5Config) {
  if (content instanceof Blob) {
    return fileMD5(content, cfg)
  }
  return Promise.resolve(msgMD5(content))
}
