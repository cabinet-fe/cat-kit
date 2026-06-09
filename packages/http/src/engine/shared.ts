import { getDataType } from '@cat-kit/core'

import type { RequestConfig, RequestMethod } from '../types'

/** GET / HEAD 请求不应携带 body */
export function shouldSendBody(method: RequestMethod): boolean {
  return method !== 'GET' && method !== 'HEAD'
}

/** 检查 headers 中是否已设置 Content-Type（大小写不敏感） */
export function hasContentType(headers: Record<string, string>): boolean {
  return Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')
}

/**
 * 根据响应 Content-Type 头推断合适的解析类型
 * - 未传入或无法识别时默认返回 'json'
 */
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

/**
 * 根据请求方法和 body 类型构建请求体，同时自动设置 Content-Type
 * - GET/HEAD 方法跳过 body
 * - 对象/数组 → JSON.stringify + Content-Type: application/json
 * - URLSearchParams → 设置 Content-Type: application/x-www-form-urlencoded
 * - FormData → 原样返回，不设置 Content-Type（由浏览器处理）
 */
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
