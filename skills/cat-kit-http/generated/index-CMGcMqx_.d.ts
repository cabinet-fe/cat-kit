//#region src/engine/engine.d.ts
declare abstract class HttpEngine {
  /**
   * 发送 HTTP 请求
   * @param url 请求 URL
   * @param config 请求配置
   */
  abstract request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>;
  /**
   * 中止 HTTP 请求
   */
  abstract abort(): void;
}
//#endregion
//#region src/types.d.ts
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
/** 请求客户端配置 */
interface ClientConfig {
  /**
   * 源
   * - 由协议、主机名（域名）和端口定义。
   * - 如果未指定，默认为当前页面的`location.href`。
   * - 如果 `url` 已经是一个完整的[URL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL) ，则会忽略此配置。
   */
  origin?: string;
  /**
   * 请求超时时间 (单位：ms)
   * - 默认为0，即不超时
   * - 设置超时时间后，请求会在指定时间后自动终止，并抛出408错误。
   * - 除了上传下载文件，通常情况下，你的普通请求不应该很长。
   */
  timeout?: number;
  /**
   * HTTP默认请求头
   * - 这里指定的是实例请求头配置。
   * - 如果在请求配置中传入了`headers`，则header会被合并，相同的header会被请求配置覆盖。
   */
  headers?: Record<string, string>;
  /**
   * 控制`浏览器`是否发送凭证
   * - 默认发送，即在同源请求时发送凭证。
   * - 如果设置为`false`，则在任何请求时都不会发送凭证。
   * @default true
   */
  credentials?: boolean;
  /**
   * 插件
   * - 插件是一种扩展机制，可以用于修改请求和响应。
   */
  plugins?: HTTPClientPlugin[];
  /**
   * 自定义请求引擎
   * - 未传入时，自动选择 FetchEngine（全局 fetch 可用）或 XHREngine
   * - 可传入自定义 HttpEngine 子类实例以对接其他底层（如 undici、msw mock）
   */
  engine?: HttpEngine;
}
interface RequestConfig {
  /**
   * 请求方法
   * - 默认`GET`
   */
  method?: RequestMethod;
  /**
   * 请求体
   * - ReadableStream数据在不支持fetch的环境下无效
   * - JS对象会被自动转换为JSON字符串，并且会自动设置`Content-Type`为`application/json`
   */
  body?: BodyInit | Record<string, any>;
  /**
   * 查询参数
   * - 如果你在url中也指定了查询参数，那么它们会被合并。
   * - 查询参数会被自动转换为`key=value`的形式
   */
  query?: Record<string, any>;
  /**
   * 请求头
   * @link [查看](https://developer.mozilla.org/zh-CN/docs/Glossary/Request_header)
   */
  headers?: Record<string, string>;
  /** 请求超时时间 */
  timeout?: number;
  /** 请求是否携带凭证 */
  credentials?: boolean;
  /**
   * 响应类型
   * - 'json': 解析为 JSON (默认)
   * - 'text': 解析为文本
   * - 'blob': 解析为 Blob
   * - 'arraybuffer': 解析为 ArrayBuffer
   * @default 'json'
   */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  /** 用户传入的终止信号（per-request） */
  signal?: AbortSignal;
  /** 上传进度（Fetch 引擎下会被静默忽略） */
  onUploadProgress?: (info: ProgressInfo) => void;
  /** 下载进度（需引擎支持流式读取） */
  onDownloadProgress?: (info: ProgressInfo) => void;
  /**
   * @internal 内置重试逻辑写入的重试次数，业务代码勿依赖
   */
  _retryAttempt?: number;
}
/** 传输进度信息 */
interface ProgressInfo {
  /** 已传输字节数 */
  loaded: number;
  /** 总字节数，未知时为 0 */
  total: number;
  /** 进度百分比 0-100，total 为 0 时固定返回 0 */
  percent: number;
}
type AliasRequestConfig = Omit<RequestConfig, 'method'>;
interface HTTPResponse<T = any> {
  /** 响应的数据 */
  data: T;
  /** HTTP状态码 */
  code: number;
  /** 响应标头 */
  headers: Record<string, string>;
  /** 原始响应对象 */
  raw?: Response | any;
}
type HttpErrorCode = 'TIMEOUT' | 'ABORTED' | 'NETWORK' | 'PARSE' | 'UNKNOWN' | 'RETRY_LIMIT_EXCEEDED' | 'PLUGIN';
interface HTTPErrorOptions<T = any> {
  code: HttpErrorCode;
  url?: string;
  config?: RequestConfig;
  response?: HTTPResponse<T>;
  cause?: unknown;
}
declare class HTTPError<T = any> extends Error {
  code: HttpErrorCode;
  url?: string;
  config?: RequestConfig;
  response?: HTTPResponse<T>;
  cause?: unknown;
  constructor(message: string, options: HTTPErrorOptions<T>);
}
interface RequestContext {
  url: string;
  config: RequestConfig;
  /**
   * 与 {@link PluginContext.retry} 相同，供 `onError` 中恢复请求时使用。
   */
  retry?: (patch?: Partial<RequestConfig>) => Promise<HTTPResponse>;
}
/** 插件在 afterRespond 中可用的上下文 */
interface PluginContext {
  /** 重试当前请求，可传入部分配置覆盖（与原始请求配置合并） */
  retry: (config?: Partial<RequestConfig>) => Promise<HTTPResponse>;
}
/**
 * 插件钩子返回类型
 */
interface PluginHookResult {
  /** 修改后的 URL */
  url?: string;
  /** 修改后的请求配置 */
  config?: RequestConfig;
}
/** 请求客户端插件 */
interface HTTPClientPlugin {
  /** 插件名称 */
  name: string;
  /**
   * 请求前钩子
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的 URL 和请求选项
   */
  beforeRequest?(url: string, config: RequestConfig): Promise<PluginHookResult | void> | PluginHookResult | void;
  /**
   * 响应后钩子
   * @param response 响应对象
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的响应对象
   */
  afterRespond?(response: HTTPResponse, url: string, config: RequestConfig, context?: PluginContext): Promise<HTTPResponse | void> | HTTPResponse | void;
  /**
   * 错误钩子
   * - 请求链中出现错误时触发
   * - 返回 HTTPResponse 时视为错误已恢复，以首个非空返回为准；后续插件仍会执行
   */
  onError?(error: unknown, context: RequestContext): Promise<HTTPResponse | void> | HTTPResponse | void;
}
type ClientPlugin = HTTPClientPlugin;
//#endregion
//#region src/client.d.ts
/** 插件触发的单次请求最多允许的重试次数（retryCount 0 为首次，共最多 11 次尝试） */
declare const MAX_PLUGIN_RETRIES = 10;
/**
 * 合并请求配置：headers / query 做对象级合并；标量类字段仅在 patch 显式传入且非 undefined 时覆盖。
 * `undefined` 不用于清空已有配置。
 */
declare function mergeRequestConfig(base: RequestConfig, patch: RequestConfig): RequestConfig;
/**
 * HTTP 请求客户端
 *
 * 提供了一个符合人体工学的，跨端(node 和浏览器)的 HTTP 请求客户端。
 * 支持插件系统，可以灵活地组合和增强请求客户端。
 *
 * @example
 * ```ts
 * import { HTTPClient } from '@cat-kit/http'
 *
 * const http = new HTTPClient('/api', {
 *   origin: 'http://localhost:8080',
 *   timeout: 30 * 1000
 * })
 *
 * // 发起请求
 * http.request('/user', { method: 'get' }).then(res => {
 *   // ...do some things
 * })
 *
 * // 请求别名
 * http.get('/user', { query: { name: 'Zhang San' } }).then(res => {
 *   // ...do some things
 * })
 * ```
 */
declare class HTTPClient {
  /** 请求前缀 */
  private prefix;
  /** 客户端配置 */
  private config;
  /** 请求引擎 */
  private engine;
  /** 父 client（仅由 group() 内部赋值；根 client 为 undefined） */
  private parent?;
  /** 当前 client 自身持有的插件列表（不含父链继承） */
  private ownPlugins;
  /**
   * 创建 HTTP 客户端实例
   * @param prefix 请求前缀
   * @param config 客户端配置
   */
  constructor(prefix?: string, config?: ClientConfig);
  /**
   * 计算当前 client 在运行时生效的插件列表：父链在前、子在后
   */
  private getEffectivePlugins;
  /**
   * 注册插件（运行时动态装配）
   * - 插件必须拥有非空字符串 `name`，否则抛 HTTPError({ code: 'PLUGIN' })
   * - 插件名在 client 自身及其父链范围内必须唯一，冲突时抛 HTTPError({ code: 'PLUGIN' })
   */
  registerPlugin(plugin: HTTPClientPlugin): void;
  private registerPluginInternal;
  private getRequestUrl;
  private isAbsoluteUrl;
  private appendQueryParams;
  /**
   * 获取请求配置
   * @param config 当前请求配置
   * @returns 合并后的请求配置
   */
  private getRequestConfig;
  private runOnErrorPlugins;
  private _executeRequest;
  /**
   * 发送 HTTP 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<HTTPResponse>
   */
  request<T = any>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>;
  /**
   * 发送 GET 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  get<T>(url: string, config?: AliasRequestConfig): Promise<HTTPResponse<T>>;
  /**
   * 发送 POST 请求
   * @param url 请求地址
   * @param body 请求体
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  post<T = any>(url: string, body?: RequestConfig['body'], config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HTTPResponse<T>>;
  /**
   * 发送 PUT 请求
   * @param url 请求地址
   * @param body 请求体
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  put<T = any>(url: string, body?: RequestConfig['body'], config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HTTPResponse<T>>;
  /**
   * 发送 DELETE 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  delete<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>;
  /**
   * 发送 PATCH 请求
   * @param url 请求地址
   * @param body 请求体
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  patch<T = any>(url: string, body?: RequestConfig['body'], config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HTTPResponse<T>>;
  /**
   * 发送 HEAD 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  head<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>;
  /**
   * 发送 OPTIONS 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  options<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>;
  /**
   * 中止所有请求
   */
  abort(): void;
  /**
   * 创建请求分组
   * @param prefix 分组前缀
   * @returns HTTPClient 新的客户端实例
   *
   * 插件继承语义：
   * - 子 client 通过父链继承插件；父后续 `registerPlugin` 会自动反映到子（父影响子）
   * - 子 `registerPlugin` 仅改动 `child.ownPlugins`（子不影响父）
   * - 同名校验跨父子层级生效
   *
   * 注意：父子共享同一 `engine` 实例，`abort()` 会中止父或子任意一方触发该引擎的所有在途请求。
   *
   * @example
   * ```ts
   * const http = new HTTPClient()
   * const userGroup = http.group('/user')
   *
   * // 等同于 http.get('/user/profile')
   * userGroup.get('/profile')
   *
   * // 中止分组中的所有请求
   * userGroup.abort()
   * ```
   */
  group(prefix: string): HTTPClient;
}
//#endregion
//#region src/engine/xhr.d.ts
declare class XHREngine extends HttpEngine {
  /** 请求中的实例 */
  private xhrSets;
  request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>;
  /**
   * 解析响应头
   * @param headerStr 响应头字符串
   * @returns 解析后的响应头对象
   */
  private parseHeaders;
  sendHeaders(xhr: XMLHttpRequest, headers: Record<string, string>): void;
  abort(): void;
}
//#endregion
//#region src/engine/fetch.d.ts
declare class FetchEngine extends HttpEngine {
  private controllers;
  request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>;
  private parseResponseWithDownloadProgress;
  private decodeResponseBody;
  private parseResponseData;
  abort(): void;
}
//#endregion
//#region src/plugins/method-override.d.ts
/**
 * 方法重写插件配置
 */
interface HTTPMethodOverridePluginOptions {
  /**
   * 需要被重写的请求方法
   * - 默认为 ['DELETE', 'PUT', 'PATCH']
   */
  methods?: RequestMethod[];
  /**
   * 重写后的请求方法
   * - 默认为 'POST'
   */
  overrideMethod?: RequestMethod;
  /**
   * 方法覆盖请求头名称
   * - 默认为 'X-HTTP-Method-Override'
   */
  headerName?: string;
}
type MethodOverridePluginOptions = HTTPMethodOverridePluginOptions;
/**
 * 方法重写插件
 *
 * 用于绕过某些环境对特定 HTTP 方法的限制
 *
 * @example
 * ```ts
 * import { MethodOverridePlugin, HTTPClient } from '@cat-kit/http'
 * const http = new HTTPClient('', {
 *   plugins: [
 *     MethodOverridePlugin()
 *   ]
 * })
 * ```
 */
declare function HTTPMethodOverridePlugin(options?: HTTPMethodOverridePluginOptions): HTTPClientPlugin;
declare const MethodOverridePlugin: typeof HTTPMethodOverridePlugin;
//#endregion
//#region src/plugins/retry.d.ts
interface RetryPluginOptions {
  maxRetries?: number;
  delay?: number | ((attempt: number) => number);
  retryOn?: (error: unknown, context: RequestContext) => boolean;
  retryOnStatus?: number[];
}
/**
 * 在请求失败时按策略自动重试（通过 `onError` + `context.retry`）。
 */
declare function RetryPlugin(options?: RetryPluginOptions): HTTPClientPlugin;
//#endregion
//#region src/plugins/token.d.ts
/**
 * Token 插件配置
 */
interface HTTPTokenPluginOptions {
  /**
   * 获取令牌的方法
   * - 可以是同步或异步的
   * - 返回 null 或 undefined 时不会添加令牌
   * - 建议从内存中获取，例如状态管理中获取
   */
  getter: () => string | null | undefined | Promise<string | null | undefined>;
  /**
   * 请求头名称
   * @default 'Authorization'
   */
  headerName?: string;
  /**
   * 授权类型
   * - 'Bearer': Bearer 令牌 (默认)
   * - 'Basic': Basic 认证
   * - 'Custom': 自定义，需要提供 formatter
   */
  authType?: 'Bearer' | 'Basic' | 'Custom';
  /**
   * 自定义令牌格式化方法
   * - 仅在 authType 为 'Custom' 时有效
   * - 用于自定义令牌的格式
   */
  formatter?: (token: string) => string;
  /**
   * 刷新令牌回调；刷新完成后通过 `getter` 取新 token
   */
  onRefresh?: () => Promise<void>;
  /** 为 true 时触发刷新流程（在 beforeRequest 中） */
  isExpired?: () => boolean;
  /** 为 true 时视为 refresh_token 已过期 */
  isRefreshExpired?: () => boolean;
  /**
   * 基于业务响应判断是否需要刷新（如 401）
   * - 为 true 且需重试时须同时配置 {@link TokenPluginOptions.onRefresh}，否则不会发起 `retry`
   */
  shouldRefresh?: (response: HTTPResponse) => boolean;
  /** refresh_token 过期时回调（如登出） */
  onRefreshExpired?: () => void;
}
type TokenPluginOptions = HTTPTokenPluginOptions;
/**
 * Token 插件
 * 用于自动在请求头中添加令牌
 *
 * @example
 * ```ts
 * import { TokenPlugin, HTTPClient } from '@cat-kit/http'
 *
 * const http = new HTTPClient('', {
 *   plugins: [
 *     TokenPlugin({
 *       // 获取 token 的方法，可以是异步的
 *       getter: () => localStorage.getItem('token'),
 *       // 授权类型，默认是 Bearer
 *       authType: 'Bearer'
 *     })
 *   ]
 * })
 * ```
 */
declare function HTTPTokenPlugin(options: HTTPTokenPluginOptions): HTTPClientPlugin;
declare const TokenPlugin: typeof HTTPTokenPlugin;
//#endregion
export { AliasRequestConfig, ClientConfig, ClientPlugin, FetchEngine, HTTPClient, HTTPClientPlugin, HTTPError, HTTPErrorOptions, HTTPMethodOverridePlugin, HTTPMethodOverridePluginOptions, HTTPResponse, HTTPTokenPlugin, HTTPTokenPluginOptions, HttpEngine, HttpErrorCode, MAX_PLUGIN_RETRIES, MethodOverridePlugin, MethodOverridePluginOptions, PluginContext, PluginHookResult, ProgressInfo, RequestConfig, RequestContext, RequestMethod, RetryPlugin, RetryPluginOptions, TokenPlugin, TokenPluginOptions, XHREngine, mergeRequestConfig };