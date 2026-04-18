//#region src/data/type.d.ts
type DataType = 'object' | 'array' | 'string' | 'number' | 'blob' | 'date' | 'undefined' | 'function' | 'boolean' | 'file' | 'formdata' | 'symbol' | 'promise' | 'null' | 'arraybuffer';
/**
 * 获取值对应的类型字符串
 * @param value 值
 * @returns 类型字符串
 */
declare function getDataType(value: any): DataType;
/**
 * 是否是对象
 * @param value 值
 */
declare function isObj(value: any): value is Record<string, any>;
/**
 * 是否是数组。实现委托 `Array.isArray`，与原生「是否为数组」的结论一致（含跨 realm 等边界）。
 * 若仅需布尔判断且不需要本包导出的类型守卫，可直接使用 `Array.isArray`。
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
declare function isNumber(value: any): value is number;
/**
 * 是否是Blob
 * @param value 值
 */
declare function isBlob(value: any): value is Blob;
/**
 * 是否是
 * @param value 值
 */
declare function isDate(value: any): value is Date;
/**
 * 是否是函数
 * @param value 值
 */
declare function isFunction(value: any): value is Function;
/**
 * 是否是布尔值
 * @param value 值
 */
declare function isBool(value: any): value is boolean;
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
/**
 * 是否是未定义
 * @param value 值
 */
declare function isUndef(value: any): value is undefined;
/**
 * 是否是空值, 当值为null或undefined时返回true
 * @param value 值
 */
declare function isEmpty(value: any): boolean;
//#endregion
//#region src/data/object.d.ts
declare class CatObject<O extends Record<string, any>, K extends keyof O = keyof O> {
  readonly raw: O;
  constructor(object: O);
  /**
   * 获取对象的所有键
   * @returns 对象的键组成的元组类型
   */
  keys(): string[];
  /**
   * 遍历对象
   * @param callback 回调，第一个参数是对象key，第二个参数是key对应的value
   * @returns 当前对象
   */
  each(callback: (key: string, value: any) => void): CatObject<O, K>;
  /**
   * 挑选对象的key，生成新的对象
   * @param keys 需要挑选的key
   * @returns 新的对象
   */
  pick<KK extends K>(keys: KK[]): Pick<O, KK>;
  /**
   * 忽略对象的key，生成新的对象
   * @param keys 需要忽略的key
   * @returns 新的对象
   */
  omit<KK extends K>(keys: KK[]): Omit<O, KK>;
  /**
   * 从其他对象中继承属性，只继承当前对象中存在的属性
   * @param source 继承的目标
   * @returns 当前对象
   */
  extend(source: Record<string, any>[] | Record<string, any>): O;
  /**
   * 从其他对象中深度继承属性，只继承当前对象中存在的属性
   * @param source 继承的目标
   * @returns 当前对象
   */
  deepExtend(source: Record<string, any>[] | Record<string, any>): O;
  /**
   * 结构化拷贝
   * @description 注意，如果对象中存在函数，则函数不会被拷贝
   * @returns 新的对象
   */
  copy(): O;
  private static merge;
  /**
   * 将其他对象合并到当前对象
   * @param source 需要合并的对象
   * @returns 当前对象
   */
  merge(source: Record<string, any>[] | Record<string, any>): O;
  /**
   * 获取对象的值
   *
   * @param prop 需要获取的属性, 可以是链式的属性
   *
   * @returns 值
   */
  get<T extends any = any>(prop: string): T | undefined;
  /**
   * 设置对象的值
   * @param prop 需要设置的属性
   * @param value 需要设置的值
   * @returns 当前对象
   */
  set(prop: string, value: any): Record<string, any>;
}
declare function o<O extends Record<string, any>>(object: O): CatObject<O>;
//#endregion
//#region src/data/string.d.ts
declare class CatString {
  private raw;
  constructor(str: string);
  /**
   * 将字符串转换为驼峰命名
   * @param type 驼峰类型：'lower'为小驼峰(lowerCamelCase)，'upper'为大驼峰(UpperCamelCase)
   * @returns 驼峰命名后的字符串
   * @example
   * ```ts
   * str('hello-world').camelCase() // 'helloWorld'
   * str('hello-world').camelCase('upper') // 'HelloWorld'
   * ```
   */
  camelCase(type?: 'lower' | 'upper'): string;
  /**
   * 将字符串转换为连字符命名(kebab-case)
   * @returns 连字符命名后的字符串
   * @example
   * ```ts
   * str('helloWorld').kebabCase() // 'hello-world'
   * ```
   */
  kebabCase(): string;
}
/**
 * 创建一个字符串操作对象
 * @param str 需要操作的字符串
 * @returns 字符串操作对象
 * @example
 * ```ts
 * const s = str('hello-world')
 * s.camelCase() // 'helloWorld'
 * s.kebabCase() // 'hello-world'
 * ```
 */
declare function str(str: string): CatString;
declare const $str: {
  /**
   * 拼接URL路径
   * @param firstPath 第一个路径
   * @param paths 需要拼接的路径
   * @returns 拼接后的路径
   * @example
   * ```ts
   * $str.joinUrlPath('https://example.com', 'path', 'to', 'resource') // 'https://example.com/path/to/resource'
   * ```
   */
  joinUrlPath(firstPath: string, ...paths: string[]): string;
};
//#endregion
//#region src/data/array.d.ts
type Last<T> = T extends [...any, infer L] ? L : T extends (infer P)[] ? P : undefined;
/**
 * 获取数组最后一位
 * @param arr 数组
 */
declare function last<T extends any[]>(arr: [...T]): Last<T>;
declare function last<T extends any[]>(arr: readonly [...T]): Last<T>;
/**
 * 合并多个数组并去重
 * @param arrList 任意多个数组
 */
declare function union<T>(...arrList: T[][]): T[];
/**
 * 合并多个对象数组，并指定去重字段
 * @param key 按照这个字段进行去重
 * @param arrList 任意多个数组
 */
declare function unionBy<T extends Record<string, any>>(key: string, ...arrList: T[][]): T[];
/**
 * 数组从右到左的回调
 * @param arr 数组
 * @param cb 回调
 */
declare function eachRight<T>(arr: T[], cb: (v: T, i: number, arr: T[]) => void): void;
/**
 * 丢弃数组中指定的索引的元素
 * @param arr 数组
 * @param indexes 索引或者索引列表
 */
declare function omitArr<T>(arr: T[], indexes: number | number[]): T[];
declare class Arr<T> {
  private _source;
  constructor(arr: T[]);
  /**
   * 从右往左遍历
   * @param cb 回调
   */
  eachRight(cb: (v: T, i: number, arr: T[]) => void): void;
  /**
   * 丢弃元素
   * @param index 索引
   * @returns
   */
  omit(index: number | number[]): T[];
  /**
   * 查询
   * @param condition 查询条件
   * @returns
   */
  find(condition: Record<string, any>): T | undefined;
  /** 最后一个元素 */
  get last(): T | undefined;
  /**
   * 移动元素至某个新的位置
   * @param from 原索引
   * @param to 目标索引
   * @returns
   */
  move(from: number, to: number): T[];
  /**
   * 分组，返回一个对象，key为分组的值，value为分组的元素
   * @param cb 分组回调, 返回值为分组的值
   * @returns 分组后的对象
   */
  groupBy<K extends string | number>(cb: (item: T) => K): Record<K, T[]>;
}
declare function arr<T>(arr: T[]): Arr<T>;
//#endregion
//#region src/data/number.d.ts
/**
 * 数字处理工具库
 * 提供数字格式化、货币格式化、高精度计算等功能
 */
type CurrencyType = 'CNY' | 'CNY_HAN';
/** 货币格式化配置 */
type CurrencyConfig = {
  /** 保留小数位数 */
  precision?: number;
  /** 最小小数位数 */
  minPrecision?: number;
  /** 最大小数位数 */
  maxPrecision?: number;
};
/**
 * 数字包装类, 提供链式调用
 */
declare class Num {
  private v;
  constructor(n: number);
  /**
   * 数字转货币
   * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
   * @param config 其他配置, 仅precision对CNY_HAN生效
   * @returns
   */
  currency(currencyType: CurrencyType, config: CurrencyConfig): string;
  /**
   * 数字转货币
   * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
   * @param precision 精度, 为CNY_HAN时最大和默认只能支持到小数点后四位(厘)
   * @returns
   */
  currency(currencyType: CurrencyType, precision?: number): string;
  /**
   * 指定数字最大保留几位小数点
   * @param precision 位数
   * @returns 格式化后的字符串
   * @example n(1.2345).fixed(2) // '1.23'
   */
  fixed(precision: number | {
    /** 最小精度 */
    minPrecision?: number;
    /** 最大精度 */
    maxPrecision?: number;
  }): string;
  /**
   * 遍历数字 (从 1 到 v)
   * @param fn 回调函数
   * @returns Num 实例
   * @example n(3).each(i => console.log(i)) // 1, 2, 3
   */
  each(fn: (n: number) => void): Num;
  /**
   * 大小区间 (限制在 min 和 max 之间)
   * @param min 最小值
   * @param max 最大值
   * @returns 一个在指定范围内的值
   * @example n(5).range(0, 10) // 5
   * @example n(-5).range(0, 10) // 0
   */
  range(min: number, max: number): number;
  /**
   * 限制最大值 (不超过 val)
   * @param val 最大值
   * @returns 一个不超过最大值的值
   * @example n(10).max(5) // 5
   */
  max(val: number): number;
  /**
   * 限制最小值 (不小于 val)
   * @param val 最小值
   * @returns  一个不小于最小值的值
   * @example n(1).min(5) // 5
   */
  min(val: number): number;
}
/**
 * 创建一个 Num 实例，用于链式调用
 * @param n 数字
 */
declare function n(n: number): Num;
/** 数字格式化选项 */
interface NumberFormatterOptions {
  /** 数字格式的样式 decimal:十进制, currency货币, percent百分比 */
  style?: 'decimal' | 'currency' | 'percent';
  /** 货币符号, 如果style为currency则默认CNY人民币 */
  currency?: 'CNY' | 'USD' | 'JPY' | 'EUR';
  /** 小数精度(小数点位数) */
  precision?: number;
  /** 最大小数位数, 默认3 */
  maximumFractionDigits?: number;
  /** 最小小数位数 */
  minimumFractionDigits?: number;
  /** 表现方法, standard: 标准, scientific: 科学计数法, engineering: 引擎, compact: 简洁计数   */
  notation?: Intl.NumberFormatOptions['notation'];
}
declare const $n: {
  /**
   * 创建数字格式化器
   * @param options 格式化选项
   */
  formatter(options: NumberFormatterOptions): Intl.NumberFormat;
  /**
   * 依次相加 (解决浮点数精度问题)
   * @param numbers 数字列表
   * @returns 相加结果
   * @example $n.plus(0.1, 0.2) // 0.3
   */
  plus(...numbers: number[]): number;
  /**
   * 依次相减 (解决浮点数精度问题)
   * @param numbers 数字列表
   * @returns 相减结果
   * @example $n.minus(1.0, 0.9) // 0.1
   */
  minus(...numbers: number[]): number;
  /**
   * 两数相乘 (解决浮点数精度问题)
   * @param num1 数字1
   * @param num2 数字2
   * @returns 相乘结果
   * @example $n.mul(19.9, 100) // 1990
   */
  mul(num1: number, num2: number): number;
  /**
   * 两数相除 (解决浮点数精度问题)
   * @param num1 被除数
   * @param num2 除数
   * @returns 相除结果
   * @example $n.div(0.3, 0.1) // 3
   */
  div(num1: number, num2: number): number;
  /**
   * 求和 (同 plus)
   * @param numbers 需要求和的数字
   * @returns 总和
   */
  sum(...numbers: number[]): number;
  /**
   * 计算表达式
   * @param expr 表达式字符串, 如 '1 + 3 * (4 / 2)'
   * @throws {Error} 如果表达式为空
   */
  calc(expr: string): number;
};
//#endregion
//#region src/data/transform.d.ts
/** 定义转换方法的类型 */
type TransformMethod = (val: any) => any;
/**
 * 将字符串转换为 Uint8Array
 *
 * 优先使用标准 `TextEncoder`；不可用时在 Node 回退到 `Buffer`，以统一跨环境入口。
 * 与手写 `new TextEncoder().encode` 等价（在支持 `TextEncoder` 的环境下）。
 *
 * @param data 输入字符串
 * @returns Uint8Array 类型的数据
 * @throws 当环境不支持转换时抛出错误
 */
declare function str2u8a(data: string): Uint8Array;
/**
 * 将 Uint8Array 转换为字符串
 *
 * 优先使用标准 `TextDecoder`；不可用时在 Node 回退到 `Buffer`，以统一跨环境入口。
 *
 * @param data Uint8Array 类型的数据
 * @returns 转换后的字符串
 * @throws 当环境不支持转换时抛出错误
 */
declare function u8a2str(data: Uint8Array): string;
/**
 * 将 Uint8Array 转换为十六进制字符串
 * @param u8a Uint8Array 类型的数据
 * @returns 十六进制字符串
 */
declare function u8a2hex(u8a: Uint8Array): string;
/**
 * 将十六进制字符串转换为 Uint8Array
 * @param hex 十六进制字符串（可选 `0x` 前缀；忽略首尾空白）
 * @returns 空串或仅空白时返回长度为 0 的 `Uint8Array`
 * @throws 长度为奇数、或含非十六进制字符时抛出 `Error`
 */
declare function hex2u8a(hex: string): Uint8Array;
/**
 * 将 Base64 字符串转换为 Uint8Array
 * @param base64 Base64 字符串
 * @returns Uint8Array 类型的数据
 */
declare function base642u8a(base64: string): Uint8Array;
/**
 * 将 Uint8Array 转换为 Base64 字符串
 * @param u8a Uint8Array 类型的数据
 * @returns Base64 字符串
 */
declare function u8a2base64(u8a: Uint8Array): string;
/**
 * 将对象转换为 URL 查询字符串
 *
 * **并非** `URLSearchParams` 的常规表单语义：空值与 `encodeURIComponent(JSON.stringify(value))` 序列化非原始值，
 * 与原生查询串互操作前请先对照行为，避免误替换导致不一致。
 *
 * @param obj 要转换的对象
 * @returns URL 查询字符串（不包含开头的 ?）
 */
declare function obj2query(obj: Record<string, any>): string;
/**
 * 将 URL 查询字符串转换为对象
 *
 * 与 {@link obj2query} 成对：`JSON.parse` 可解析的值还原为对象/数组等，否则保留解码后的字符串。
 * 与仅用 `URLSearchParams` 解析的键值对语义不同，勿与原生 API 混用假设。
 *
 * @param query URL 查询字符串（可以包含开头的 ?）
 * @returns 转换后的对象
 */
declare function query2obj(query: string): Record<string, any>;
/**
 * 数据转换
 * @param data 需要转换的原始数据
 * @param transformChain 转换链，按顺序执行
 * @returns 转换后的数据
 */
declare function transform<T extends TransformMethod>(data: any, transformChain: [...TransformMethod[], T]): ReturnType<T>;
//#endregion
//#region src/data/validator.d.ts
/**
 * 校验问题描述
 */
interface ValidationIssue {
  /**
   * 问题路径（对象字段路径，使用 `.` 连接）
   *
   * @example
   * - `name`
   * - `profile.birthday`
   * - `items.0.id`
   */
  path: string;
  /**
   * 人类可读的错误信息
   */
  message: string;
}
type SafeParseResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  issues: ValidationIssue[];
};
/**
 * 解析器：将 unknown 解析为目标类型，失败时返回 issues
 */
type Parser<T> = (input: unknown) => SafeParseResult<T>;
/**
 * 解析失败异常（用于 `parse()`）
 */
declare class ValidationError extends Error {
  readonly issues: ReadonlyArray<ValidationIssue>;
  constructor(issues: ValidationIssue[]);
}
interface Validator<T> {
  /**
   * 安全解析：失败不抛错，返回 issues
   */
  safeParse(input: unknown): SafeParseResult<T>;
  /**
   * 解析：失败抛出 `ValidationError`
   */
  parse(input: unknown): T;
}
/**
 * 从 Parser 创建 Validator
 */
declare function createValidator<T>(parser: Parser<T>): Validator<T>;
type InferParser<P> = P extends Parser<infer T> ? T : never;
/**
 * 从对象 schema 推断输出类型
 */
type InferObjectSchema<S extends Record<string, Parser<any>>> = { [K in keyof S]: InferParser<S[K]> };
/**
 * 对象校验器：按字段 schema 校验并返回（会尽量收集所有字段错误）
 *
 * @example
 * ```ts
 * const user = object({
 *   id: number(),
 *   name: string(),
 *   age: optional(number())
 * })
 *
 * const result = user.safeParse({ id: 1, name: 'cat' })
 * if (result.success) {
 *   result.data.id // number
 * }
 * ```
 */
declare function object<S extends Record<string, Parser<any>>>(schema: S): Validator<InferObjectSchema<S>>;
interface OptionalOptions<T> {
  /**
   * 缺省值（当输入为 undefined 时生效）
   */
  default?: T | (() => T);
}
/**
 * 可选字段：当输入为 undefined 时通过（返回 undefined 或 default）
 */
declare function optional<T>(parser: Parser<T>, options?: OptionalOptions<T>): Parser<T | undefined>;
declare function vString(): Parser<string>;
declare function vNumber(): Parser<number>;
declare function vBoolean(): Parser<boolean>;
declare function vDate(): Parser<Date>;
declare function vArray<T>(item: Parser<T>): Parser<T[]>;
//#endregion
//#region src/data/number/big.d.ts
/** 允许的输入值类型 */
type BigInput = Big | string | number | bigint;
/**
 * 舍入模式
 * - 0: 向零截断；
 * - 1: 四舍五入（5 进）；
 * - 2: 银行家舍入；
 * - 3: 远离零。
 */
type RoundingMode = 0 | 1 | 2 | 3;
/** Node.js inspect 符号 */
declare const NODE_INSPECT_SYMBOL: unique symbol;
/**
 * 高精度十进制对象。
 */
declare class Big {
  /** 除法与开方的小数位数 */
  static DP: number;
  /** 默认舍入模式 */
  static RM: RoundingMode;
  /** 科学计数法负指数阈值 */
  static NE: number;
  /** 科学计数法正指数阈值 */
  static PE: number;
  /** 舍入模式常量 */
  static readonly roundDown = 0;
  static readonly roundHalfUp = 1;
  static readonly roundHalfEven = 2;
  static readonly roundUp = 3;
  /** 符号：1 或 -1 */
  s: -1 | 1;
  /** 十进制指数 */
  e: number;
  /** 系数数组（每位一个 0~9） */
  c: number[];
  constructor(value: BigInput);
  /** 返回绝对值 */
  abs(): Big;
  /** 比较大小：1(大于)、0(等于)、-1(小于) */
  cmp(value: BigInput): -1 | 0 | 1;
  /** 除法 */
  div(value: BigInput): Big;
  /** 等于 */
  eq(value: BigInput): boolean;
  /** 大于 */
  gt(value: BigInput): boolean;
  /** 大于等于 */
  gte(value: BigInput): boolean;
  /** 小于 */
  lt(value: BigInput): boolean;
  /** 小于等于 */
  lte(value: BigInput): boolean;
  /** 减法 */
  minus(value: BigInput): Big;
  /** 减法别名 */
  sub(value: BigInput): Big;
  /** 取模 */
  mod(value: BigInput): Big;
  /** 取反 */
  neg(): Big;
  /** 加法 */
  plus(value: BigInput): Big;
  /** 加法别名 */
  add(value: BigInput): Big;
  /** 幂运算 */
  pow(n: number): Big;
  /** 按有效位数舍入 */
  prec(sd: number, rm?: RoundingMode): Big;
  /** 按小数位舍入 */
  round(dp?: number, rm?: RoundingMode): Big;
  /** 开平方 */
  sqrt(): Big;
  /** 乘法 */
  times(value: BigInput): Big;
  /** 乘法别名 */
  mul(value: BigInput): Big;
  /** 转科学计数法字符串 */
  toExponential(dp?: number, rm?: RoundingMode): string;
  /** 转固定小数字符串 */
  toFixed(dp?: number, rm?: RoundingMode): string;
  /** 转普通字符串（必要时自动科学计数法） */
  toString(): string;
  /** JSON 序列化字符串 */
  toJSON(): string;
  /** Node.js 自定义 inspect 输出 */
  [NODE_INSPECT_SYMBOL](): string;
  /** 转原生 number */
  toNumber(): number;
  /** 按有效位输出字符串 */
  toPrecision(sd?: number, rm?: RoundingMode): string;
  /** valueOf */
  valueOf(): string;
}
/**
 * 创建隔离配置的 Big 构造器，避免不同调用方共享静态配置导致相互影响。
 */
declare function createBigConstructor(): typeof Big;
//#endregion
//#region src/date/date.d.ts
type DateInput = number | string | Date | Dater;
type DateCompareReducer<R> = (timeDiff: number) => R;
type FormatOptions = {
  utc?: boolean;
};
type DiffUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
type DiffOptions = {
  absolute?: boolean;
  float?: boolean;
};
type RangeInclusive = '()' | '[]' | '[)' | '(]';
type StartEndUnit = 'day' | 'week' | 'month' | 'year';
declare class Dater {
  private date;
  constructor(date: DateInput);
  /** 原始日期对象 */
  get raw(): Date;
  private static matchers;
  private getParts;
  /** 时间戳 */
  get timestamp(): number;
  setTime(timestamp: number): Dater;
  /** 年 */
  get year(): number;
  /**
   * 设置年份
   * @param year 年份
   * @returns
   */
  setYear(year: number): Dater;
  /** 月 */
  get month(): number;
  /**
   * 设置月份
   * @param month 月份，从1开始
   * @returns
   */
  setMonth(month: number): Dater;
  /** 周 */
  get weekDay(): number;
  /** 日 */
  get day(): number;
  /**
   * 设置日
   * @param day 日, 如果为0则表示上个月的最后一天
   * @returns
   */
  setDay(day: number): Dater;
  /** 时 */
  get hours(): number;
  /**
   * 设置小时
   * @param hours 时
   * @returns
   */
  setHours(hours: number): Dater;
  /** 分 */
  get minutes(): number;
  /**
   * 设置分
   * @param minutes 分
   */
  setMinutes(minutes: number): Dater;
  /** 秒 */
  get seconds(): number;
  /**
   * 设置秒
   * @param sec 秒
   */
  setSeconds(sec: number): Dater;
  /** 克隆当前日期 */
  clone(): Dater;
  /** 格式化日期 */
  format(formatter?: string, options?: FormatOptions): string;
  /**
   * 计算相对此刻的日期
   * @param timeStep 计算的日期, 负数表示之前的日期, 正数表示之后的日期
   * @param type 时间步长类别, 默认以天为单位
   */
  calc(timeStep: number, type?: 'days' | 'weeks' | 'months' | 'years'): Dater;
  /** 不可变加减封装 */
  addDays(days: number): Dater;
  addWeeks(weeks: number): Dater;
  addMonths(months: number): Dater;
  addYears(years: number): Dater;
  private resetTime;
  /**
   * 对齐到指定单位的开始
   * @param unit 单位: day/week/month/year
   */
  startOf(unit: StartEndUnit): Dater;
  /**
   * 对齐到指定单位的结束
   * @param unit 单位: day/week/month/year
   */
  endOf(unit: StartEndUnit): Dater;
  /**
   * 比较日期, 并返回天数差
   * @param date 日期
   * @returns 天数差
   */
  compare(date: DateInput): number;
  /**
   * 比较日期, 返回自定义结果
   * @param date 日期
   * @param reducer 处理器
   * @returns 自定义结果
   */
  compare<R>(date: DateInput, reducer: DateCompareReducer<R>): R;
  /**
   * 计算差值
   * @param date 对比日期
   * @param unit 单位
   * @param options absolute 为 true 时返回绝对值, float 为 true 时返回小数（仅限毫秒-周）
   */
  diff(date: DateInput, unit?: DiffUnit, options?: DiffOptions): number;
  /**
   * 判断是否在区间内
   * @param start 开始日期
   * @param end 结束日期
   * @param options inclusive: '[]' 闭区间, '()' 开区间, '[)' 左闭右开, '(]' 左开右闭
   */
  isBetween(start: DateInput, end: DateInput, options?: {
    inclusive?: RangeInclusive;
  }): boolean;
  isSameDay(date: DateInput): boolean;
  isSameMonth(date: DateInput): boolean;
  isSameYear(date: DateInput): boolean;
  isWeekend(): boolean;
  isLeapYear(): boolean;
  /**
   * 跳转至月尾
   * @param offsetMonth 月份偏移量，默认为0，即当月
   */
  toEndOfMonth(offsetMonth?: number): Dater;
  /**
   * 获取这个月的天数
   */
  getDays(): number;
  private static diffInCalendarMonths;
  private static diffInCalendarYears;
  private static escapeReg;
  private static parseByFormat;
  /**
   * 解析日期字符串
   * @param value 输入字符串
   * @param format 可选格式化模板（使用 format 支持的占位符）
   * @param options utc: 是否按 UTC 解析
   */
  static parse(value: string, format?: string, options?: FormatOptions): Dater;
}
/** 日期 */
declare function date(d?: DateInput): Dater;
//#endregion
//#region src/env/env.d.ts
/**
 * 获取当前运行环境
 *
 * 通过 `globalThis` 探测，避免直接引用未声明的全局。判定顺序：
 * 1. 若存在 `globalThis.window`（含 `undefined` 以外的占位），视为 `browser`。
 * 2. 否则若存在 `globalThis.process`，视为 `node`。
 *
 * 因此 Electron 等同时存在 `window` 与 Node `process` 时结果为 `browser`。若未来改为优先 `process`，属 breaking，须 major 与迁移说明。
 *
 * @returns 'browser' | 'node' | 'unknown'
 */
declare function getRuntime(): 'browser' | 'node' | 'unknown';
/**
 * 判断是否在浏览器中运行
 * @returns 是否在浏览器中运行
 */
declare function isInBrowser(): boolean;
/**
 * 判断是否在node环境中运行
 * @returns 是否在node环境中运行
 */
declare function isInNode(): boolean;
/**
 * 操作系统类型
 */
type OSType = 'Windows' | 'Linux' | 'MacOS' | 'Android' | 'iOS' | 'Unknown';
/**
 * 获取操作系统类型
 * @returns 操作系统类型
 */
declare function getOSType(): OSType;
/**
 * 设备类型
 */
type DeviceType = 'Mobile' | 'Desktop' | 'Tablet' | 'Unknown';
/**
 * 获取设备类型
 * @returns 设备类型
 */
declare function getDeviceType(): DeviceType;
/**
 * 浏览器类型
 */
type BrowserType = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'IE' | 'Opera' | 'Unknown';
/**
 * 获取浏览器类型
 * @returns 浏览器类型
 */
declare function getBrowserType(): BrowserType;
/**
 * 获取浏览器版本
 * @returns 浏览器版本号或 null
 */
declare function getBrowserVersion(): string | null;
/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
declare function isMobile(): boolean;
/**
 * 检查是否为平板设备
 * @returns 是否为平板设备
 */
declare function isTablet(): boolean;
/**
 * 检查是否为桌面设备
 * @returns 是否为桌面设备
 */
declare function isDesktop(): boolean;
/**
 * 检查是否支持触摸事件
 * @returns 是否支持触摸事件
 */
declare function isTouchDevice(): boolean;
/**
 * 获取 Node.js 版本
 * @returns Node.js 版本或 null
 */
declare function getNodeVersion(): string | null;
type EnvironmentSummary = {
  runtime: 'browser';
  os: OSType;
  browser: BrowserType;
  browserVersion: string | null;
  device: DeviceType;
  touchSupported: boolean;
} | {
  runtime: 'node';
  os: OSType;
  nodeVersion: string | null;
} | {
  runtime: 'unknown';
  os: OSType;
};
/**
 * 获取环境信息摘要
 * @returns 环境信息对象
 */
declare function getEnvironmentSummary(): EnvironmentSummary;
//#endregion
//#region src/optimize/parallel.d.ts
interface ParallelOptions {
  /**
   * 并发上限
   *
   * - 不传：默认等于 tasks.length（尽可能并发）
   * - 必须为正整数
   */
  concurrency?: number;
}
/**
 * 并发执行任务，并保持返回结果与任务顺序一致。
 *
 * 注意：该函数为异步函数，返回 Promise。
 *
 * @param tasks - 任务数组（每个任务可返回值或 Promise）
 * @param options - 并发控制
 * @returns 按任务顺序排列的结果数组
 */
declare function parallel<T>(tasks: ReadonlyArray<() => T | Promise<T>>, options?: ParallelOptions): Promise<T[]>;
//#endregion
//#region src/optimize/timer.d.ts
/**
 * 防抖
 * @param fn 要调用的目标函数
 * @param delay 延迟时间
 * @param immediate 是否立即调用一次, 默认true
 * @returns
 */
declare function debounce<T extends any[]>(fn: (...args: T) => void, delay?: number, immediate?: boolean): (this: any, ...args: T) => void;
/**
 * 节流
 * @param fn 要调用的目标函数
 * @param delay 间隔时间
 * @param cb 结果回调
 * @returns
 */
declare function throttle<T extends any[], R>(fn: (...args: T) => R, delay?: number, cb?: (v: R) => void): (this: any, ...args: T) => R;
/**
 * 睡眠一定时间
 * @param ms 毫秒数
 * @returns
 */
declare function sleep(ms: number): Promise<void>;
//#endregion
//#region src/optimize/safe.d.ts
/**
 * 安全运行
 * @param fn 待执行的函数
 */
declare function safeRun<T>(fn: () => T): T | undefined;
/**
 * 安全运行并提供默认返回值
 * @param fn 待执行的函数
 * @param defaultVal 指定的默认值
 */
declare function safeRun<T>(fn: () => T, defaultVal: T): T;
//#endregion
//#region src/pattern/observer.d.ts
/**
 * 属性处理器接口
 */
interface PropHandler {
  /** 要观察的属性名数组 */
  params: string[];
  /** 属性变化时的回调函数 */
  callback: (state: any) => void | Promise<void>;
  /** 是否同步执行回调 */
  sync?: boolean;
  /** 是否只执行一次 */
  once?: boolean;
}
/**
 * 观察选项接口
 */
interface ObserveOptions {
  /** 是否立即执行一次回调 */
  immediate?: boolean;
  /** 是否只执行一次 */
  once?: boolean;
  /** 是否同步执行回调 */
  sync?: boolean;
}
/**
 * 可观察对象类
 * 用于创建可被观察的状态对象
 */
declare class Observable<S extends object, K extends keyof S> {
  /** 可观察的状态对象 */
  readonly state: S;
  /** 属性处理器映射 */
  private propsHandlers;
  /** 是否正在等待微任务执行 */
  private waitingMicrotask;
  /** 微任务队列 */
  private microtasks;
  /** 是否暂停观察 */
  private paused;
  /**
   * 构造函数
   * @param data 初始状态对象
   */
  constructor(data: S);
  /**
   * 执行微任务
   */
  private runMicrotasks;
  /**
   * 触发属性变更事件
   * @param prop 属性名
   */
  trigger(prop: string | symbol): void;
  /**
   * 观察属性变化
   * @param props 要观察的属性名数组
   * @param callback 属性变化时的回调函数
   * @param options 观察选项
   * @returns 取消观察的函数
   */
  observe<const P extends K[]>(props: P, callback: (values: { [key in keyof P]: S[P[key]] }) => void, options?: ObserveOptions): () => void;
  /**
   * 获取状态对象
   * @returns 状态对象
   */
  getState(): S;
  /**
   * 设置状态对象
   * @param state 状态对象
   */
  setState(state: Partial<S>): Observable<S, K>;
  /**
   * 取消观察处理器
   * @param handler 要取消的处理器
   */
  unobserveHandler(handler: PropHandler): void;
  /**
   * 取消观察特定属性
   * @param props 要取消观察的属性名数组
   * @param handler 要取消的处理器, 不填则取消所有处理器
   */
  unobserve<const P extends K[]>(props: P, handler?: PropHandler): void;
  /**
   * 销毁所有观察者
   */
  destroyAll(): void;
}
//#endregion
//#region src/data-structure/tree.d.ts
type Obj$1 = Record<string, unknown>;
type Callback<Node extends Obj$1> = (node: Node, index: number, parent?: Node) => void | boolean;
/**
 * 深度优先遍历
 * @param data - 根节点
 * @param cb - 回调函数，返回 true 时提前终止遍历
 * @param childrenKey - 子节点属性名
 * @returns 如果提前终止返回 true
 */
declare function dfs<T extends Obj$1>(data: T, cb: Callback<T>, childrenKey?: string): boolean | void;
/**
 * 广度优先遍历
 * @param data - 根节点
 * @param cb - 回调函数，返回 true 时提前终止遍历
 * @param childrenKey - 子节点属性名
 * @returns 如果提前终止返回 true
 */
declare function bfs<T extends Obj$1>(data: T, cb: Callback<T>, childrenKey?: string): boolean | void;
/**
 * 树节点接口
 * @template T - 原始数据类型
 * @template Self - 节点自身类型，用于 parent/children 的递归类型定义
 *
 * @example
 * // 简单使用
 * type Node = ITreeNode<DataItem>
 *
 * // 扩展使用 - 让 parent/children 类型与扩展后的接口一致
 * interface MyNode extends ITreeNode<DataItem, MyNode> {
 *   extra: string
 * }
 */
interface ITreeNode<T extends Obj$1 = Obj$1, Self = ITreeNode<T, unknown>> {
  data: T;
  depth: number;
  index: number;
  isLeaf: boolean;
  parent?: Self;
  children?: Self[];
}
/**
 * 树节点类 - 提供节点操作方法
 * @template T - 原始数据类型
 * @template Self - 节点自身类型，用于继承时的类型推导
 *
 * @example
 * // 直接使用
 * const node = new TreeNode(data, 0, 0)
 *
 * // 继承扩展
 * class MyTreeNode<T extends Obj> extends TreeNode<T, MyTreeNode<T>> {
 *   extra: string = ''
 * }
 */
declare class TreeNode<T extends Obj$1 = Obj$1, Self extends TreeNode<T, Self> = TreeNode<T, any>> implements ITreeNode<T, Self> {
  data: T;
  /** 父节点 */
  parent?: Self;
  /** 子节点 */
  children?: Self[];
  /** 在树中的深度，从零开始 */
  depth: number;
  /** 在树中的索引 */
  index: number;
  get isLeaf(): boolean;
  constructor(data: T, index: number, depth: number, parent?: Self);
  /** 移除当前节点 */
  remove(): void;
  /**
   * 插入子节点
   * @param node - 要插入的节点
   * @param index - 插入位置，默认追加到末尾
   */
  insert(node: Self, index?: number): void;
  /**
   * 获取从根节点到当前节点的路径
   * @returns 路径数组，从根节点到当前节点
   */
  getPath(): Self[];
  /**
   * 获取所有祖先节点
   * @returns 祖先节点数组，从父节点到根节点
   */
  getAncestors(): Self[];
  /**
   * 检查是否为指定节点的祖先
   */
  isAncestorOf(node: Self): boolean;
  /**
   * 检查是否为指定节点的后代
   */
  isDescendantOf(node: Self): boolean;
  /**
   * 获取可见后代节点（用于虚拟滚动的增量更新）
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数组（深度优先顺序）
   *
   * @example
   * // 展开节点时，获取需要插入的节点
   * const descendants = node.getVisibleDescendants(n => n.expanded)
   * flatList.splice(nodeIndex + 1, 0, ...descendants)
   */
  getVisibleDescendants(isExpanded: (node: Self) => boolean): Self[];
  /**
   * 计算可见后代节点数量（用于虚拟滚动的增量更新）
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数量
   *
   * @example
   * // 折叠节点时，计算需要移除的节点数量
   * const count = node.getVisibleDescendantCount(n => n.expanded)
   * flatList.splice(nodeIndex + 1, count)
   */
  getVisibleDescendantCount(isExpanded: (node: Self) => boolean): number;
}
/**
 * 节点创建函数类型
 * @template T - 原始数据类型
 * @template Node - 创建的节点类型
 */
type NodeCreator<T extends Obj$1, Node> = (data: T, index: number, depth: number, parent: Node | undefined) => Node;
/**
 * TreeManager 配置选项（不带 createNode）
 */
interface TreeManagerOptionsBase {
  childrenKey?: string;
}
/**
 * TreeManager 配置选项（带 createNode）
 */
interface TreeManagerOptionsWithCreator<T extends Obj$1, Node> extends TreeManagerOptionsBase {
  createNode: NodeCreator<T, Node>;
}
/**
 * 树管理器 - 用于构建和管理树结构
 * @template T - 原始数据类型
 * @template Node - 节点类型
 *
 * @example
 * // 不使用 createNode，直接使用原始数据
 * const tree = new TreeManager(data)
 *
 * // 使用 createNode 创建自定义节点
 * const tree = new TreeManager(data, {
 *   createNode: (data, index, depth, parent) => ({
 *     data,
 *     index,
 *     depth,
 *     get isLeaf() { return !data.children?.length },
 *     parent
 *   })
 * })
 */
declare class TreeManager<T extends Obj$1, Node extends Obj$1 = T> {
  protected _root: Node;
  get root(): Node;
  protected nodeCreator?: NodeCreator<T, Node>;
  protected childrenKey: string;
  /**
   * 构造函数 - 不使用 createNode
   */
  constructor(data: T, options?: TreeManagerOptionsBase);
  /**
   * 构造函数 - 使用 createNode
   */
  constructor(data: T, options: TreeManagerOptionsWithCreator<T, Node>);
  /**
   * 从原始数据构建节点树
   */
  protected buildTree(data: T): Node;
  /**
   * 深度优先遍历
   * @param callback - 回调函数，返回 true 时提前终止
   */
  dfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void;
  /**
   * 广度优先遍历
   * @param callback - 回调函数，返回 true 时提前终止
   */
  bfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void;
  /**
   * 扁平化树为数组
   * @param filter - 可选的过滤函数
   * @returns 节点数组
   */
  flatten(filter?: (node: Node) => boolean): Node[];
  /**
   * 查找单个节点
   * @param predicate - 匹配函数
   * @returns 第一个符合条件的节点，未找到返回 null
   */
  find(predicate: (node: Node) => boolean): Node | null;
  /**
   * 查找所有符合条件的节点
   * @param predicate - 匹配函数
   * @returns 所有符合条件的节点数组
   */
  findAll(predicate: (node: Node) => boolean): Node[];
  /**
   * 获取所有叶子节点
   */
  getLeaves(): Node[];
  /**
   * 获取指定深度的所有节点
   * @param depth - 目标深度
   */
  getNodesAtDepth(depth: number): Node[];
  /**
   * 计算树的最大深度
   */
  getMaxDepth(): number;
  /**
   * 获取节点的可见后代（用于虚拟滚动的增量更新）
   *
   * @param node - 目标节点
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数组（深度优先顺序）
   *
   * @example
   * // 展开节点时，获取需要插入的节点
   * const descendants = tree.getVisibleDescendants(node, n => n.expanded)
   * flatList.splice(nodeIndex + 1, 0, ...descendants)
   */
  getVisibleDescendants(node: Node, isExpanded: (node: Node) => boolean): Node[];
  /**
   * 计算节点的可见后代数量（用于虚拟滚动的增量更新）
   *
   * @param node - 目标节点
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数量
   *
   * @example
   * // 折叠节点时，计算需要移除的节点数量
   * const count = tree.getVisibleDescendantCount(node, n => n.expanded)
   * flatList.splice(nodeIndex + 1, count)
   */
  getVisibleDescendantCount(node: Node, isExpanded: (node: Node) => boolean): number;
  /**
   * 扁平化树为数组（仅包含可见节点，用于虚拟滚动）
   *
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见节点数组（深度优先顺序）
   *
   * @example
   * // 初始化时获取可见节点列表
   * const flatList = tree.flattenVisible(n => n.expanded)
   */
  flattenVisible(isExpanded: (node: Node) => boolean): Node[];
}
//#endregion
//#region src/data-structure/forest.d.ts
type Obj = Record<string, unknown>;
/**
 * 森林节点接口
 * @template T - 原始数据类型
 * @template Self - 节点自身类型
 */
interface IForestNode<T extends Obj = Obj, Self = IForestNode<T, unknown>> extends ITreeNode<T, Self> {
  /** 所属森林实例 */
  forest: Forest<T, Self extends Obj ? Self : Obj>;
}
/**
 * 森林节点类 - 支持根节点级别的移除操作
 * @template T - 原始数据类型
 * @template Self - 节点自身类型，用于继承时的类型推导
 *
 * @example
 * class MyForestNode<T extends Obj> extends ForestNode<T, MyForestNode<T>> {
 *   selected = false
 * }
 */
declare class ForestNode<T extends Obj = Obj, Self extends ForestNode<T, Self> = ForestNode<T, any>> extends TreeNode<T, Self> {
  /** 索引签名，支持动态属性访问 */
  [key: string]: unknown;
  readonly forest: Forest<T, Self>;
  constructor(data: T, index: number, depth: number, forest: Forest<T, Self>, parent?: Self);
  remove(): void;
}
/**
 * 节点创建函数类型
 */
type ForestNodeCreator<T extends Obj, Node extends Obj> = (data: T, index: number, depth: number, forest: Forest<T, Node>, parent: Node | undefined) => Node;
/**
 * Forest 配置选项（基础）
 */
interface ForestOptionsBase<T extends Obj> {
  data: T[];
  childrenKey?: string;
}
/**
 * Forest 配置选项（带 createNode）
 */
interface ForestOptionsWithCreator<T extends Obj, Node extends Obj> extends ForestOptionsBase<T> {
  createNode: ForestNodeCreator<T, Node>;
}
/**
 * 森林管理器 - 管理多棵树
 * @template T - 原始数据类型
 * @template Node - 节点类型
 *
 * @example
 * // 使用自定义节点
 * const forest = new Forest({
 *   data: [{ id: 1 }, { id: 2, children: [{ id: 3 }] }],
 *   createNode: (data, index, depth, forest, parent) => ({
 *     data,
 *     index,
 *     depth,
 *     forest,
 *     parent,
 *     get isLeaf() { return !data.children?.length }
 *   })
 * })
 */
declare class Forest<T extends Obj, Node extends Obj = T> {
  roots: Node[];
  protected childrenKey: string;
  protected nodeCreator?: ForestNodeCreator<T, Node>;
  constructor(options: ForestOptionsBase<T>);
  constructor(options: ForestOptionsWithCreator<T, Node>);
  /**
   * 构建单棵树
   */
  protected buildTree(data: T, rootIndex: number): Node;
  /**
   * 深度优先遍历所有树
   * @param callback - 回调函数，返回 true 时提前终止当前树的遍历
   */
  dfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void;
  /**
   * 广度优先遍历所有树
   * @param callback - 回调函数，返回 true 时提前终止当前树的遍历
   */
  bfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void;
  /**
   * 扁平化所有树为数组
   * @param filter - 可选的过滤函数
   */
  flatten(filter?: (node: Node) => boolean): Node[];
  /**
   * 查找单个节点
   * @param predicate - 匹配函数
   * @returns 第一个符合条件的节点，未找到返回 null
   */
  find(predicate: (node: Node) => boolean): Node | null;
  /**
   * 查找所有符合条件的节点
   * @param predicate - 匹配函数
   */
  findAll(predicate: (node: Node) => boolean): Node[];
  /**
   * 获取所有叶子节点
   */
  getLeaves(): Node[];
  /**
   * 获取节点总数
   */
  get size(): number;
  /**
   * 计算所有树的最大深度
   */
  getMaxDepth(): number;
  /**
   * 获取节点的可见后代（用于虚拟滚动的增量更新）
   *
   * @param node - 目标节点
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数组（深度优先顺序）
   */
  getVisibleDescendants(node: Node, isExpanded: (node: Node) => boolean): Node[];
  /**
   * 计算节点的可见后代数量（用于虚拟滚动的增量更新）
   *
   * @param node - 目标节点
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见后代节点数量
   */
  getVisibleDescendantCount(node: Node, isExpanded: (node: Node) => boolean): number;
  /**
   * 扁平化森林为数组（仅包含可见节点，用于虚拟滚动）
   *
   * @param isExpanded - 判断节点是否展开的函数
   * @returns 可见节点数组（深度优先顺序）
   */
  flattenVisible(isExpanded: (node: Node) => boolean): Node[];
}
//#endregion
export { $n, $str, Big, BigInput, BrowserType, Dater, DeviceType, EnvironmentSummary, Forest, ForestNode, ForestNodeCreator, ForestOptionsBase, ForestOptionsWithCreator, IForestNode, ITreeNode, InferObjectSchema, NodeCreator, OSType, Observable, ObserveOptions, OptionalOptions, ParallelOptions, Parser, PropHandler, RoundingMode, SafeParseResult, TreeManager, TreeManagerOptionsBase, TreeManagerOptionsWithCreator, TreeNode, ValidationError, ValidationIssue, Validator, arr, base642u8a, bfs, createBigConstructor, createValidator, date, debounce, dfs, eachRight, getBrowserType, getBrowserVersion, getDataType, getDeviceType, getEnvironmentSummary, getNodeVersion, getOSType, getRuntime, hex2u8a, isArray, isArrayBuffer, isBlob, isBool, isDate, isDesktop, isEmpty, isFile, isFormData, isFunction, isInBrowser, isInNode, isInt16Array, isInt32Array, isInt8Array, isMobile, isNull, isNumber, isObj, isPromise, isString, isSymbol, isTablet, isTouchDevice, isUint16Array, isUint32Array, isUint8Array, isUndef, last, n, o, obj2query, object, omitArr, optional, parallel, query2obj, safeRun, sleep, str, str2u8a, throttle, transform, u8a2base64, u8a2hex, u8a2str, union, unionBy, vArray, vBoolean, vDate, vNumber, vString };