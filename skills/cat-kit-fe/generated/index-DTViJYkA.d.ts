//#region src/virtualizer/index.d.ts
type EstimateSize = (index: number) => number;
type VirtualAlign = 'auto' | 'start' | 'center' | 'end';
type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void;
interface VirtualizerOptions {
  count?: number;
  overscan?: number;
  horizontal?: boolean;
  paddingStart?: number;
  paddingEnd?: number;
  initialOffset?: number;
  initialViewport?: number;
  estimateSize?: EstimateSize;
  onChange?: VirtualizerSubscriber;
}
interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}
interface VirtualRange {
  startIndex: number;
  endIndex: number;
}
interface VirtualSnapshot {
  items: VirtualItem[];
  range: VirtualRange | null;
  totalSize: number;
  beforeSize: number;
  afterSize: number;
  offset: number;
  viewportSize: number;
  horizontal: boolean;
  isScrolling: boolean;
}
interface VirtualScrollOptions {
  align?: VirtualAlign;
  behavior?: ScrollBehavior;
}
declare class Virtualizer {
  private count;
  private overscan;
  private horizontal;
  private paddingStart;
  private paddingEnd;
  private estimateSize;
  private onChange?;
  private offset;
  private viewportSize;
  private isScrolling;
  private measuredSizes;
  private starts;
  private ends;
  private sizes;
  private dirtyIndex;
  private snapshot;
  private subscribers;
  private scrollElement;
  private elementIndexes;
  private mountedItems;
  private itemObserver;
  private containerObserver;
  private scrollEndTimer;
  constructor(options?: VirtualizerOptions);
  setOptions(options: VirtualizerOptions): this;
  setCount(count: number): this;
  setViewport(size: number): this;
  setOffset(offset: number): this;
  mount(element: HTMLElement | null): this;
  unmount(): this;
  destroy(): void;
  subscribe(listener: VirtualizerSubscriber): () => void;
  measure(index: number, size: number): this;
  resizeItem(index: number, size: number): this;
  measureElement(index: number, element: Element | null): void;
  scrollToOffset(offset: number, options?: VirtualScrollOptions): this;
  scrollToIndex(index: number, options?: VirtualScrollOptions): this;
  reset(): this;
  getSnapshot(): VirtualSnapshot;
  getItems(): VirtualItem[];
  getRange(): VirtualRange | null;
  getTotalSize(): number;
  getItem(index: number): VirtualItem;
  private applyOptions;
  private pruneCaches;
  private invalidateFrom;
  private ensureMeasurements;
  private recompute;
  private calculateRange;
  private createItems;
  private findStartIndex;
  private clampOffset;
  private observeContainer;
  private ensureItemObserver;
  private syncFromElement;
  private handleScroll;
  private stopScrollTracking;
  private notify;
}
//#endregion
//#region src/tween.d.ts
type TweenState = 'idle' | 'running' | 'paused' | 'finished' | 'cancelled';
type TweenEasing = (progress: number) => number;
interface TweenScheduler {
  now(): number;
  requestFrame(callback: FrameRequestCallback): number;
  cancelFrame(handle: number): void;
}
interface TweenFrame {
  elapsed: number;
  progress: number;
  easedProgress: number;
  value: number;
  state: TweenState;
}
interface TweenOptions {
  from?: number;
  to?: number;
  duration?: number;
  delay?: number;
  easing?: TweenEasing;
  autoplay?: boolean;
  scheduler?: TweenScheduler;
  onUpdate?: (frame: TweenFrame) => void;
  onFinish?: (frame: TweenFrame) => void;
  onCancel?: (frame: TweenFrame) => void;
}
declare const tweenEasings: {
  linear: (progress: number) => number;
  easeInQuad: (progress: number) => number;
  easeOutQuad: (progress: number) => number;
  easeInOutQuad: (progress: number) => number;
};
declare class Tween {
  private from;
  private to;
  private duration;
  private delay;
  private easing;
  private scheduler;
  private onUpdate?;
  private onFinish?;
  private onCancel?;
  private state;
  private startedAt;
  private pausedElapsed;
  private handle;
  private progress;
  private value;
  constructor(options?: TweenOptions);
  getState(): TweenState;
  getValue(): number;
  getProgress(): number;
  setOptions(options: TweenOptions): this;
  play(): this;
  pause(): this;
  resume(): this;
  cancel(): this;
  reset(): this;
  seek(progress: number): this;
  private applyOptions;
  private schedule;
  private tick;
  private currentElapsed;
  private interpolate;
  private createFrame;
  private emitUpdate;
  private cancelFrame;
}
//#endregion
//#region src/storage/storage.d.ts
type Callback<T = any> = (key: StorageKey<T>, value?: T, temp?: {
  value: T;
  exp: number;
}) => void;
type StorageKey<_> = {};
declare function storageKey<T>(str: string): StorageKey<T>;
type ExtractStorageKey<T> = T extends StorageKey<infer K> ? K : never;
declare class WebStorage {
  static enabledType: Set<string>;
  private storage;
  callbacks: {
    [key: string]: Callback[];
  };
  constructor(storage: Storage);
  /**
   * 往缓存里添加单条记录
   * @param key 单个值的键
   * @param value 单个值
   * @param exp 单个值的过期时间, 单位秒
   */
  set<T>(key: StorageKey<T>, value: T, exp?: number): WebStorage;
  get<T>(key: StorageKey<T>): T | null;
  get<T>(key: StorageKey<T>, defaultValue: T): T;
  get<T extends [...any[]]>(keys: [...T]): { [I in keyof T]: ExtractStorageKey<T[I]> };
  /**
   * 获取字段过期时间
   * @param key 字段名
   */
  getExpire(key: StorageKey<any>): number;
  /**
   * 移除一个缓存值
   * @param key 需要移除的值的键
   */
  remove(key: StorageKey<any>): WebStorage;
  /**
   * 移除多个缓存值
   * @param keys 需要移除的值的键的数组
   */
  remove(keys: StorageKey<any>[]): WebStorage;
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
declare const storage: {
  readonly local: WebStorage;
  readonly session: WebStorage;
};
//#endregion
//#region src/storage/cookie.d.ts
/**
 * Cookie操作选项接口
 */
interface CookieOptions {
  /**
   * Cookie过期时间（秒数或Date对象）
   */
  expires?: number | Date;
  /**
   * Cookie路径
   */
  path?: string;
  /**
   * Cookie域名
   */
  domain?: string;
  /**
   * 是否仅通过HTTPS传输
   */
  secure?: boolean;
  /**
   * 同站策略
   */
  sameSite?: 'Strict' | 'Lax' | 'None';
}
/**
 * Cookie操作工具类
 *
 * 提供了一系列简单易用的方法来操作浏览器 cookie。
 * 支持设置、获取、删除、检查存在性等基本操作。
 *
 * @example
 * ```typescript
 * // 设置 cookie
 * cookie.set('token', 'abc123', { expires: 7 * 24 * 3600  }); // 7天后过期
 *
 * // 获取 cookie
 * const token = cookie.get('token');
 *
 * // 删除 cookie
 * cookie.remove('token');
 *
 * // 检查是否存在
 * if (cookie.has('token')) {
 *   // ...
 * }
 *
 * // 获取所有 cookie
 * const allCookies = cookie.getAll();
 *
 * // 清空所有 cookie
 * cookie.clear();
 * ```
 */
declare const cookie: {
  /**
   * 设置 cookie
   * @param key - cookie 键名
   * @param value - cookie 值
   * @param options - 配置选项
   */
  set(key: string, value: string, options?: CookieOptions): void;
  /**
   * 获取指定键名的 cookie 值
   * @param key - cookie 键名
   * @returns cookie 值，如果不存在则返回 null
   */
  get(key: string): string | null;
  /**
   * 删除指定键名的 cookie
   * @param key - cookie 键名
   * @param options - 配置选项
   */
  remove(key: string, options?: Pick<CookieOptions, "path" | "domain">): void;
  /**
   * 检查指定键名的 cookie 是否存在
   * @param key - cookie 键名
   * @returns 如果 cookie 存在返回 true，否则返回 false
   */
  has(key: string): boolean;
  /**
   * 获取所有 cookie
   * @returns 包含所有 cookie 的键值对对象
   */
  getAll(): Record<string, string>;
  /**
   * 清空所有 cookie
   * @remarks
   * 此操作会删除当前域名下的所有 cookie
   */
  clear(): void;
};
//#endregion
//#region src/web-api/permission.d.ts
type WebPermissionName = PermissionName | 'clipboard-read' | 'clipboard-write';
declare function queryPermission(name: WebPermissionName): Promise<boolean>;
//#endregion
//#region src/web-api/clipboard.d.ts
/** 剪切板 */
declare const clipboard: {
  /**
   * 将一段文本写入系统剪切板
   * @param data 写入的数据
   */
  copy(data: string | Blob | Array<string | Blob>): Promise<void>;
  /**
   * 从剪切板中读取纯文本数据
   * @returns 读取到的文本数据
   */
  read(): Promise<Blob[]>;
  /**
   * 读取文本内容
   * @returns 剪切板中的文本内容
   */
  readText(): Promise<string>;
};
//#endregion
//#region src/file/saver.d.ts
/**
 * 通过 Blob 保存文件
 *
 * 适用于小到中等大小的文件（通常 < 500MB）
 * 使用传统的 Object URL + a[download] 方式
 *
 * @example
 * ```ts
 * const blob = new Blob(['Hello, World!'], { type: 'text/plain' })
 * saveBlob(blob, 'hello.txt')
 * ```
 */
declare function saveBlob(blob: Blob, filename: string): void;
//#endregion
//#region src/file/read.d.ts
interface ReadChunksOptions {
  /** 每次读取的块大小，默认 10MB */
  chunkSize?: number;
  /** 开始读取的偏移量 */
  offset?: number;
}
/**
 * 分块读取文件，返回 AsyncGenerator
 *
 * 使用 Blob.slice() + arrayBuffer() 替代 FileReader，
 * 支持 for-await-of 遍历、break 提前退出
 *
 * @param file 要读取的文件或 Blob 对象
 * @param options 读取配置
 *
 * @example
 * ```ts
 * for await (const chunk of readChunks(file)) {
 *   hash.update(chunk)
 * }
 * ```
 *
 * @example
 * ```ts
 * // 手动控制
 * const reader = readChunks(file, { chunkSize: 1024 * 1024 })
 * const { value, done } = await reader.next()
 * await reader.return(undefined)
 * ```
 */
declare function readChunks(file: Blob | File, options?: ReadChunksOptions): AsyncGenerator<Uint8Array>;
//#endregion
export { CookieOptions, EstimateSize, ExtractStorageKey, ReadChunksOptions, StorageKey, Tween, TweenEasing, TweenFrame, TweenOptions, TweenScheduler, TweenState, VirtualAlign, VirtualItem, VirtualRange, VirtualScrollOptions, VirtualSnapshot, Virtualizer, VirtualizerOptions, VirtualizerSubscriber, WebPermissionName, clipboard, cookie, queryPermission, readChunks, saveBlob, storage, storageKey, tweenEasings };