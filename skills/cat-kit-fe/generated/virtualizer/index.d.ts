//#region src/virtualizer/index.d.ts
/**
 * Virtualizer —— 单轴虚拟滚动核心。
 *
 * 设计要点：
 * - 职责聚焦：位置计算、测量派发、快照广播；渲染交给上层。
 * - 抖动消除：视口前方项测量变更时，同批次累积 scroll 补偿并在 recompute 统一 flush。
 * - 通知去重：纯 offset 变化不 notify，仅 range / items / totalSize / viewport /
 *   isScrolling 等结构性变化时推送快照。
 * - 未测项估值：默认沿用「已测平均值」，降低远距离滚动时 totalSize 跳变幅度。
 * - keyed items：可选 getItemKey 让测量缓存按稳定 key 存储，前插 / 乱序 / 中段删除
 *   时未变动项仍可复用真实测量。
 * - smooth 滚动校准：委托 {@link ScrollReconciler}，详见该文件。
 */
type EstimateSize = (index: number) => number;
type VirtualAlign = 'auto' | 'start' | 'center' | 'end';
type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void;
type GetItemKey = (index: number) => number | string;
/** Virtualizer 初始化参数。字段均可选，缺省时使用安全默认值。 */
interface VirtualizerOptions {
  /** 虚拟项总数，默认 0 */
  count?: number;
  /** 可视区外额外保留的预渲染项数，默认 6 */
  overscan?: number;
  /** 是否为水平滚动（否则为垂直），默认 false */
  horizontal?: boolean;
  /** 列表首项前的固定内边距（px），默认 0 */
  paddingStart?: number;
  /** 列表末项后的固定内边距（px），默认 0 */
  paddingEnd?: number;
  /** 相邻两项之间的间距（px），语义与 CSS `gap` 对齐，默认 0 */
  gap?: number;
  /** 初始滚动偏移（px），默认 0 */
  initialOffset?: number;
  /** 未 mount 前使用的初始 viewport 尺寸（px），默认 0 */
  initialViewport?: number;
  /** 项预估尺寸函数，默认返回 36 */
  estimateSize?: EstimateSize;
  /**
   * 未测项是否使用「已测项平均尺寸」作为估值，默认 true。
   *
   * 开启后首个样本产生即全面替换估值，配合 scrollAdjustments 可显著缓解
   * estimateSize 与真实值偏差过大带来的滚动条抖动。
   */
  useMeasuredAverage?: boolean;
  /**
   * 可选：基于 index 返回稳定 key，用于把测量缓存按数据项身份存储。
   *
   * 提供后列表前插 / 乱序 / 中段删除时，未变动项的真实测量值仍可被复用；
   * 未提供时行为与旧版本一致（按 index 缓存）。
   *
   * 约束：函数必须在整个生命周期稳定，同一数据项的 key 在任何时刻都应一致；
   * 不要基于 `Math.random()` 或当前时间生成 key。
   */
  getItemKey?: GetItemKey;
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
interface VirtualMeasurement {
  index: number;
  size: number;
}
declare class Virtualizer {
  private count;
  private overscan;
  private horizontal;
  private paddingStart;
  private paddingEnd;
  private gap;
  private estimateSize;
  private useMeasuredAverage;
  private getItemKey;
  private offset;
  private viewportSize;
  private isScrolling;
  /**
   * 测量缓存的唯一真源。未启用 getItemKey 时 key 就是 index；启用时 key 为
   * getItemKey(index) 的结果。内部所有读写一律通过 `keyOf(index)` 间接访问。
   */
  private measuredByKey;
  private measuredSum;
  private averageEstimate;
  private firstUnmeasured;
  private starts;
  private sizes;
  private dirtyIndex;
  private snapshot;
  private subscribers;
  private scrollElement;
  private containerObserver;
  private scrollEndTimer;
  private scrollEndNative;
  private mounted;
  private tracker;
  private reconciler;
  /** 视口前方项尺寸变化的累积 delta，recompute 开头统一 flush 一次 DOM 写入。 */
  private pendingScrollAdjust;
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
  measureMany(measurements: Iterable<VirtualMeasurement>): this;
  measureElement(index: number, element: Element | null): void;
  scrollToOffset(offset: number, options?: VirtualScrollOptions): this;
  scrollToIndex(index: number, options?: VirtualScrollOptions): this;
  reset(): this;
  getSnapshot(): VirtualSnapshot;
  getItem(index: number): VirtualItem;
  private applyOptions;
  /** 更新 count 并同步测量 / mounted 剪裁与 dirty 指针。返回是否发生变化。 */
  private updateCount;
  private keyOf;
  /** 未测项估值：优先已测平均值（若启用），否则 estimateSize。 */
  private estimate;
  private pruneMeasured;
  private pruneMounted;
  private invalidate;
  /**
   * 应用测量：更新缓存、触发 invalidate、并在必要时做 scrollAdjustments 抑制抖动。
   * 返回 true 表示发生了有效变化，调用方需 recompute。
   */
  private applyMeasurement;
  private syncAverageEstimate;
  private shouldInvalidateAverage;
  private advanceFirstUnmeasured;
  private findNextUnmeasured;
  private ensureMeasurements;
  private recompute;
  /** 只比较会影响视觉结构的字段；offset 变化不算"结构性差异"。 */
  private isStructuralEqual;
  private computeTotalSize;
  private calculateRange;
  private createItems;
  private findStartIndex;
  private findEndIndex;
  private clampOffset;
  private clampOffsetWithViewport;
  /** align 换算：纯函数，不写 DOM；供 scrollToIndex 与 Reconciler 共用。 */
  private getOffsetForIndex;
  /**
   * scroll 入口：non-smooth 同步写 + recompute；smooth 委托 Reconciler 的 rAF 校准循环
   * 并不预写 this.offset（由 scroll 事件驱动）。
   */
  private performScroll;
  private syncFromElement;
  private handleScroll;
  private handleScrollEnd;
  private kickScrollEndTimer;
  private markScrollEnd;
}
//#endregion
export { EstimateSize, GetItemKey, VirtualAlign, VirtualItem, VirtualMeasurement, VirtualRange, VirtualScrollOptions, VirtualSnapshot, Virtualizer, VirtualizerOptions, VirtualizerSubscriber };