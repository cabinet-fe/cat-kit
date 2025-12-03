import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  ensureDir,
  readDir,
  readJson,
  remove,
  writeJson
} from '@cat-kit/be/src/fs'

describe('@cat-kit/be fs utilities', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'cat-kit-fs-'))
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('ensures nested directories exist', async () => {
    const nested = join(tempDir, 'a/b/c')
    await ensureDir(nested)
    const stats = await stat(nested)
    expect(stats.isDirectory()).toBe(true)
  })

  it('writes and reads JSON content', async () => {
    const filePath = join(tempDir, 'data.json')
    await writeJson(filePath, { foo: 'bar' })
    const result = await readJson<{ foo: string }>(filePath)
    expect(result).toEqual({ foo: 'bar' })
  })

  it('removes files and directories', async () => {
    const filePath = join(tempDir, 'temp.txt')
    await writeFile(filePath, 'hello', 'utf8')
    await remove(filePath)

    await expect(readFile(filePath, 'utf8')).rejects.toHaveProperty(
      'code',
      'ENOENT'
    )
  })

  it('reads directories recursively with filtering', async () => {
    const nestedDir = join(tempDir, 'dir')
    await ensureDir(join(nestedDir, 'inner'))
    await writeFile(join(nestedDir, 'file.txt'), 'text')
    await writeFile(join(nestedDir, 'inner', 'another.txt'), 'text')

    const entries = await readDir(nestedDir, {
      recursive: true,
      includeDirs: false,
      returnType: 'entry'
    })

    expect(entries).toHaveLength(2)
    expect(entries.every(entry => entry.isFile)).toBe(true)
  })
})

