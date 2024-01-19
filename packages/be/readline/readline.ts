import { createReadStream, existsSync } from 'fs'
import { createInterface } from 'readline'

/**
 * 读取文件的行
 * @param filePath 文件的绝对路径
 * @param filter 过滤器
 */
export function readFileLine(
  filePath: string,
  filter: (lineIndex: number, str: string, content: string[]) => boolean | undefined
) {
  return new Promise<string[]>((rs, rj) => {
    if (!existsSync(filePath)) return rj('文件不存在')

    let content: string[] = []
    const inputStream = createReadStream(filePath)
    const rl = createInterface(inputStream)

    let index = 0
    rl.on('line', str => {
      const ret = filter(index, str, content)
      if (ret === true) {
        content.push(str)
        index++
      } else if (ret === false)  {
        rl.close()
      } else {
        index++
      }
    })

    rl.on('close', () => {
      rs(content)
    })
  })
}
