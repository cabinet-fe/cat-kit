import { fileURLToPath } from 'url'
import { readDir, DirWithoutChildren, DirFile } from './readdir'
import path, { dirname } from 'path'

describe('文件目录读取', () => {
  const __filename = fileURLToPath(new URL(import.meta.url))
  const __dirname = dirname(__filename)
  const target = path.resolve(__dirname, 'dir-test')
  const targetURL = new URL('./dir-test',import.meta.url)

  const depth1File: DirFile = {
    type: 'file',
    name: 'file',
    ext: '',
    dirName: 'dir-test',
    depth: 1,
    path: path.resolve(__dirname, 'dir-test/file')
  }

  const depth1Dir: DirWithoutChildren = {
    type: 'dir',
    name: 'dir',
    depth: 1,
    path: path.resolve(__dirname, 'dir-test/dir')
  }

  const depth2File: DirFile = {
    type: 'file',
    name: 'file',
    ext: '',
    dirName: 'dir',
    depth: 2,
    path: path.resolve(__dirname, 'dir-test/dir/file')
  }

  test('仅读取文件', async () => {
    const dirs = await readDir(targetURL, {
      readType: 'file'
    })
    expect(dirs).toEqual([depth1File])
  })

  test('仅读取目录', async () => {
    const dirs = await readDir(target, {
      readType: 'dir'
    })
    expect(dirs).toEqual([depth1Dir])
  })

  test('递归读取目录和文件', async () => {
    const dirs = await readDir(target, {
      recursive: true
    })
    expect(dirs).toEqual([
      {
        ...depth1Dir,
        children: [depth2File]
      },
      depth1File
    ])
  })

  test('排除某些文件', async () => {
    const dirs = await readDir(target, {
      recursive: true,
      exclude: [/dir/]
    })
    expect(dirs).toEqual([depth1File])
  })

  test('仅包含某些文件', async () => {
    const dirs = await readDir(target, {
      recursive: true,
      include: [/dir/]
    })
    expect(dirs).toEqual([{
      ...depth1Dir,
      children: []
    }])
  })
})