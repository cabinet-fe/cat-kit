import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  ensureDir,
  readDir,
  readJson,
  removePath,
  writeJson
} from '@cat-kit/be/src/fs'

describe('@cat-kit/be 文件系统工具', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'cat-kit-fs-'))
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('应该确保嵌套目录存在', async () => {
    const nested = join(tempDir, 'a/b/c')
    await ensureDir(nested)
    const stats = await stat(nested)
    expect(stats.isDirectory()).toBe(true)
  })

  it('应该写入和读取 JSON 内容', async () => {
    const filePath = join(tempDir, 'data.json')
    await writeJson(filePath, { foo: 'bar' })
    const result = await readJson<{ foo: string }>(filePath)
    expect(result).toEqual({ foo: 'bar' })
  })

  it('应该删除文件和目录', async () => {
    const filePath = join(tempDir, 'temp.txt')
    await writeFile(filePath, 'hello', 'utf8')
    await removePath(filePath)

    await expect(readFile(filePath, 'utf8')).rejects.toHaveProperty(
      'code',
      'ENOENT'
    )
  })

  it('应该递归读取目录并返回详细信息', async () => {
    const nestedDir = join(tempDir, 'dir')
    await ensureDir(join(nestedDir, 'inner'))
    await writeFile(join(nestedDir, 'file.txt'), 'text')
    await writeFile(join(nestedDir, 'inner', 'another.txt'), 'text')

    const entries = await readDir(nestedDir, {
      recursive: true
    })

    expect(entries.length).toBeGreaterThanOrEqual(3) // 至少包含 dir, inner, file.txt, another.txt
    expect(entries.some(entry => entry.isFile)).toBe(true)
    expect(entries.some(entry => entry.isDirectory)).toBe(true)
  })

  it('应该只返回文件路径', async () => {
    const nestedDir = join(tempDir, 'dir')
    await ensureDir(join(nestedDir, 'inner'))
    await writeFile(join(nestedDir, 'file.txt'), 'text')
    await writeFile(join(nestedDir, 'inner', 'another.txt'), 'text')

    const files = await readDir(nestedDir, {
      recursive: true,
      onlyFiles: true
    })

    expect(files).toHaveLength(2)
    expect(files.every(file => typeof file === 'string')).toBe(true)
    expect(files.some(file => file.includes('file.txt'))).toBe(true)
    expect(files.some(file => file.includes('another.txt'))).toBe(true)
  })

  it('应该支持过滤函数', async () => {
    const nestedDir = join(tempDir, 'dir')
    await ensureDir(join(nestedDir, 'inner'))
    await writeFile(join(nestedDir, 'file.txt'), 'text')
    await writeFile(join(nestedDir, 'file.js'), 'text')
    await writeFile(join(nestedDir, 'inner', 'another.txt'), 'text')

    const txtFiles = await readDir(nestedDir, {
      recursive: true,
      onlyFiles: true,
      filter: entry => entry.name.endsWith('.txt')
    })

    expect(txtFiles).toHaveLength(2)
    expect(txtFiles.every(file => file.includes('.txt'))).toBe(true)
  })
})
