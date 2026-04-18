import type { HTTPClientPlugin, HTTPResponse, RequestConfig, RequestContext } from '../types'
import { HTTPError } from '../types'

const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504]

function defaultBackoff(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 30000)
}

function getRetryAttempt(config: RequestConfig): number {
  return config._retryAttempt ?? 0
}

export interface RetryPluginOptions {
  maxRetries?: number
  delay?: number | ((attempt: number) => number)
  retryOn?: (error: unknown, context: RequestContext) => boolean
  retryOnStatus?: number[]
}

/**
 * 在请求失败时按策略自动重试（通过 `onError` + `context.retry`）。
 */
export function RetryPlugin(options: RetryPluginOptions = {}): HTTPClientPlugin {
  const maxRetries = options.maxRetries ?? 3
  const delayOpt = options.delay
  const retryOnStatus = options.retryOnStatus ?? DEFAULT_RETRY_STATUSES

  const resolveDelay = (attempt: number): number => {
    if (typeof delayOpt === 'function') {
      return delayOpt(attempt)
    }
    if (typeof delayOpt === 'number') {
      return delayOpt
    }
    return defaultBackoff(attempt)
  }

  const shouldRetryForError = (error: unknown, context: RequestContext): boolean => {
    if (options.retryOn) {
      return options.retryOn(error, context)
    }
    if (error instanceof HTTPError) {
      if (error.response !== undefined) {
        return retryOnStatus.includes(error.response.code)
      }
      return error.code === 'NETWORK' || error.code === 'TIMEOUT'
    }
    return false
  }

  return {
    name: 'retry',
    async onError(error: unknown, context: RequestContext): Promise<HTTPResponse | void> {
      if (!context.retry) {
        return undefined
      }

      const attempt = getRetryAttempt(context.config)
      if (attempt >= maxRetries) {
        return undefined
      }

      if (!shouldRetryForError(error, context)) {
        return undefined
      }

      const ms = resolveDelay(attempt)
      if (ms > 0) {
        await new Promise((r) => setTimeout(r, ms))
      }

      return context.retry({ _retryAttempt: attempt + 1 } as Partial<RequestConfig>)
    }
  }
}
