import { getDataType } from '@cat-kit/core'
import type { RequestConfig, RequestMethod } from '../types'

export function shouldSendBody(method: RequestMethod): boolean {
  return method !== 'GET' && method !== 'HEAD'
}

export function hasContentType(headers: Record<string, string>): boolean {
  return Object.keys(headers).some(key => key.toLowerCase() === 'content-type')
}

export function buildRequestBody(
  method: RequestMethod,
  body: RequestConfig['body'],
  headers: Record<string, string>
): BodyInit | null {
  if (!body || !shouldSendBody(method)) {
    return null
  }

  const dataType = getDataType(body)
  if (dataType === 'object' || dataType === 'array') {
    if (!hasContentType(headers)) {
      headers['Content-Type'] = 'application/json'
    }
    return JSON.stringify(body)
  }

  return body as BodyInit
}

