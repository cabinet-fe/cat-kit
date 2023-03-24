export const HTTP_CODE = {
  /** 请求头已接收 */
  StatusContinue: 100, // RFC 7231, 6.2.1
  /** 请求切换协议, 服务端同意切换 */
  StatusSwitchingProtocols: 101, // RFC 7231, 6.2.2
  /** 正在处理 */
  StatusProcessing: 102, // RFC 2518, 10.1
  /** 在完整应答之前，用于向客户端先返回部分 HTTP 响应头用于提示重要资源的预先加载。 */
  StatusEarlyHints: 103, // RFC 8297

  /** 请求成功完成 */
  StatusOK: 200, // RFC 7231, 6.3.1
  /** 请求成功完成，并且结果是一个或者多个新的资源成功创建 */
  StatusCreated: 201, // RFC 7231, 6.3.2
  /** 请求被接受，但是处理还没有完成 */
  StatusAccepted: 202, // RFC 7231, 6.3.3
  /** 203 状态码表示请求成功，但是来自源站的 200 OK 内容被中间的代理服务器做了修改 */
  StatusNonAuthoritativeInfo: 203, // RFC 7231, 6.3.4
  /** 服务器的响应中不会包括任何内容 */
  StatusNoContent: 204, // RFC 7231, 6.3.5

  StatusResetContent: 205, // RFC 7231, 6.3.6
  StatusPartialContent: 206, // RFC 7233, 4.1
  StatusMultiStatus: 207, // RFC 4918, 11.1
  StatusAlreadyReported: 208, // RFC 5842, 7.1
  StatusIMUsed: 226, // RFC 3229, 10.4.1

  /** 多重选择 */
  StatusMultipleChoices: 300, // RFC 7231, 6.4.1
  /** 地址永久移动到了新的地址, Location头给出新的URI */
  StatusMovedPermanently: 301, // RFC 7231, 6.4.2
  StatusFound: 302, // RFC 7231, 6.4.3
  StatusSeeOther: 303, // RFC 7231, 6.4.4
  /** 资源未更改, 意味着从缓存中拿到资源 */
  StatusNotModified: 304, // RFC 7232, 4.1
  /** 使用代理 */
  StatusUseProxy: 305, // RFC 7231, 6.4.5

  StatusTemporaryRedirect: 307, // RFC 7231, 6.4.7
  StatusPermanentRedirect: 308, // RFC 7538, 3

  // 客户端错误
  /** 错误的请求, 通常是请求参数错误 */
  StatusBadRequest: 400, // RFC 7231, 6.5.1
  /** 未进行授权 */
  StatusUnauthorized: 401, // RFC 7235, 3.1
  StatusPaymentRequired: 402, // RFC 7231, 6.5.2
  /** 拒绝请求 */
  StatusForbidden: 403, // RFC 7231, 6.5.3
  /** 资源不存在 */
  StatusNotFound: 404, // RFC 7231, 6.5.4
  /** 请求方法错误 */
  StatusMethodNotAllowed: 405, // RFC 7231, 6.5.5
  /** 不接受 */
  StatusNotAcceptable: 406, // RFC 7231, 6.5.6
  StatusProxyAuthRequired: 407, // RFC 7235, 3.2
  /** 请求超时 */
  StatusRequestTimeout: 408, // RFC 7231, 6.5.7
  StatusConflict: 409, // RFC 7231, 6.5.8
  StatusGone: 410, // RFC 7231, 6.5.9
  StatusLengthRequired: 411, // RFC 7231, 6.5.10
  StatusPreconditionFailed: 412, // RFC 7232, 4.2
  StatusRequestEntityTooLarge: 413, // RFC 7231, 6.5.11
  /** 请求的URI太长 */
  StatusRequestURITooLong: 414, // RFC 7231, 6.5.12
  StatusUnsupportedMediaType: 415, // RFC 7231, 6.5.13
  StatusRequestedRangeNotSatisfiable: 416, // RFC 7233, 4.4
  StatusExpectationFailed: 417, // RFC 7231, 6.5.14
  StatusTeapot: 418, // RFC 7168, 2.3.3
  StatusMisdirectedRequest: 421, // RFC 7540, 9.1.2
  StatusUnprocessableEntity: 422, // RFC 4918, 11.2
  StatusLocked: 423, // RFC 4918, 11.3
  StatusFailedDependency: 424, // RFC 4918, 11.4
  StatusTooEarly: 425, // RFC 8470, 5.2.
  StatusUpgradeRequired: 426, // RFC 7231, 6.5.15
  StatusPreconditionRequired: 428, // RFC 6585, 3
  StatusTooManyRequests: 429, // RFC 6585, 4
  StatusRequestHeaderFieldsTooLarge: 431, // RFC 6585, 5
  StatusUnavailableForLegalReasons: 451, // RFC 7725, 3

  // 服务器错误
  /** 内部服务器错误 */
  StatusInternalServerError: 500, // RFC 7231, 6.6.1
  StatusNotImplemented: 501, // RFC 7231, 6.6.2
  /** 错误网关 */
  StatusBadGateway: 502, // RFC 7231, 6.6.3
  /** 服务不可用 */
  StatusServiceUnavailable: 503, // RFC 7231, 6.6.4
  /** 网关超时 */
  StatusGatewayTimeout: 504, // RFC 7231, 6.6.5
  /** http版本不支持 */
  StatusHTTPVersionNotSupported: 505, // RFC 7231, 6.6.6
  StatusVariantAlsoNegotiates: 506, // RFC 2295, 8.1
  StatusInsufficientStorage: 507, // RFC 4918, 11.5
  StatusLoopDetected: 508, // RFC 5842, 7.2
  StatusNotExtended: 510, // RFC 2774, 7
  StatusNetworkAuthenticationRequired: 511 // RFC 6585, 6
} as const

type HTTPCode = typeof HTTP_CODE

export type HTTPCodeNumber = HTTPCode[keyof HTTPCode]
