import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { FetchEngine } from '../../http/src/engine/fetch'
import { XHREngine } from '../../http/src/engine/xhr'

const mockFetch = vi.fn()
const origFetch = globalThis.fetch

describe('FetchEngine', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    globalThis.fetch = mockFetch as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = origFetch
  })

  it('下载进度：多 chunk 时 loaded/total/percent 与回调次数符合预期', async () => {
    const encoder = new TextEncoder()
    const chunk1 = encoder.encode('{"hel')
    const chunk2 = encoder.encode('lo":1}')
    const totalLen = chunk1.length + chunk2.length

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk1)
        controller.enqueue(chunk2)
        controller.close()
      }
    })

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
        'content-length': String(totalLen)
      }),
      body: stream
    })

    const onDownloadProgress = vi.fn()
    const engine = new FetchEngine()
    const res = await engine.request('/api', { onDownloadProgress, responseType: 'json' })

    expect(res.data).toEqual({ hello: 1 })
    expect(onDownloadProgress).toHaveBeenCalled()
    const last = onDownloadProgress.mock.calls.at(-1)![0]
    expect(last.loaded).toBe(totalLen)
    expect(last.total).toBe(totalLen)
    expect(last.percent).toBe(100)
    const withNonZeroPercent = onDownloadProgress.mock.calls.filter((c) => c[0].percent > 0)
    expect(withNonZeroPercent.length).toBeGreaterThan(0)
  })

  it('配置 onUploadProgress 时请求仍成功且该回调不会被调用', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => '{"a":1}',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(8)
    })

    const onUploadProgress = vi.fn()
    const engine = new FetchEngine()
    const res = await engine.request('/p', { method: 'POST', body: { x: 1 }, onUploadProgress })

    expect(res.data).toEqual({ a: 1 })
    expect(onUploadProgress).not.toHaveBeenCalled()
  })

  it('未设置 responseType 时根据 Content-Type 自动推断为 text', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'plain text',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(8)
    })

    const engine = new FetchEngine()
    const res = await engine.request('/text')

    expect(res.data).toBe('plain text')
  })

  it('未设置 responseType 时根据 Content-Type 自动推断为 blob', async () => {
    const blobData = new Blob(['binary'])
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'image/png' }),
      text: async () => 'invalid',
      blob: async () => blobData,
      arrayBuffer: async () => new ArrayBuffer(8)
    })

    const engine = new FetchEngine()
    const res = await engine.request('/img')

    expect(res.data).toBeInstanceOf(Blob)
  })
})

type XHREventHandler = (() => void) | null

class MockXHR {
  static instances: MockXHR[] = []
  upload = { onprogress: null as ((e: ProgressEvent) => void) | null }
  onprogress: ((e: ProgressEvent) => void) | null = null
  onload: XHREventHandler = null
  onerror: XHREventHandler = null
  onabort: XHREventHandler = null
  ontimeout: XHREventHandler = null
  onloadend: XHREventHandler = null
  timeout = 0
  withCredentials = false
  responseType: XMLHttpRequestResponseType = ''
  response: unknown = null
  status = 200
  private _headers: Record<string, string> = {}
  aborted = false

  constructor() {
    MockXHR.instances.push(this)
  }

  open(_method: string, _url: string): void {}

  setRequestHeader(key: string, value: string): void {
    this._headers[key] = value
  }

  send(_body: unknown): void {
    queueMicrotask(() => {
      if (this.aborted) {
        return
      }
      const makeEv = (loaded: number, total: number, lengthComputable: boolean): ProgressEvent =>
        ({ loaded, total, lengthComputable }) as ProgressEvent

      if (this.upload.onprogress) {
        this.upload.onprogress(makeEv(3, 10, true))
      }
      if (this.onprogress) {
        this.onprogress(makeEv(5, 10, true))
      }
      this.response = { ok: true }
      this.status = 200
      this.onload?.()
      this.onloadend?.()
    })
  }

  abort(): void {
    this.aborted = true
    this.onabort?.()
    this.onloadend?.()
  }

  getAllResponseHeaders(): string {
    return 'content-type: application/json\r\n'
  }
}

describe('XHREngine', () => {
  const OrigXHR = globalThis.XMLHttpRequest

  beforeEach(() => {
    MockXHR.instances = []
    globalThis.XMLHttpRequest = MockXHR as unknown as typeof XMLHttpRequest
  })

  afterEach(() => {
    globalThis.XMLHttpRequest = OrigXHR
  })

  it('signal 在请求发起前已中止时不发送请求且抛出 ABORTED', async () => {
    const engine = new XHREngine()
    const ac = new AbortController()
    ac.abort()

    await expect(engine.request('/x', { signal: ac.signal })).rejects.toMatchObject({
      code: 'ABORTED'
    })

    expect(MockXHR.instances.length).toBe(0)
  })

  it('上传/下载进度 ProgressInfo 稳定且 percent 不越界', async () => {
    const onUploadProgress = vi.fn()
    const onDownloadProgress = vi.fn()
    const engine = new XHREngine()

    await engine.request('/y', {
      method: 'POST',
      body: { a: 1 },
      responseType: 'json',
      onUploadProgress,
      onDownloadProgress
    })

    expect(onUploadProgress).toHaveBeenCalled()
    expect(onDownloadProgress).toHaveBeenCalled()
    for (const c of onUploadProgress.mock.calls) {
      expect(c[0].percent).toBeGreaterThanOrEqual(0)
      expect(c[0].percent).toBeLessThanOrEqual(100)
      expect(Number.isNaN(c[0].percent)).toBe(false)
    }
    for (const c of onDownloadProgress.mock.calls) {
      expect(c[0].percent).toBeGreaterThanOrEqual(0)
      expect(c[0].percent).toBeLessThanOrEqual(100)
    }
  })

  it('parseHeaders 保留同名多值 header', async () => {
    class MultiHeaderXHR extends MockXHR {
      override getAllResponseHeaders(): string {
        return 'set-cookie: a=1\r\nset-cookie: b=2\r\ncontent-type: application/json'
      }
    }
    globalThis.XMLHttpRequest = MultiHeaderXHR as unknown as typeof XMLHttpRequest

    const engine = new XHREngine()
    const res = await engine.request('/z', { responseType: 'json' })

    expect(res.headers['set-cookie']).toEqual(['a=1', 'b=2'])
    expect(res.headers['content-type']).toBe('application/json')
  })
})

describe('HTTPError codes (engines)', () => {
  const mockFetch2 = vi.fn()
  const origFetch2 = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = origFetch2
  })

  it('FetchEngine：外部 signal 中止为 ABORTED', async () => {
    globalThis.fetch = mockFetch2 as typeof fetch
    mockFetch2.mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        const sig = (init as RequestInit).signal
        if (!sig) {
          reject(new Error('no signal'))
          return
        }
        const onAbort = (): void => {
          const err = new Error('aborted')
          err.name = 'AbortError'
          reject(err)
        }
        if (sig.aborted) {
          onAbort()
          return
        }
        sig.addEventListener('abort', onAbort)
      })
    })

    const engine = new FetchEngine()
    const ac = new AbortController()
    const p = engine.request('/z', { signal: ac.signal })
    ac.abort()

    await expect(p).rejects.toMatchObject({ code: 'ABORTED', name: 'HTTPError' })
  })

  it('FetchEngine：超时为 TIMEOUT', async () => {
    vi.useFakeTimers()
    globalThis.fetch = mockFetch2 as typeof fetch
    mockFetch2.mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        const sig = (init as RequestInit).signal
        if (!sig) {
          reject(new Error('no signal'))
          return
        }
        const onAbort = (): void => {
          const err = new Error('aborted')
          err.name = 'AbortError'
          reject(err)
        }
        if (sig.aborted) {
          onAbort()
          return
        }
        sig.addEventListener('abort', onAbort)
      })
    })

    const engine = new FetchEngine()
    const p = engine.request('/t', { timeout: 100 })
    const assertRejected = expect(p).rejects.toMatchObject({ code: 'TIMEOUT' })

    await vi.advanceTimersByTimeAsync(100)
    await assertRejected
    vi.useRealTimers()
  })
})
