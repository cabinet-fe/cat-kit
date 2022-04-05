declare type DataType = 'object' | 'array' | 'string' | 'number' | 'blob' | 'date' | 'undefined' | 'function' | 'boolean' | 'file' | 'formdata' | 'symbol' | 'promise' | 'null' | 'arraybuffer';
/**
 * 获取值对应的类型字符串
 * @param value 值
 */
declare function getDataType(value: any): DataType;
/**
 * 是否是对象
 * @param value 值
 */
declare function isObj(value: any): value is Record<string, any>;
/**
 * 是否是数组
 * @param value 值
 */
declare function isArray(value: any): value is Array<any>;
/**
 * 是否是字符串
 * @param value 值
 */
declare function isString(value: any): value is string;
/**
 * 是否是数字
 * @param value 值
 */
declare function isNumber(value: any): value is string;
/**
 * 是否是Blob流
 * @param value 值
 */
declare function isBlob(value: any): value is Blob;
/**
 * 是否是
 * @param value 值
 */
declare function isDate(value: any): value is Date;
/**
 * 是否是未定义
 * @param value 值
 */
declare function isUndef(value: any): value is undefined;
/**
 * 是否是函数
 * @param value 值
 */
declare function isFunction(value: any): value is Function;
/**
 * 是否是布尔值
 * @param value 值
 */
declare function isBol(value: any): value is boolean;
/**
 * 是否是文件
 * @param value 值
 */
declare function isFile(value: any): value is File;
/**
 * 是否是表单数据
 * @param value 值
 */
declare function isFormData(value: any): value is FormData;
/**
 * 是否是Symbol
 * @param value 值
 */
declare function isSymbol(value: any): value is symbol;
/**
 * 是否是Promise
 * @param value 值
 */
declare function isPromise(value: any): value is Promise<any>;
/**
 * 是否是ArrayBuffer
 * @param value 值
 */
declare function isArrayBuffer(value: any): value is ArrayBuffer;
/**
 * 是否是Uint8Array
 * @param value 值
 */
declare function isUint8Array(value: any): value is Uint8Array;
/**
 * 是否是Uint16Array
 * @param value 值
 */
declare function isUint16Array(value: any): value is Uint16Array;
/**
 * 是否是Uint32Array
 * @param value 值
 */
declare function isUint32Array(value: any): value is Uint32Array;
/**
 * 是否是Int8Array
 * @param value 值
 */
declare function isInt8Array(value: any): value is Int8Array;
/**
 * 是否是Int16Array
 * @param value 值
 */
declare function isInt16Array(value: any): value is Int16Array;
/**
 * 是否是Int32Array
 * @param value 值
 */
declare function isInt32Array(value: any): value is Int32Array;
/**
 * 是否是null
 * @param value 值
 */
declare function isNull(value: any): value is null;

declare type Callback<T = any> = (key: CacheKey<T>, value?: T, temp?: {
    value: T;
    exp: number;
}) => void;
interface CacheKey<T = any> extends String {
}
declare function cacheKey<T>(str: string): CacheKey<T>;
declare type ExtractCacheKey<T> = T extends CacheKey<infer K> ? K : never;
declare class WebStorage {
    private store;
    static enabledType: Set<string>;
    callbacks: {
        [key: string]: Callback[];
    };
    constructor(storageType: 'local' | 'session');
    /**
     * 往缓存里添加单条记录
     * @param key 单个值的键
     * @param value 单个值
     * @param exp 单个值的过期时间, 单位秒
     */
    set<T>(key: CacheKey<T>, value: T, exp?: number): WebStorage;
    get<T>(key: CacheKey<T>): T | null;
    get<T>(key: CacheKey<T>, defaultValue: Partial<T>): Partial<T>;
    get<T extends [...any[]]>(keys: [...T]): {
        [I in keyof T]: ExtractCacheKey<T[I]>;
    };
    /**
     * 获取字段过期时间
     * @param key 字段名
     */
    getExpire<T>(key: CacheKey<T>): number;
    /**
     * 移除一个缓存值
     * @param key 需要移除的值的键
     */
    remove(key: CacheKey): WebStorage;
    /**
     * 移除多个缓存值
     * @param keys 需要移除的值的键的数组
     */
    remove(keys: CacheKey[]): WebStorage;
    /**
     * 清空缓存
     */
    remove(): WebStorage;
    /**
     * 添加一个值改动的回调
     * @param key 键
     * @param callback 回调函数
     */
    on(key: string, callback: Callback): void;
    /**
     * 移除多个回调
     * @param keys 需要移除的回调的字符串数组
     */
    off(keys: string[]): void;
    /**
     * 移除单个回调
     * @param key 需要移除的记录的键
     */
    off(key: string): void;
    /**
     * 移除所有回调
     */
    off(): void;
}
declare class WebCache {
    private static session;
    private static local;
    static create(type: 'session' | 'local'): WebStorage;
}

declare const HTTP_CODE: {
    /** 请求头已接收 */
    readonly StatusContinue: 100;
    /** 请求切换协议, 服务端同意切换 */
    readonly StatusSwitchingProtocols: 101;
    /** 正在处理 */
    readonly StatusProcessing: 102;
    /** 在完整应答之前，用于向客户端先返回部分 HTTP 响应头用于提示重要资源的预先加载。 */
    readonly StatusEarlyHints: 103;
    /** 请求成功完成 */
    readonly StatusOK: 200;
    /** 请求成功完成，并且结果是一个或者多个新的资源成功创建 */
    readonly StatusCreated: 201;
    /** 请求被接受，但是处理还没有完成 */
    readonly StatusAccepted: 202;
    /** 203 状态码表示请求成功，但是来自源站的 200 OK 内容被中间的代理服务器做了修改 */
    readonly StatusNonAuthoritativeInfo: 203;
    /** 服务器的响应中不会包括任何内容 */
    readonly StatusNoContent: 204;
    readonly StatusResetContent: 205;
    readonly StatusPartialContent: 206;
    readonly StatusMultiStatus: 207;
    readonly StatusAlreadyReported: 208;
    readonly StatusIMUsed: 226;
    /** 多重选择 */
    readonly StatusMultipleChoices: 300;
    /** 地址永久移动到了新的地址, Location头给出新的URI */
    readonly StatusMovedPermanently: 301;
    readonly StatusFound: 302;
    readonly StatusSeeOther: 303;
    /** 资源未更改, 意味着从缓存中拿到资源 */
    readonly StatusNotModified: 304;
    /** 使用代理 */
    readonly StatusUseProxy: 305;
    readonly StatusTemporaryRedirect: 307;
    readonly StatusPermanentRedirect: 308;
    /** 错误的请求, 通常是请求参数错误 */
    readonly StatusBadRequest: 400;
    /** 未进行授权 */
    readonly StatusUnauthorized: 401;
    readonly StatusPaymentRequired: 402;
    /** 拒绝请求 */
    readonly StatusForbidden: 403;
    /** 资源不存在 */
    readonly StatusNotFound: 404;
    /** 请求方法错误 */
    readonly StatusMethodNotAllowed: 405;
    /** 不接受 */
    readonly StatusNotAcceptable: 406;
    readonly StatusProxyAuthRequired: 407;
    /** 请求超时 */
    readonly StatusRequestTimeout: 408;
    readonly StatusConflict: 409;
    readonly StatusGone: 410;
    readonly StatusLengthRequired: 411;
    readonly StatusPreconditionFailed: 412;
    readonly StatusRequestEntityTooLarge: 413;
    /** 请求的URI太长 */
    readonly StatusRequestURITooLong: 414;
    readonly StatusUnsupportedMediaType: 415;
    readonly StatusRequestedRangeNotSatisfiable: 416;
    readonly StatusExpectationFailed: 417;
    readonly StatusTeapot: 418;
    readonly StatusMisdirectedRequest: 421;
    readonly StatusUnprocessableEntity: 422;
    readonly StatusLocked: 423;
    readonly StatusFailedDependency: 424;
    readonly StatusTooEarly: 425;
    readonly StatusUpgradeRequired: 426;
    readonly StatusPreconditionRequired: 428;
    readonly StatusTooManyRequests: 429;
    readonly StatusRequestHeaderFieldsTooLarge: 431;
    readonly StatusUnavailableForLegalReasons: 451;
    /** 内部服务器错误 */
    readonly StatusInternalServerError: 500;
    readonly StatusNotImplemented: 501;
    /** 错误网关 */
    readonly StatusBadGateway: 502;
    /** 服务不可用 */
    readonly StatusServiceUnavailable: 503;
    /** 网关超时 */
    readonly StatusGatewayTimeout: 504;
    /** http版本不支持 */
    readonly StatusHTTPVersionNotSupported: 505;
    readonly StatusVariantAlsoNegotiates: 506;
    readonly StatusInsufficientStorage: 507;
    readonly StatusLoopDetected: 508;
    readonly StatusNotExtended: 510;
    readonly StatusNetworkAuthenticationRequired: 511;
};
declare type HTTPCode = typeof HTTP_CODE;
declare type HTTPCodeNumber = HTTPCode[keyof HTTPCode];

declare class HttpResponse<T = any> {
    code: HTTPCodeNumber;
    data: T;
    message: string;
    headers: Record<string, any>;
    constructor(code: HTTPCodeNumber, data: any, message: string, headers?: Record<string, any>);
    /** 是否为某个状态码 */
    is(code: HTTPCodeNumber): boolean;
    getHeaders(): Record<string, any>;
}

declare type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
interface RequestConfig {
    url: string;
    baseUrl?: string;
    method?: HTTPMethod;
    headers?: Record<string, string>;
    timeout?: number;
    params?: string | Record<string, any>;
    data?: any;
    responseType?: XMLHttpRequestResponseType;
    /** 是否携带cookie */
    withCredentials?: boolean;
    /** 下载进度 */
    onProgress?: (e: ProgressEvent<EventTarget>) => void;
    /** 上传进度 */
    onUploadProgress?: (e: ProgressEvent<EventTarget>) => void;
}
declare type HTTPBeforeHandler = (
/** 请求的配置 */
conf: Required<RequestConfig>) => Required<RequestConfig> | false | Promise<Required<RequestConfig> | false>;
declare type ResponseReturnType = 'normal' | 'error';
declare type HTTPAfterHandler = (
/** 响应值 */
response: HttpResponse, 
/** 指定值以何种形式返回, 'normal' | 'error' */
returnBy: (type: ResponseReturnType) => void, 
/** 当前返回值抛出的类型 */
returnType: ResponseReturnType) => HttpResponse;
interface HttpOptions {
    baseUrl?: string;
    withCredentials?: boolean;
    timeout?: number;
    headers?: Record<string, string>;
    before?: HTTPBeforeHandler;
    after?: HTTPAfterHandler;
}
declare type AliasRequestConfig = Omit<RequestConfig, 'url' | 'method' | 'data'>;
declare type XHRProps = {
    responseType?: XMLHttpRequestResponseType;
    timeout: number;
    withCredentials: boolean;
};

declare class Http {
    private _config;
    private before;
    private after;
    constructor(options: HttpOptions);
    private xhrSet;
    private setXHRHandlers;
    private setXHRProps;
    /**
     * 标准请求方法
     * @param config 请求选项
     */
    request<T = any>(requestConf: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * 用于获取资源
     * @param url 请求地址
     * @param options 请求选项
     */
    get<T = any>(url: string, options?: AliasRequestConfig): Promise<HttpResponse<T>>;
    /**
     * 用于请求并在服务器新增资源
     * @param url 请求地址
     * @param data 请求主体
     * @param options 请求选项
     */
    post<T = any>(url: string, data?: any, options?: AliasRequestConfig): Promise<HttpResponse<T>>;
    /**
     * 请求资源的头部信息, 一个使用场景在于获取一个资源的Content-Length再决定是否下载
     * @param url 请求地址
     * @param options 请求选项
     */
    head<T>(url: string, options?: AliasRequestConfig): Promise<HttpResponse<T>>;
    /**
     * 用于对资源进行覆盖更新
     * @param url 请求url
     * @param data 请求主体
     * @param options 请求选项
     */
    put<T>(url: string, data?: any, options?: AliasRequestConfig): Promise<HttpResponse<T>>;
    /**
     * 用于对资源进行删除
     * @param url 请求url
     * @param options 请求选项
     */
    delete<T>(url: string, options?: AliasRequestConfig): Promise<HttpResponse<T>>;
    /**
     * 用于对资源进行部分修改
     * @param url 请求url
     * @param data 携带的请求数据
     * @param options 请求选项
     */
    patch<T>(url: string, data?: any, options?: AliasRequestConfig): Promise<HttpResponse<T>>;
    /**
     * 终止请求
     * 一旦调用此方法当前所有的正在请求的实例都会被终止
     */
    abort(): void;
    /**
     * 融合请求参数和默认参数
     * @param options 请求参数
     */
    private mergeConfig;
    /**
     * 获取默认参数配置
     */
    getDefaultConfig(): {
        headers: Record<string, string>;
        baseUrl: string;
        timeout: number;
        withCredentials: boolean;
    };
}

declare const _default: {
    join(...args: string[]): string;
};

/**
 * 获取数组最后一位
 * @param arr 数组
 */
declare function last<T>(arr: T[]): T;
/**
 * 合并多个数组并去重
 * @param arrs 任意多个数组
*/
declare function union<T>(...arrs: T[][]): T[];
/**
 * 合并多个对象数组，并指定去重字段
 * @param key 按照这个字段进行去重
 * @param arrs 任意多个数组
*/
declare function unionBy<T>(key: string, ...arrs: T[]): T[];

/**
 * 返回一个值的空状态
 * @param val 任意值
 */
declare function isEmpty(val: any): boolean;
/**
 * 获取链式值
 * @param o 目标对象
 * @param prop 属性
 * @param targetProp 目标属性
 */
declare function getChainValue(o: any, prop: string, targetProp?: string): any;
/**
 * 是否为给定值中的一种
 * @param value 一个值
 * @param values 所有可能的值
 */
declare function oneOf<K extends string | number>(value: K, values: K[]): boolean;
/**
 * 得到一个值的深拷贝版本
 * @param target 值
 */
declare function deepCopy<T extends any>(this: any, target: T): T;
/**
 * 判断两个值是否结构相等
 * @param v1 值1
 * @param v2 值2
 */
declare function equal(v1: any, v2: any, byKey?: number | string): boolean;
/**
 * 合并对象并返回一个新的对象
 * @param args 参数列表
 */
declare function merge(...args: Record<any, any>[]): Record<any, any> | undefined;

/**
 * 排除一个对象的某些键和值
 * @param target 目标对象
 * @param omitKeys 排除的对象的键的数组
 */
declare function omit<T extends Record<string, any>, K extends keyof T>(target: T, omitKeys: K[]): Omit<T, K>;
/**
 * 从目标对象获取某些属性的值
 * @param target 目标对象
 * @param pickKeys 选择的对象的键的数组
 */
declare function pick<T extends Record<string, any>, K extends keyof T>(target: T, pickKeys: K[]): Pick<T, K>;
/**
 * 对象映射
 * @param obj 目标对象
 * @param mapper 映射函数
 * @returns
 */
declare function objMap<O, K extends keyof O, R>(obj: O, mapper: (val: O[K], key: K) => R): Record<K, R>;
/**
 * 对象循环
 * @param obj 目标对象
 * @param fn 循环中调用的函数
 * @returns
 */
declare function objEach<O, K extends keyof O>(obj: O, fn: (val: O[K], key: K) => void): void;

declare class Dater {
    constructor(date: number | string | Date | Dater);
    private date;
    private static matchers;
    /**
     * 返回私有属性
     * @param key 私有属性
     * @param value 默认值
     * @returns
     */
    private _get;
    private _timestamp?;
    /** 时间戳 */
    get timestamp(): number;
    private _year?;
    /** 年 */
    get year(): number;
    private _month?;
    /** 月 */
    get month(): number;
    private _day?;
    /** 日 */
    get day(): number;
    private _hour?;
    /** 时 */
    get hour(): number;
    private _minute?;
    /** 分 */
    get minute(): number;
    private _second?;
    /** 秒 */
    get second(): number;
    static setMatcher(reg: string, matcher: (date: Date, len: number) => string): void;
    static use(plugin: (dater: typeof Dater) => void): void;
    /** 获取所有的匹配器 */
    static getMatchers(): Record<string, (date: Date, len: number) => string>;
    /** 格式化日期 */
    format(formatter?: string): string;
    /**
     * 计算相对此刻的日期
     * @param timeStep 计算的日期, 负数表示之前的日期, 正数表示之后的日期
     * @param type 时间步长类别, 默认以天为单位
     */
    calc(timeStep: number, type?: 'days' | 'weeks' | 'months' | 'years'): Dater;
    /**
     * 比较日期获取日期差
     */
    compare(date: string | Date | number | Dater): number;
}
interface DateFactory {
    (date?: number | string | Date): Dater;
    /**
     * 虽然可以直接操作Dater的api，但可以使用插件机制来更好的组织你的代码
     * @param plugin 插件
     */
    use: (plugin: (dater: typeof Dater) => void) => void;
    /** 获取所有的匹配器 */
    getMatchers: () => Record<string, (date: Date, len: number) => string>;
    /**
     * 设置匹配器，你可以新增或者覆盖原本的配器
     * @param reg 匹配器名称
     * @param matcher 匹配器
     */
    setMatcher: (reg: string, matcher: (date: Date, len: number) => string) => void;
}
declare const date: DateFactory;

declare type FormatType = 'money' | 'cn_money';
declare class Num {
    private v;
    private static numberFmt;
    private money;
    private cn_money;
    constructor(n: number);
    /**
     * 将数字格式化
     * @param type 格式化类型
     */
    format(type: FormatType): string;
    /**
     * 指定数字最大保留几位小数点
     * @param n 位数
     */
    fixed(n: number): number;
    /**
     * 遍历数字
    */
    each(fn: (n: number) => void): void;
}
interface N {
    (n: number): Num;
}
/**
 * 包裹一个数字以方便
 * @param n 数字
 */
declare const n: N;

/**
 * 压缩图片文件
 * @param file 图片文件
 * @param max 压缩到最大的字节
 */
declare function compressImageFile(file: File, max: number): Promise<File>;

export { AliasRequestConfig, CacheKey, Dater, ExtractCacheKey, HTTPAfterHandler, HTTPBeforeHandler, HTTPMethod, Http, HttpOptions, HttpResponse, RequestConfig, ResponseReturnType, WebCache, XHRProps, cacheKey, compressImageFile, date, deepCopy, equal, getChainValue, getDataType, isArray, isArrayBuffer, isBlob, isBol, isDate, isEmpty, isFile, isFormData, isFunction, isInt16Array, isInt32Array, isInt8Array, isNull, isNumber, isObj, isPromise, isString, isSymbol, isUint16Array, isUint32Array, isUint8Array, isUndef, last, merge, n, objEach, objMap, omit, oneOf, _default as path, pick, union, unionBy };
