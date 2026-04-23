import { getDataType } from '@cat-kit/core'

import type { RequestConfig, RequestMethod } from '../types'

export function shouldSendBody(method: RequestMethod): boolean {
  return method !== 'GET' && method !== 'HEAD'
}

export function hasContentType(headers: Record<string, string>): boolean {
  return Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')
}

export function inferResponseType(
  contentType: string | null
): NonNullable<RequestConfig['responseType']> {
  if (!contentType) return 'text'
  const ct = contentType.toLowerCase()
  if (ct.includes('application/json')) return 'json'
  if (ct.startsWith('text/')) return 'text'
  if (
    ct.includes('application/octet-stream') ||
    ct.startsWith('image/') ||
    ct.startsWith('video/') ||
    ct.startsWith('audio/') ||
    ct.includes('application/pdf')
  ) {
    return 'blob'
  }
  return 'text'
}

export function buildRequestBody(
  method: RequestMethod,
  body: RequestConfig['body'],
  headers: Record<string, string>
): BodyInit | null {
  if (!body || !shouldSendBody(method)) {
    return null
  }

  if (body instanceof URLSearchParams) {
    if (!hasContentType(headers)) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
    return body
  }

  if (body instanceof FormData) {
    return body
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
