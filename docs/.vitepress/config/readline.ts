import { createReadStream, existsSync } from 'fs'
import fs from 'fs-extra'
import path from 'path'
import { createInterface } from 'readline'
import { DefaultTheme } from 'vitepress'

/**
 * 读取文件的行
 * @param filePath 文件的绝对路径
 * @param filter 过滤器
 */
export function readFileLine(
  filePath: string,
  filter: (lineIndex: number, str: string) => boolean
) {
  return new Promise<string[]>((rs, rj) => {
    if (!existsSync(filePath)) return rj('文件不存在')

    let content: string[] = []
    const inputStream = createReadStream(filePath)
    const rl = createInterface(inputStream)

    let index = 0
    rl.on('line', str => {
      if (filter(index, str) !== false) {
        content.push(str)
        index++
      } else {
        rl.close()
      }
    })

    rl.on('close', () => {
      rs(content)
    })
  })
}



const docsDir = path.resolve(__dirname, '../..')

// 跳过检测的目录
const skippedFiles = new Set(['.vitepress', 'node_modules', 'public'])

// 获取存放md文件的目录 docs/*
const dirs = fs
  .readdirSync(docsDir, {
    withFileTypes: true
  })
  .filter(dirent => dirent.isDirectory() && !skippedFiles.has(dirent.name))
  .map(dirent => dirent.name)

const bars = dirs.reduce((acc, cur) => {
  // 一级目录 docs/*/*
  const dirs = fs.readdirSync(path.resolve(docsDir + `/${cur}`), {
    withFileTypes: true
  })

  const isNest = dirs.some(dir => dir.isDirectory())

  // 有二级目录再读取二级目录
  if (isNest) {
    acc[`/${cur}/`] = dirs.map(dir => {
      // fs.readFileSync()
    })
  } else {
    readFileLine(path.resolve(docsDir, cur, 'index.md'), (lineIndex, str) => {
      return lineIndex < 5
    }).then(v => {
      let RE = /title:\s*(\S*)/
      v.some(item => {
        let matched = item.match(RE)
        if (matched?.[1]) {
          console.log(matched)
        }
        return !!matched
      })
    })
    const indexFileContent = fs.readFileSync(
      path.resolve(docsDir, cur, 'index.md'),
      'utf-8'
    )
    // const title =
    acc[`/${cur}/`] = []
  }

  return acc
}, {} as DefaultTheme.Sidebar)
