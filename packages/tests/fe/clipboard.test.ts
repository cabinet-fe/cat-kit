import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { clipboard } from '@cat-kit/fe/src'

class MockClipboardItem {
  constructor(public data: any) {}
}

const originalNavigator = globalThis.navigator
const originalDocument = globalThis.document

function setupNavigator(options: {
  permission?: 'granted' | 'denied'
  withClipboard?: boolean
}) {
  const { permission = 'granted', withClipboard = true } = options

  const nav: any = {
    permissions: {
      query: vi.fn(async () => ({ state: permission }))
    }
  }

  if (withClipboard) {
    nav.clipboard = {
      write: vi.fn(async () => undefined),
      read: vi.fn(async () => []),
      readText: vi.fn(async () => 'text-from-clipboard')
    }
  }

  vi.stubGlobal('navigator', nav)
  vi.stubGlobal('ClipboardItem', MockClipboardItem)

  return nav
}

function setupLegacyDocument() {
  const execCommand = vi.fn()
  const textarea: any = {
    style: {},
    select: vi.fn(),
    remove: vi.fn()
  }

  const mockDoc = {
    createElement: vi.fn(() => textarea),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    execCommand
  }

  Object.defineProperty(globalThis, 'document', {
    value: mockDoc as unknown as Document,
    writable: true
  })

  return { execCommand, textarea }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => {
  if (originalNavigator) {
    vi.stubGlobal('navigator', originalNavigator)
  }
  if (originalDocument) {
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      writable: true
    })
  }
})

describe('clipboard.copy', () => {
  it('应该在有权限时调用 Clipboard API', async () => {
    const nav = setupNavigator({ permission: 'granted', withClipboard: true })
    await clipboard.copy('喵喵')

    expect(nav.clipboard.write).toHaveBeenCalledTimes(1)
    const items = nav.clipboard.write.mock.calls[0]![0]
    expect(Array.isArray(items)).toBe(true)
    expect(items[0]).toBeInstanceOf(MockClipboardItem)
  })

  it('应该在缺少 Clipboard API 时回退到 document.execCommand', async () => {
    setupNavigator({ withClipboard: false })
    const { execCommand, textarea } = setupLegacyDocument()

    await clipboard.copy('fallback')
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(textarea.select).toHaveBeenCalled()
  })
})

describe('clipboard.read', () => {
  it('权限拒绝时应该抛错', async () => {
    setupNavigator({ permission: 'denied', withClipboard: true })

    await expect(clipboard.read()).rejects.toThrow(/未授权/)
  })

  it('权限通过时应该读取所有类型的 Blob', async () => {
    const blob = new Blob(['cat'], { type: 'text/plain' })
    const nav = setupNavigator({ permission: 'granted', withClipboard: true })

    nav.clipboard.read.mockResolvedValue([
      {
        types: ['text/plain'],
        getType: vi.fn(async () => blob)
      }
    ])

    const result = await clipboard.read()
    expect(result).toEqual([blob])
  })
})

describe('clipboard.readText', () => {
  it('读取失败时应该给出友好提示', async () => {
    const nav = setupNavigator({ permission: 'granted', withClipboard: true })
    nav.clipboard.readText.mockRejectedValue(new Error('denied'))

    await expect(clipboard.readText()).rejects.toBe('无法读取剪切板内容')
  })

  it('读取成功时返回文本内容', async () => {
    setupNavigator({ permission: 'granted', withClipboard: true })
    await expect(clipboard.readText()).resolves.toBe('text-from-clipboard')
  })
})
