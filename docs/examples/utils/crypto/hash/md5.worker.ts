import { MD5 } from '@cat-kit/crypto'

onmessage = async function (e) {
  const hash = await MD5(e.data, {
    chunkSize: 2 * 1024 * 1024,
    onProgress(progress) {
      postMessage({
        event: 'progress',
        data: progress
      })
    }
  })

  postMessage({
    event: 'end',
    data: hash
  })
}
