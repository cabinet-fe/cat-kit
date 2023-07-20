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

const requestPermission = async (
  permissionName: PermissionName | 'clipboard-read' | 'clipboard-write'
) => {
  // 尝试获取权限(chrome浏览器需要获取权限)
  const permission = await navigator.permissions
    // @ts-ignore 类型中不支持clipboard-write
    .query({ name: permissionName })
    .catch(() => {
      // 报错说明不支持该权限, 手动给一个granted
      return {
        state: 'granted'
      }
    })

  return permission.state !== 'denied'
}

/** 剪切板 */
export const clipboard = {
  /**
   * 将一段文本写入系统剪切板
   * @param data 写入的数据
   */
  async copy(data: string | Blob | Array<string | Blob>): Promise<void> {
    const { clipboard } = navigator

    if (!clipboard) {
      if (typeof data === 'string') {
        let el: HTMLTextAreaElement = document.createElement('textarea')
        el.value = JSON.stringify(data)

        el.style.width = '0'
        el.style.height = '0'
        el.style.position = 'fixed'
        el.style.left = '0'
        el.style.top = '0'
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
    const hasPermission = await requestPermission('clipboard-write')

    if (!hasPermission) {
      return Promise.reject('用户未授权复制到剪切板操作')
    }

    if (Array.isArray(data)) {
      return clipboard.write(createClipboardData(data))
    }

    return clipboard.write([createClipboardData(data)])
  },

  /**
   * 从剪切板中读取纯文本数据
   * @returns 读取到的文本数据
   */
  async read() {
    // 检查浏览器是否支持 Clipboard API，并且是否有读取权限
    if (!navigator.clipboard?.read) {
      throw new Error('当前浏览器不支持从剪切板读取数据')
    }
    const hasPermission = await requestPermission('clipboard-read')

    if (!hasPermission) {
      throw new Error('用户未授权读取剪切板内容')
    }

    try {
      // 读取剪切板内容
      const clipboardItems = await navigator.clipboard.read()

      const clipboardItem = clipboardItems[0]

      if (!clipboardItem) {
        throw new Error('未读取到剪切板内容')
      }

      // 检查剪切板内容是否为纯文本
      if (!clipboardItem.types.includes('text/plain')) {
        throw new Error('剪切板内容不是纯文本')
      }

      // 获取剪切板文本数据
      const textData = await clipboardItem.getType('text/plain')

      return textData.text()
    } catch (error) {
      console.error(error)
    }
  },

  /**
   * 读取文本内容
   * @returns 剪切板中的文本内容
   */
  async readText() {
    if (!navigator.clipboard?.readText) {
      throw new Error('当前浏览器不支持从剪切板读取数据')
    }
    const data = await navigator.clipboard.readText().catch(() => {
      return Promise.reject('无法读取剪切板内容')
    })

    return data
  }
}
