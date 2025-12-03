import { createServer } from 'node:net'

export interface PortCheckOptions {
  host?: string
  timeout?: number
}

/**
 * 检查端口是否可用
 * @param port - 目标端口
 * @param options - 指定 host 与超时时间
 * @returns 端口可用时返回 true
 */
export async function isPortAvailable(
  port: number,
  options: PortCheckOptions = {}
): Promise<boolean> {
  const { host = '127.0.0.1', timeout = 1000 } = options

  return new Promise(resolve => {
    const server = createServer()

    const onError = (): void => {
      cleanup()
      resolve(false)
    }

    const onListening = (): void => {
      server.close(() => {
        cleanup()
        resolve(true)
      })
    }

    const cleanup = (): void => {
      server.removeListener('error', onError)
      server.removeListener('listening', onListening)
    }

    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(port, host)

    setTimeout(() => {
      cleanup()
      server.close()
      resolve(false)
    }, timeout).unref()
  })
}
