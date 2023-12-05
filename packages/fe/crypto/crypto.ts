import md5 from 'crypto-js/md5'
import { algo } from 'crypto-js/core'

interface MD5Config {
  /** 文件块大小，默认为10MB */
  chunkSize?: number
}

function msgMD5(msg: string) {
  return md5(msg).toString()
}

function fileMD5(file: Blob, cfg?: MD5Config) {
  return new Promise((resolve, reject) => {
    // 每块大小为10MB
    const { chunkSize = 10485760 } = cfg || {}
    const reader = new FileReader()
    let currentPosition = 0 // 当前读取位置

    // 创建MD5哈希算法实例
    const md5 = algo.MD5.create()

    // 文件读取完成时的回调函数
    reader.onload = function (e) {
      let wordArray = CryptoJS.lib.WordArray.create(e.target.result) // 将ArrayBuffer转换为WordArray
      md5Hasher.update(wordArray) // 更新MD5哈希值
      currentPosition += e.target.result.byteLength // 更新当前读取位置

      if (currentPosition < file.size) {
        // 继续读取下一块数据
        readNextChunk()
      } else {
        // 文件读取完毕，计算最终的MD5值
        let md5 = md5Hasher.finalize() // 完成MD5哈希计算
        resolve(md5.toString())
      }
    }

    // 文件读取失败时的回调函数
    fileReader.onerror = function (e) {
      reject(e)
    }

    // 读取下一块数据
    function readNextChunk() {
      let fileSlice = file.slice(currentPosition, currentPosition + chunkSize)
      fileReader.readAsArrayBuffer(fileSlice)
    }

    // 开始读取文件
    readNextChunk()
  })
}

/** MD5计算 */
export function MD5(msg: string): Promise<string>
export function MD5(file: Blob, cfg?: MD5Config): Promise<string>
export function MD5(content: Blob | string, cfg?: MD5Config) {
  if (content instanceof Blob) {

  }
  return new Promise((resolve, reject) => {
    // 每块大小为10MB

    let currentPosition = 0 // 当前读取位置
    let fileReader = new FileReader()
    let md5Hasher = CryptoJS.algo.MD5.create() // 创建MD5哈希算法实例

    // 文件读取完成时的回调函数
    fileReader.onload = function (e) {
      let wordArray = CryptoJS.lib.WordArray.create(e.target.result) // 将ArrayBuffer转换为WordArray
      md5Hasher.update(wordArray) // 更新MD5哈希值
      currentPosition += e.target.result.byteLength // 更新当前读取位置

      if (currentPosition < file.size) {
        // 继续读取下一块数据
        readNextChunk()
      } else {
        // 文件读取完毕，计算最终的MD5值
        let md5 = md5Hasher.finalize() // 完成MD5哈希计算
        resolve(md5.toString())
      }
    }

    // 文件读取失败时的回调函数
    fileReader.onerror = function (e) {
      reject(e)
    }

    // 读取下一块数据
    function readNextChunk() {
      let fileSlice = file.slice(currentPosition, currentPosition + chunkSize)
      fileReader.readAsArrayBuffer(fileSlice)
    }

    // 开始读取文件
    readNextChunk()
  })
}
