import { describe, it, expect, vi, afterAll } from 'vitest'
import {
  createWritableStream,
  saveFromStream,
  saveFromURL
} from '@cat-kit/fe/src'
import {
  ReadableStream as NodeReadableStream,
  WritableStream as NodeWritableStream
} from 'node:stream/web'

if (!globalThis.ReadableStream) {
  vi.stubGlobal('ReadableStream', NodeReadableStream)
}
if (!globalThis.WritableStream) {
  vi.stubGlobal('WritableStream', NodeWritableStream)
}

const originalFetch = globalThis.fetch
const originalDocument = globalThis.document
const originalURL = globalThis.URL

function setupDownloadEnv() {
  const link: any = {
    style: {},
    click: vi.fn()
  }
  const body = {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
  const doc = {
    createElement: vi.fn(() => link),
    body
  }
  Object.defineProperty(globalThis, 'document', {
    value: doc as unknown as Document,
    writable: true
  })

  const urlMock = {
    createObjectURL: vi.fn(() => 'blob://mock'),
    revokeObjectURL: vi.fn()
  }
  vi.stubGlobal('URL', urlMock as any)

  return { link, body, urlMock }
}

afterAll(() => {
  if (originalFetch) {
    vi.stubGlobal('fetch', originalFetch)
  }
  Object.defineProperty(globalThis, 'document', {
    value: originalDocument,
    writable: true
  })
  if (originalURL) {
    vi.stubGlobal('URL', originalURL as any)
  }
})

describe('createWritableStream', () => {
  it('写入、关闭时应触发下载与进度回调', async () => {
    const { urlMock, link, body } = setupDownloadEnv()
    const onProgress = vi.fn()

    vi.useFakeTimers()
    const writable = createWritableStream({
      filename: 'demo.bin',
      onProgress
    })

    const writer = writable.getWriter()
    await writer.write(new Uint8Array([1, 2, 3]))
    await writer.close()

    expect(onProgress).toHaveBeenLastCalledWith(3)
    expect(urlMock.createObjectURL).toHaveBeenCalledTimes(1)
    expect(link.click).toHaveBeenCalledTimes(1)
    expect(body.appendChild).toHaveBeenCalledTimes(1)
    expect(body.removeChild).toHaveBeenCalledTimes(1)

    vi.runAllTimers()
    expect(urlMock.revokeObjectURL).toHaveBeenCalledWith('blob://mock')
    vi.useRealTimers()
  })
})

describe('saveFromStream', () => {
  it('应该消费可读流并触发下载', async () => {
    const { link } = setupDownloadEnv()
    const onProgress = vi.fn()

    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('hello'))
        controller.close()
      }
    })

    await saveFromStream(readable, 'stream.txt', { onProgress })

    expect(onProgress).toHaveBeenCalledWith(5)
    expect(link.click).toHaveBeenCalled()
  })
})

describe('saveFromURL', () => {
  it('应该使用 fetch 结果保存文件并透传 fetch 选项', async () => {
    const { link } = setupDownloadEnv()
    const onProgress = vi.fn()

    const response = new Response('cat', {
      headers: { 'content-length': '3' }
    })
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
      expect(init?.headers).toEqual({ token: 'meow' })
      return response
    }))

    await saveFromURL('/file.bin', 'file.bin', {
      onProgress,
      fetchOptions: { headers: { token: 'meow' } }
    })

    expect(onProgress).toHaveBeenLastCalledWith(3)
    expect(link.click).toHaveBeenCalled()
  })
})
