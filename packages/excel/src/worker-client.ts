import type { ExcelWorkerMessage, ExcelWorkerResponse } from './worker'

/**
 * Excel Worker 客户端
 */
export class ExcelWorkerClient {
  private worker: Worker
  private pendingRequests = new Map<
    string,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  >()

  constructor(workerScriptUrl: string | URL) {
    this.worker = new Worker(workerScriptUrl, { type: 'module' })
    this.worker.onmessage = this.handleMessage.bind(this)
  }

  /**
   * 在 Worker 中读取 Excel 文件
   */
  async readWorkbook(data: Blob | ArrayBuffer | Uint8Array): Promise<any> {
    return this.request({ type: 'read', data, id: this.generateId() })
  }

  /**
   * 终止 Worker
   */
  terminate() {
    this.worker.terminate()
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error('Worker terminated'))
    })
    this.pendingRequests.clear()
  }

  private request(message: ExcelWorkerMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(message.id, { resolve, reject })
      this.worker.postMessage(message)
    })
  }

  private handleMessage(event: MessageEvent<ExcelWorkerResponse>) {
    const { id, type } = event.data
    const request = this.pendingRequests.get(id)

    if (!request) return

    if (type === 'error') {
      request.reject(new Error(event.data.error))
    } else if (type === 'read_success') {
      request.resolve(event.data.workbook)
    } else if (type === 'write_success') {
      request.resolve(event.data.data)
    }

    this.pendingRequests.delete(id)
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}
