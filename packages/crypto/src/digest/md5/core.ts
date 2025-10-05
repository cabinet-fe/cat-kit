/**
 * MD5 核心算法实现
 * 基于 RFC 1321 标准
 */

// MD5 常量 T 表
const T = new Uint32Array(64)
for (let i = 0; i < 64; i++) {
  T[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
}

// 每轮的位移量
const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21
]

/**
 * MD5 状态
 */
export interface MD5State {
  a: number
  b: number
  c: number
  d: number
}

/**
 * 左旋操作
 */
function rotateLeft(x: number, n: number): number {
  return (x << n) | (x >>> (32 - n))
}

/**
 * MD5 辅助函数 F
 */
function F(x: number, y: number, z: number): number {
  return (x & y) | (~x & z)
}

/**
 * MD5 辅助函数 G
 */
function G(x: number, y: number, z: number): number {
  return (x & z) | (y & ~z)
}

/**
 * MD5 辅助函数 H
 */
function H(x: number, y: number, z: number): number {
  return x ^ y ^ z
}

/**
 * MD5 辅助函数 I
 */
function I(x: number, y: number, z: number): number {
  return y ^ (x | ~z)
}

/**
 * MD5 处理单个块（512 位 / 64 字节）
 */
export function processBlock(block: Uint8Array, state: MD5State): void {
  // 将字节块转换为 32 位整数数组（小端序）
  const X = new Uint32Array(16)
  for (let i = 0; i < 16; i++) {
    X[i] =
      block[i * 4]! |
      (block[i * 4 + 1]! << 8) |
      (block[i * 4 + 2]! << 16) |
      (block[i * 4 + 3]! << 24)
  }

  let a = state.a
  let b = state.b
  let c = state.c
  let d = state.d

  // 4 轮运算，每轮 16 步
  for (let i = 0; i < 64; i++) {
    let f: number, g: number

    if (i < 16) {
      f = F(b, c, d)
      g = i
    } else if (i < 32) {
      f = G(b, c, d)
      g = (5 * i + 1) % 16
    } else if (i < 48) {
      f = H(b, c, d)
      g = (3 * i + 5) % 16
    } else {
      f = I(b, c, d)
      g = (7 * i) % 16
    }

    const temp = d
    d = c
    c = b
    b = (b + rotateLeft((a + f + T[i]! + X[g]!) >>> 0, S[i]!)) >>> 0
    a = temp
  }

  // 更新状态
  state.a = (state.a + a) >>> 0
  state.b = (state.b + b) >>> 0
  state.c = (state.c + c) >>> 0
  state.d = (state.d + d) >>> 0
}

/**
 * 创建初始 MD5 状态
 */
export function createInitialState(): MD5State {
  return {
    a: 0x67452301,
    b: 0xefcdab89,
    c: 0x98badcfe,
    d: 0x10325476
  }
}

/**
 * 将 MD5 状态转换为字节数组（小端序）
 */
export function stateToBytes(state: MD5State): Uint8Array {
  const result = new Uint8Array(16)
  const values = [state.a, state.b, state.c, state.d]

  for (let i = 0; i < 4; i++) {
    const value = values[i]!
    result[i * 4] = value & 0xff
    result[i * 4 + 1] = (value >>> 8) & 0xff
    result[i * 4 + 2] = (value >>> 16) & 0xff
    result[i * 4 + 3] = (value >>> 24) & 0xff
  }

  return result
}

/**
 * 添加 MD5 填充
 * @param data 原始数据
 * @param totalLength 总长度（字节）
 * @returns 填充后的完整块
 */
export function addPadding(data: Uint8Array, totalLength: number): Uint8Array {
  const msgLen = data.length
  const bitLen = totalLength * 8

  // 计算需要填充的字节数
  // MD5 要求：数据 + 0x80 + 零填充 + 8字节长度 = 64的倍数
  const paddingLen = (55 - msgLen) % 64
  const totalLen = msgLen + 1 + paddingLen + 8

  const padded = new Uint8Array(totalLen)
  padded.set(data, 0)
  padded[msgLen] = 0x80

  // 添加原始长度（位）- 小端序 64 位整数
  const lengthBytes = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    lengthBytes[i] = (bitLen >>> (i * 8)) & 0xff
  }
  padded.set(lengthBytes, msgLen + 1 + paddingLen)

  return padded
}
