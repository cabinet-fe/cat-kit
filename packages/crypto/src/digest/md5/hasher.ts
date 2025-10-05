import type { Hasher, DataInput } from '../../base/types'
import { HashResult } from '../../base/types'
import { toUint8Array } from '../../base/utils'
import {
  createInitialState,
  processBlock,
  stateToBytes,
  addPadding,
  type MD5State
} from './core'

/**
 * MD5 增量哈希器
 * 支持分块处理大文件
 */
export class MD5Hasher implements Hasher {
  private state: MD5State
  private buffer: Uint8Array
  private bufferLength: number
  private totalLength: number
  private finished: boolean

  constructor() {
    this.state = createInitialState()
    this.buffer = new Uint8Array(64) // MD5 块大小为 64 字节
    this.bufferLength = 0
    this.totalLength = 0
    this.finished = false
  }

  /**
   * 更新哈希器状态
   * @param data 要哈希的数据
   */
  update(data: DataInput): void {
    if (this.finished) {
      throw new Error('哈希器已完成，不能再更新')
    }

    const bytes = toUint8Array(data)
    this.totalLength += bytes.length

    let offset = 0

    // 如果缓冲区有数据，先尝试填满缓冲区
    if (this.bufferLength > 0) {
      const needed = 64 - this.bufferLength
      const available = Math.min(needed, bytes.length)

      this.buffer.set(bytes.subarray(0, available), this.bufferLength)
      this.bufferLength += available
      offset = available

      // 如果缓冲区满了，处理它
      if (this.bufferLength === 64) {
        processBlock(this.buffer, this.state)
        this.bufferLength = 0
      }
    }

    // 处理完整的 64 字节块
    while (offset + 64 <= bytes.length) {
      processBlock(bytes.subarray(offset, offset + 64), this.state)
      offset += 64
    }

    // 将剩余数据放入缓冲区
    if (offset < bytes.length) {
      const remaining = bytes.subarray(offset)
      this.buffer.set(remaining, this.bufferLength)
      this.bufferLength += remaining.length
    }
  }

  /**
   * 完成哈希计算并返回结果
   */
  finish(): HashResult {
    if (this.finished) {
      return new HashResult(stateToBytes(this.state))
    }

    // 处理最后的数据块（包括填充）
    const finalData = this.buffer.subarray(0, this.bufferLength)
    const padded = addPadding(finalData, this.totalLength)

    // 处理所有填充后的块
    for (let i = 0; i < padded.length; i += 64) {
      processBlock(padded.subarray(i, i + 64), this.state)
    }

    this.finished = true
    return new HashResult(stateToBytes(this.state))
  }
}
