import { readFile } from '@cat-kit/fe'
import { WordArray, arrBufToWordArray } from './core/word-array'
import { Hasher } from './core/algo'
import { Hex } from './core/enc'

// Constants table
const T: number[] = []

// Compute constants
for (let i = 0; i < 64; i += 1) {
  T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0
}

type NumParams = [number, number, number, number, number, number, number]

const FF = (...args: NumParams) => {
  const [a, b, c, d, x, s, t] = args
  const n = a + ((b & c) | (~b & d)) + x + t
  return ((n << s) | (n >>> (32 - s))) + b
}

const GG = (...args: NumParams) => {
  const [a, b, c, d, x, s, t] = args
  const n = a + ((b & d) | (c & ~d)) + x + t
  return ((n << s) | (n >>> (32 - s))) + b
}

const HH = (...args: NumParams) => {
  const [a, b, c, d, x, s, t] = args
  const n = a + (b ^ c ^ d) + x + t
  return ((n << s) | (n >>> (32 - s))) + b
}

const II = (...args: NumParams) => {
  const [a, b, c, d, x, s, t] = args
  const n = a + (c ^ (b | ~d)) + x + t
  return ((n << s) | (n >>> (32 - s))) + b
}

class MD5Algo extends Hasher implements Hasher {
  _hash!: WordArray

  constructor() {
    super()
    // this._hash = new WordArray([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476])
  }

  _doReset() {
    this._hash = new WordArray([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476])
  }

  _doProcessBlock(M: number[], offset: number): void {
    // Swap endian
    for (let i = 0; i < 16; i++) {
      // Shortcuts
      let offset_i = offset + i
      let M_offset_i = M[offset_i]!

      M[offset_i] =
        (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
        (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
    }

    // Shortcuts
    let H = this._hash.words

    let M_offset_0 = M[offset + 0]!
    let M_offset_1 = M[offset + 1]!
    let M_offset_2 = M[offset + 2]!
    let M_offset_3 = M[offset + 3]!
    let M_offset_4 = M[offset + 4]!
    let M_offset_5 = M[offset + 5]!
    let M_offset_6 = M[offset + 6]!
    let M_offset_7 = M[offset + 7]!
    let M_offset_8 = M[offset + 8]!
    let M_offset_9 = M[offset + 9]!
    let M_offset_10 = M[offset + 10]!
    let M_offset_11 = M[offset + 11]!
    let M_offset_12 = M[offset + 12]!
    let M_offset_13 = M[offset + 13]!
    let M_offset_14 = M[offset + 14]!
    let M_offset_15 = M[offset + 15]!

    // Working letiables
    let a = H[0]!
    let b = H[1]!
    let c = H[2]!
    let d = H[3]!

    // Computation
    a = FF(a, b, c, d, M_offset_0, 7, T[0]!)
    d = FF(d, a, b, c, M_offset_1, 12, T[1]!)
    c = FF(c, d, a, b, M_offset_2, 17, T[2]!)
    b = FF(b, c, d, a, M_offset_3, 22, T[3]!)
    a = FF(a, b, c, d, M_offset_4, 7, T[4]!)
    d = FF(d, a, b, c, M_offset_5, 12, T[5]!)
    c = FF(c, d, a, b, M_offset_6, 17, T[6]!)
    b = FF(b, c, d, a, M_offset_7, 22, T[7]!)
    a = FF(a, b, c, d, M_offset_8, 7, T[8]!)
    d = FF(d, a, b, c, M_offset_9, 12, T[9]!)
    c = FF(c, d, a, b, M_offset_10, 17, T[10]!)
    b = FF(b, c, d, a, M_offset_11, 22, T[11]!)
    a = FF(a, b, c, d, M_offset_12, 7, T[12]!)
    d = FF(d, a, b, c, M_offset_13, 12, T[13]!)
    c = FF(c, d, a, b, M_offset_14, 17, T[14]!)
    b = FF(b, c, d, a, M_offset_15, 22, T[15]!)

    a = GG(a, b, c, d, M_offset_1, 5, T[16]!)
    d = GG(d, a, b, c, M_offset_6, 9, T[17]!)
    c = GG(c, d, a, b, M_offset_11, 14, T[18]!)
    b = GG(b, c, d, a, M_offset_0, 20, T[19]!)
    a = GG(a, b, c, d, M_offset_5, 5, T[20]!)
    d = GG(d, a, b, c, M_offset_10, 9, T[21]!)
    c = GG(c, d, a, b, M_offset_15, 14, T[22]!)
    b = GG(b, c, d, a, M_offset_4, 20, T[23]!)
    a = GG(a, b, c, d, M_offset_9, 5, T[24]!)
    d = GG(d, a, b, c, M_offset_14, 9, T[25]!)
    c = GG(c, d, a, b, M_offset_3, 14, T[26]!)
    b = GG(b, c, d, a, M_offset_8, 20, T[27]!)
    a = GG(a, b, c, d, M_offset_13, 5, T[28]!)
    d = GG(d, a, b, c, M_offset_2, 9, T[29]!)
    c = GG(c, d, a, b, M_offset_7, 14, T[30]!)
    b = GG(b, c, d, a, M_offset_12, 20, T[31]!)

    a = HH(a, b, c, d, M_offset_5, 4, T[32]!)
    d = HH(d, a, b, c, M_offset_8, 11, T[33]!)
    c = HH(c, d, a, b, M_offset_11, 16, T[34]!)
    b = HH(b, c, d, a, M_offset_14, 23, T[35]!)
    a = HH(a, b, c, d, M_offset_1, 4, T[36]!)
    d = HH(d, a, b, c, M_offset_4, 11, T[37]!)
    c = HH(c, d, a, b, M_offset_7, 16, T[38]!)
    b = HH(b, c, d, a, M_offset_10, 23, T[39]!)
    a = HH(a, b, c, d, M_offset_13, 4, T[40]!)
    d = HH(d, a, b, c, M_offset_0, 11, T[41]!)
    c = HH(c, d, a, b, M_offset_3, 16, T[42]!)
    b = HH(b, c, d, a, M_offset_6, 23, T[43]!)
    a = HH(a, b, c, d, M_offset_9, 4, T[44]!)
    d = HH(d, a, b, c, M_offset_12, 11, T[45]!)
    c = HH(c, d, a, b, M_offset_15, 16, T[46]!)
    b = HH(b, c, d, a, M_offset_2, 23, T[47]!)

    a = II(a, b, c, d, M_offset_0, 6, T[48]!)
    d = II(d, a, b, c, M_offset_7, 10, T[49]!)
    c = II(c, d, a, b, M_offset_14, 15, T[50]!)
    b = II(b, c, d, a, M_offset_5, 21, T[51]!)
    a = II(a, b, c, d, M_offset_12, 6, T[52]!)
    d = II(d, a, b, c, M_offset_3, 10, T[53]!)
    c = II(c, d, a, b, M_offset_10, 15, T[54]!)
    b = II(b, c, d, a, M_offset_1, 21, T[55]!)
    a = II(a, b, c, d, M_offset_8, 6, T[56]!)
    d = II(d, a, b, c, M_offset_15, 10, T[57]!)
    c = II(c, d, a, b, M_offset_6, 15, T[58]!)
    b = II(b, c, d, a, M_offset_13, 21, T[59]!)
    a = II(a, b, c, d, M_offset_4, 6, T[60]!)
    d = II(d, a, b, c, M_offset_11, 10, T[61]!)
    c = II(c, d, a, b, M_offset_2, 15, T[62]!)
    b = II(b, c, d, a, M_offset_9, 21, T[63]!)

    // Intermediate hash value
    H[0] = (H[0]! + a) | 0
    H[1] = (H[1]! + b) | 0
    H[2] = (H[2]! + c) | 0
    H[3] = (H[3]! + d) | 0
  }

  _doFinalize() {
    // Shortcuts
    const { data } = this
    const dataWords = data.words

    let nBitsTotal = this.dataBytes * 8
    let nBitsLeft = data.sigBytes * 8

    // Add padding
    dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32))

    let nBitsTotalH = Math.floor(nBitsTotal / 0x100000000)
    let nBitsTotalL = nBitsTotal
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] =
      (((nBitsTotalH << 8) | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
      (((nBitsTotalH << 24) | (nBitsTotalH >>> 8)) & 0xff00ff00)
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] =
      (((nBitsTotalL << 8) | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
      (((nBitsTotalL << 24) | (nBitsTotalL >>> 8)) & 0xff00ff00)

    data.sigBytes = (dataWords.length + 1) * 4

    // Hash final blocks
    this._process()

    // Shortcuts
    let hash = this._hash
    let H = hash.words

    // Swap endian
    for (let i = 0; i < 4; i++) {
      // Shortcut
      let H_i = H[i]!

      H[i] =
        (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
        (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00)
    }

    // Return final computed hash
    return hash
  }
}

interface MD5Config {
  /** 文件块大小，默认为10MB */
  chunkSize?: number
}

function msgMD5(msg: string) {
  const md5 = new MD5Algo()
  return Hex.stringify(md5.finalize(msg))
}

async function fileMD5(file: Blob, cfg?: MD5Config) {
  // 每块大小为10MB
  const { chunkSize = 10485760 } = cfg || {}

  // 创建MD5哈希算法实例

  const md5 = new MD5Algo()

  let i = 0
  while (i < file.size) {
    const { result } = await readFile(
      file.slice(i, i + chunkSize),
      'arrayBuffer'
    )

    // 将ArrayBuffer转换为WordArray
    md5.update(arrBufToWordArray(result))
    i += chunkSize
  }

  return md5.finalize().toString()
}

/** MD5计算 */
export function MD5(msg: string): Promise<string>
export function MD5(file: Blob, cfg?: MD5Config): Promise<string>
export function MD5(content: Blob | string, cfg?: MD5Config) {
  if (content instanceof Blob) {
    return fileMD5(content, cfg)
  }
  return Promise.resolve(msgMD5(content))
}
