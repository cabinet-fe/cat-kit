/**
 * 保存文件到本地
 * @param file 文件对象
 */
export function saveFile(file: File): void
/**
 * 保存Blob数据为文件到本地
 * @param file Blob数据
 * @param name 文件名称
 */
export function saveFile(file: Blob, name: string): void
export function saveFile(file: File | Blob, name?: string): void {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  if (file instanceof File) {
    a.download = file.name
  } else {
    if (!name) {
      throw new Error('文件名称不能为空')
    }
    a.download = name
  }

  a.click()
  URL.revokeObjectURL(a.href)
}
