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

    if (!clipboard) {
      if (typeof data === 'string') {
        let el: HTMLTextAreaElement = document.createElement('textarea')
        el.value = JSON.stringify(data)

        el.style.width = '0'
        el.style.height = '0'
        el.style.position = 'fixed'
        el.style.left='0'
        el.style.top='0'
        el.style.borderWidth = '1px'
        el.style.pointerEvents = 'none'

        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        el.remove()
      } else {
        return Promise.reject('当前环境无法复制字符串以外的数据')
      }
      return Promise.resolve()
    }

    // 尝试获取权限(chrome浏览器需要获取权限)
    // @ts-ignore 类型中不支持clipboard-write
    const permission = await permissions.query({ name: 'clipboard-write' })
      .catch(() => {
        // 报错说明不支持该权限, 手动给一个granted
        return {
          state: 'granted'
        }
      })

    if (permission.state === 'denied') {
      return Promise.reject('用户未授权复制到剪切板操作')
    }

    if (Array.isArray(data)) {
      return clipboard.write(createClipboardData(data))
    }

    return clipboard.write([createClipboardData(data)])
  }
}
