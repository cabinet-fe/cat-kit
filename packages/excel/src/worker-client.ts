import type { ExcelWorkerMessage, ExcelWorkerResponse } from './worker'
import { Workbook } from './core/workbook'
import {
  rebuildWorkbook,
  serializeWorkbook,
  type SerializedWorkbook
} from './worker-codec'

/**
 * Excel Worker 客户端
 */
export class ExcelWorkerClient {
  private worker: Worker
  private pendingRequests = new Map<
    string,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  >()

  constructor(workerScriptUrl: string | URL)
  constructor(worker: Worker)
  constructor(workerOrScript: string | URL | Worker) {
    if (typeof Worker !== 'undefined' && workerOrScript instanceof Worker) {
      this.worker = workerOrScript
    } else {
      this.worker = new Worker(workerOrScript as string | URL, { type: 'module' })
    }
    this.worker.onmessage = this.handleMessage.bind(this)
  }

  /**
   * 在 Worker 中读取 Excel 文件
   */
  async readWorkbook(data: Blob | ArrayBuffer | Uint8Array): Promise<Workbook> {
    const result = (await this.request({
      type: 'read',
      data,
      id: this.generateId()
    })) as SerializedWorkbook

    return rebuildWorkbook(result)
  }

  /**
   * 在 Worker 中写入 Excel 文件
   */
  async writeWorkbook(workbook: Workbook | SerializedWorkbook): Promise<Blob> {
    const payload =
      workbook instanceof Workbook ? serializeWorkbook(workbook) : workbook
    return (await this.request({
      type: 'write',
      workbook: payload,
      id: this.generateId()
    })) as Blob
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
