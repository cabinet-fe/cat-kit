const workerURL = new URL('./file-md5.worker.ts', import.meta.url)

export function getFileMD5(
  file: File,
  options: {
    /** 文件分片读取的size, 默认10Mb */
    chunkSize?: number
    /** md5进度 */
    onProgress?: (progress: number) => void
  }
) {
  return new Promise<string>((rs, rj) => {
    const { chunkSize, onProgress } = options

    const fileMD5Worker = new Worker(workerURL, {
      type: 'module'
    })

    fileMD5Worker.onmessage = e => {
      const { action, data } = e.data
      if (action === 'progress') {
        return onProgress?.(data)
      }

      if (action === 'success') {
        rs(data)
        return fileMD5Worker.terminate()
      }
    }

    fileMD5Worker.onerror = e => {
      rj(e.error)
      fileMD5Worker.terminate()
    }

    fileMD5Worker.postMessage({
      file,
      chunkSize
    })
  })
}
