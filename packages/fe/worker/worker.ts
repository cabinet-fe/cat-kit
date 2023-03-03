/**
 * 执行一次worker
 * @param filePath 文件路径
 * @param data 发送到worker的数据
 * @returns
 */
export function runWorkerOnce<T = any>(
  filePath: string | URL,
  data: any,
  cb?: (data: T) => void
) {
  return new Promise<T>((rs, rj) => {
    const worker = new Worker(filePath)

    worker.onerror = function (e) {
      rj(e.error)
      worker.terminate()
    }

    worker.onmessage = function (
      e: MessageEvent<{
        event: 'end' | 'data'
        data: T
      }>
    ) {
      if (e.data.event === 'end') {
        rs(e.data.data)
        worker.terminate()
      } else {
        cb?.(e.data.data)
      }
    }

    worker.postMessage(data)
  })
}

interface WorkerRunnerOptions<T> {
  onError?: (err: any) => void
  onMessage: (data: {
    event: 'end' | 'send';
    data: T
  }) => void
}

class WorkerRunner<T> {
  private _worker: Worker | null = null

  constructor(filePath: string | URL, options: WorkerRunnerOptions<T>) {
    if (!window.Worker) {
      console.error('抱歉你的环境不支持Worker')
      return
    }

    this._worker = new Worker(filePath)
    this._worker.onmessage = function (e) {
      options.onMessage(e.data)
    }
    this._worker.onerror = function (e) {
      options.onError?.(e.error)
    }
  }

  /**
   * 发送数据
   * @param data 数据
   */
  send(data: any) {
    this._worker?.postMessage(data)
  }

  /**
   * 结束worker
   */
  end() {
    this._worker?.terminate()
  }
}

/**
 * 执行worker
 * @param filePath worker脚本路径
 * @param options 选项
 * @returns
 */
export function runWorker<T = any>(
  filePath: string | URL,
  options: WorkerRunnerOptions<T>
) {
  return new WorkerRunner(filePath, options)
}

type IWorker = {
  send: <D>(data: D) => void
  end: <D>(data: D) => void
}

type WorkerFn<T = any> = (accept: T, worker: IWorker) => any

export function createWorker<T>(fn: WorkerFn<T>) {
  const worker: IWorker = {
    send(data) {
      window.postMessage({
        type: 'data',
        data
      })
    },
    end(data) {
      window.postMessage({
        event: 'end',
        data
      })
    }
  }
  window.onmessage = function (e: MessageEvent<T>) {
    fn(e.data, worker)
  }
}
