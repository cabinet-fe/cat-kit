import { readdirSync, readFileSync, type Dirent } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'

interface SidebarGroupConfig {
  dir: string
  text: string
  collapsed?: boolean
}

type SidebarSourceMap = Record<string, SidebarGroupConfig[]>

interface FrontMatterData {
  title?: string | null
  sidebarTitle?: string | null
  sidebarLabel?: string | null
  sidebarOrder?: number | null
  order?: number | null
  sidebar?: string | boolean | null
}

interface SidebarItemInternal {
  text: string
  link?: string
  items?: SidebarItemInternal[]
  order: number
}

const DOCS_ROOT = fileURLToPath(new URL('../', import.meta.url))
const COLLATOR = new Intl.Collator('zh-CN')

const PACKAGE_LABELS: Record<string, string> = {
  core: 'Core 核心包',
  http: 'HTTP 请求包',
  fe: 'FE 前端包',
  excel: 'Excel 表格包',
  be: 'BE 后端包'
}

export const sidebar: DefaultTheme.Sidebar = generateSidebar({
  '/guide/': [{ dir: 'guide', text: '开始' }],
  ...createPackageSidebarSources()
})

function createPackageSidebarSources(): SidebarSourceMap {
  return Object.fromEntries(
    Object.entries(PACKAGE_LABELS).map(([name, text]) => [
      `/packages/${name}/`,
      [{ dir: `packages/${name}`, text }]
    ])
  )
}

function generateSidebar(sourceMap: SidebarSourceMap): DefaultTheme.Sidebar {
  const result: DefaultTheme.Sidebar = {}

  for (const [basePath, groups] of Object.entries(sourceMap)) {
    const sidebarItems: DefaultTheme.SidebarItem[] = []

    for (const group of groups) {
      const items = collectItems(group.dir)
      if (items.length > 0) {
        sidebarItems.push({
          text: group.text,
          collapsed: group.collapsed,
          items
        })
      }
    }

    if (sidebarItems.length > 0) {
      result[basePath] = sidebarItems
    }
  }

  return result
}

function collectItems(relativeDir: string): DefaultTheme.SidebarItem[] {
  const internalItems = collectInternalItems(relativeDir)
  return finalizeItems(internalItems)
}

function collectInternalItems(relativeDir: string): SidebarItemInternal[] {
  const absoluteDir = join(DOCS_ROOT, relativeDir)
  let entries: Dirent[] = []

  try {
    entries = readdirSync(absoluteDir, { withFileTypes: true })
  } catch {
    return []
  }

  const items: SidebarItemInternal[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nestedItems = collectInternalItems(join(relativeDir, entry.name))
      if (!nestedItems.length) {
        continue
      }

      items.push({
        text: formatFromSlug(entry.name),
        items: nestedItems,
        order: 0
      })
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.md') &&
      !entry.name.startsWith('_')
    ) {
      const relativeFilePath = join(relativeDir, entry.name).replace(/\\/g, '/')
      const meta = createFileSidebarItem(relativeFilePath)
      if (meta) {
        items.push(meta)
      }
    }
  }

  return items
}

function createFileSidebarItem(
  relativeFilePath: string
): SidebarItemInternal | null {
  const absolutePath = join(DOCS_ROOT, relativeFilePath)
  const content = readFileSync(absolutePath, 'utf-8')
  const { data, body } = parseFrontMatter(content)

  if (isSidebarDisabled(data.sidebar)) {
    return null
  }

  const filename = basename(relativeFilePath, extname(relativeFilePath))
  const text = resolveDisplayText({ filename, data, body })
  const order = resolveOrder({ filename, data })
  const link = buildLink(relativeFilePath)

  return {
    text,
    link,
    order
  }
}

function finalizeItems(
  items: SidebarItemInternal[]
): DefaultTheme.SidebarItem[] {
  return items
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }
      return COLLATOR.compare(a.text, b.text)
    })
    .map(({ items: nested, order: _order, ...rest }) => {
      if (!nested) {
        return rest
      }

      return {
        ...rest,
        items: finalizeItems(nested)
      }
    })
}

function parseFrontMatter(content: string): {
  data: FrontMatterData
  body: string
} {
  const match = /^---\s*[\r\n]+([\s\S]*?)\s*---\s*/.exec(content)

  if (!match) {
    return {
      data: {},
      body: content
    }
  }

  const raw = match[1] ?? ''
  const body = content.slice(match[0].length)

  return {
    data: parseFrontMatterBlock(raw),
    body
  }
}

function parseFrontMatterBlock(raw: string): FrontMatterData {
  const data: FrontMatterData = {}
  const lines = raw.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(trimmed)

    if (!match) {
      continue
    }

    const [_, key, rawValue] = match

    if (
      key !== 'title' &&
      key !== 'sidebarTitle' &&
      key !== 'sidebarLabel' &&
      key !== 'sidebarOrder' &&
      key !== 'order' &&
      key !== 'sidebar'
    ) {
      continue
    }

    const parsedValue = parseScalar(rawValue ?? '')
    if (parsedValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(data as any)[key] = parsedValue
    }
  }

  return data
}

function parseScalar(value: string): string | number | boolean | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))

  const unwrapped = quoted ? trimmed.slice(1, -1) : trimmed

  if (/^-?\d+(\.\d+)?$/.test(unwrapped)) {
    return Number(unwrapped)
  }

  if (/^(true|false)$/i.test(unwrapped)) {
    return unwrapped.toLowerCase() === 'true'
  }

  return unwrapped
}

function isSidebarDisabled(
  value: FrontMatterData['sidebar']
): value is false | 'false' | 'no' | 'off' {
  if (typeof value === 'boolean') {
    return value === false
  }

  if (typeof value === 'string') {
    const lowered = value.toLowerCase()
    return lowered === 'false' || lowered === 'no' || lowered === 'off'
  }

  return false
}

function resolveDisplayText({
  filename,
  data,
  body
}: {
  filename: string
  data: FrontMatterData
  body: string
}): string {
  return (
    data.sidebarTitle ||
    data.sidebarLabel ||
    (filename === 'index' ? '概览' : null) ||
    data.title ||
    extractFirstHeading(body) ||
    formatFromSlug(filename)
  )
}

function resolveOrder({
  filename,
  data
}: {
  filename: string
  data: FrontMatterData
}): number {
  if (typeof data.sidebarOrder === 'number') {
    return data.sidebarOrder
  }

  if (typeof data.order === 'number') {
    return data.order
  }

  return filename === 'index' ? -1 : 0
}

function extractFirstHeading(content: string): string | null {
  const match = /^#\s+(.+)$/m.exec(content)
  return match && match[1] ? match[1].trim() : null
}

function formatFromSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')
}

function buildLink(relativeFilePath: string): string {
  const normalized = relativeFilePath.replace(/\\/g, '/').replace(/\.md$/, '')

  if (normalized.endsWith('/index')) {
    return `/${normalized.replace(/\/index$/, '/')}`
  }

  return `/${normalized}`
}
