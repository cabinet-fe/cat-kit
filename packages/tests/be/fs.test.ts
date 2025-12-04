import {
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
  readdir
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  ensureDir,
  readDir,
  readJson,
  removePath,
  writeJson,
  emptyDir,
  movePath
} from '@cat-kit/be/src'

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

  describe('emptyDir', () => {
    it('应该清空非空目录', async () => {
      const targetDir = join(tempDir, 'to-empty')
      await ensureDir(targetDir)
      await writeFile(join(targetDir, 'file1.txt'), 'content1')
      await writeFile(join(targetDir, 'file2.txt'), 'content2')
      await ensureDir(join(targetDir, 'subdir'))
      await writeFile(join(targetDir, 'subdir', 'file3.txt'), 'content3')

      await emptyDir(targetDir)

      const items = await readdir(targetDir)
      expect(items).toHaveLength(0)

      // 目录本身应该仍然存在
      const stats = await stat(targetDir)
      expect(stats.isDirectory()).toBe(true)
    })

    it('应该创建不存在的目录', async () => {
      const newDir = join(tempDir, 'new-empty-dir')

      await emptyDir(newDir)

      const stats = await stat(newDir)
      expect(stats.isDirectory()).toBe(true)

      const items = await readdir(newDir)
      expect(items).toHaveLength(0)
    })

    it('应该对已为空的目录不做任何改变', async () => {
      const emptyDirPath = join(tempDir, 'already-empty')
      await ensureDir(emptyDirPath)

      await emptyDir(emptyDirPath)

      const stats = await stat(emptyDirPath)
      expect(stats.isDirectory()).toBe(true)
    })
  })

  describe('movePath', () => {
    it('应该移动文件', async () => {
      const srcFile = join(tempDir, 'source.txt')
      const destFile = join(tempDir, 'dest.txt')
      await writeFile(srcFile, 'hello')

      await movePath(srcFile, destFile)

      const content = await readFile(destFile, 'utf8')
      expect(content).toBe('hello')

      // 源文件应该不存在
      await expect(stat(srcFile)).rejects.toHaveProperty('code', 'ENOENT')
    })

    it('应该移动目录', async () => {
      const srcDir = join(tempDir, 'src-dir')
      const destDir = join(tempDir, 'dest-dir')
      await ensureDir(srcDir)
      await writeFile(join(srcDir, 'file.txt'), 'content')
      await ensureDir(join(srcDir, 'subdir'))
      await writeFile(join(srcDir, 'subdir', 'nested.txt'), 'nested')

      await movePath(srcDir, destDir)

      // 目标目录应该存在
      const stats = await stat(destDir)
      expect(stats.isDirectory()).toBe(true)

      // 文件内容应该正确
      const content = await readFile(join(destDir, 'file.txt'), 'utf8')
      expect(content).toBe('content')

      const nestedContent = await readFile(
        join(destDir, 'subdir', 'nested.txt'),
        'utf8'
      )
      expect(nestedContent).toBe('nested')

      // 源目录应该不存在
      await expect(stat(srcDir)).rejects.toHaveProperty('code', 'ENOENT')
    })

    it('应该在目标存在且 overwrite 为 true 时覆盖', async () => {
      const srcFile = join(tempDir, 'source.txt')
      const destFile = join(tempDir, 'dest.txt')
      await writeFile(srcFile, 'new content')
      await writeFile(destFile, 'old content')

      await movePath(srcFile, destFile, { overwrite: true })

      const content = await readFile(destFile, 'utf8')
      expect(content).toBe('new content')
    })

    it('应该在目标存在且 overwrite 为 false 时抛出错误', async () => {
      const srcFile = join(tempDir, 'source.txt')
      const destFile = join(tempDir, 'dest.txt')
      await writeFile(srcFile, 'content1')
      await writeFile(destFile, 'content2')

      await expect(movePath(srcFile, destFile)).rejects.toThrow('已存在')
    })

    it('应该在源路径不存在时抛出错误', async () => {
      const srcFile = join(tempDir, 'not-exist.txt')
      const destFile = join(tempDir, 'dest.txt')

      await expect(movePath(srcFile, destFile)).rejects.toThrow('不存在')
    })

    it('应该在源和目标类型不一致时抛出错误', async () => {
      const srcFile = join(tempDir, 'file.txt')
      const destDir = join(tempDir, 'dir')
      await writeFile(srcFile, 'content')
      await ensureDir(destDir)

      await expect(
        movePath(srcFile, destDir, { overwrite: true })
      ).rejects.toThrow('类型不一致')
    })

    it('应该自动创建目标父目录', async () => {
      const srcFile = join(tempDir, 'source.txt')
      const destFile = join(tempDir, 'nested', 'deep', 'dest.txt')
      await writeFile(srcFile, 'hello')

      await movePath(srcFile, destFile)

      const content = await readFile(destFile, 'utf8')
      expect(content).toBe('hello')
    })
  })
})
