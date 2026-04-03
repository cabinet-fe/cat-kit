/**
 * 通过 Blob 保存文件
 *
 * 适用于小到中等大小的文件（通常 < 500MB）
 * 使用传统的 Object URL + a[download] 方式
 *
 * @example
 * ```ts
 * const blob = new Blob(['Hello, World!'], { type: 'text/plain' })
 * saveBlob(blob, 'hello.txt')
 * ```
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 延迟释放 URL，确保下载开始
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
