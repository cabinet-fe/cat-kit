function createClipboardData(data: Blob | string): ClipboardItem
function createClipboardData(data: (string | Blob)[]): ClipboardItem[]
function createClipboardData(
  data: string | Blob | Array<string | Blob>
): ClipboardItem | ClipboardItem[] {
  if (typeof data === 'string') {
    const type = 'text/plain'
    return new ClipboardItem({
      [type]: new Blob([data], { type })
    })
  } else if (data instanceof Blob) {
    return new ClipboardItem({
      [data.type]: data
    })
  } else if (Array.isArray(data)) {
    let items: ClipboardItems = []
    data.forEach(item => {
      items.push(createClipboardData(item))
    })
    return items
  } else {
    throw new Error('写入到剪切板的数据类型不正确')
  }
}

/** 剪切板 */
export const clipboard = {
  /**
   * 将一段文本写入系统剪切板
   * @param data 写入的数据
   */
  async copy(data: string | Blob | Array<string | Blob>): Promise<void> {
    const { clipboard, permissions } = navigator

    // 尝试获取权限(chrome浏览器需要获取权限)
    // @ts-ignore 类型中不支持clipboard-write
    const permission = await permissions.query({ name: 'clipboard-write' }).catch(() => {
      // 报错说明不支持该权限, 手动给一个granted
      return {
        state: 'granted'
      }
    })

    if (permission.state === 'denied') {
      return Promise.reject('用户未授权复制到剪切板操作')
    }

    if (!clipboard) {
      return Promise.reject('当前浏览器不支持该api, 写入失败')
    }

    if (Array.isArray(data)) {
      return clipboard.write(createClipboardData(data))
    }

    return clipboard.write([createClipboardData(data)])

  }
}