import { MD5 } from '@cat-kit/crypto'

type MessageEV = MessageEvent<{
  chunkSize?: number
  file: File
}>

onmessage = async function (e: MessageEV) {
  const { data } = e

  const { file, chunkSize } = data

  const result = await MD5(file, {
    chunkSize,
    onProgress(progress) {
      postMessage({ action: 'progress', data: progress })
    }
  })

  postMessage({ action: 'success', data: result })
}
