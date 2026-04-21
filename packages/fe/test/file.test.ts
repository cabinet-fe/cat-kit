import { saveBlob, readChunks } from '@cat-kit/fe'
import { describe, it, expect, vi, afterAll } from 'vitest'

const originalDocument = globalThis.document
const originalURL = globalThis.URL

function setupDownloadEnv() {
  const link: any = { style: {}, click: vi.fn() }
  const body = { appendChild: vi.fn(), removeChild: vi.fn() }
  const doc = { createElement: vi.fn(() => link), body }
  Object.defineProperty(globalThis, 'document', {
    value: doc as unknown as Document,
    writable: true
  })

  const urlMock = { createObjectURL: vi.fn(() => 'blob://mock'), revokeObjectURL: vi.fn() }
  vi.stubGlobal('URL', urlMock as any)

  return { link, body, urlMock }
}

afterAll(() => {
  Object.defineProperty(globalThis, 'document', { value: originalDocument, writable: true })
  if (originalURL) {
    vi.stubGlobal('URL', originalURL as any)
  }
})

describe('saveBlob', () => {
  it('应该创建链接并触发下载', () => {
    const { urlMock, link, body } = setupDownloadEnv()

    vi.useFakeTimers()
    const blob = new Blob(['hello'], { type: 'text/plain' })
    saveBlob(blob, 'test.txt')

    expect(urlMock.createObjectURL).toHaveBeenCalledTimes(1)
    expect(link.download).toBe('test.txt')
    expect(link.click).toHaveBeenCalledTimes(1)
    expect(body.appendChild).toHaveBeenCalledTimes(1)
    expect(body.removeChild).toHaveBeenCalledTimes(1)

    vi.runAllTimers()
    expect(urlMock.revokeObjectURL).toHaveBeenCalledWith('blob://mock')
    vi.useRealTimers()
  })
})

describe('readChunks', () => {
  it('应该按 chunkSize 分块读取', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const blob = new Blob([data])

    const chunks: Uint8Array[] = []
    for await (const chunk of readChunks(blob, { chunkSize: 3 })) {
      chunks.push(chunk)
    }

    expect(chunks).toHaveLength(4)
    expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3]))
    expect(chunks[1]).toEqual(new Uint8Array([4, 5, 6]))
    expect(chunks[2]).toEqual(new Uint8Array([7, 8, 9]))
    expect(chunks[3]).toEqual(new Uint8Array([10]))
  })

  it('应该支持 offset 偏移', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5])
    const blob = new Blob([data])

    const chunks: Uint8Array[] = []
    for await (const chunk of readChunks(blob, { chunkSize: 2, offset: 2 })) {
      chunks.push(chunk)
    }

    expect(chunks).toHaveLength(2)
    expect(chunks[0]).toEqual(new Uint8Array([3, 4]))
    expect(chunks[1]).toEqual(new Uint8Array([5]))
  })

  it('应该支持 break 提前退出', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6])
    const blob = new Blob([data])

    const chunks: Uint8Array[] = []
    for await (const chunk of readChunks(blob, { chunkSize: 2 })) {
      chunks.push(chunk)
      if (chunks.length === 2) break
    }

    expect(chunks).toHaveLength(2)
  })

  it('空文件不应产生任何 chunk', async () => {
    const blob = new Blob([])

    const chunks: Uint8Array[] = []
    for await (const chunk of readChunks(blob)) {
      chunks.push(chunk)
    }

    expect(chunks).toHaveLength(0)
  })
})
