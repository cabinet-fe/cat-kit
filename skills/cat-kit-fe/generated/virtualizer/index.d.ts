//#region src/virtualizer/index.d.ts
/**
 * Virtualizer —— Vue composable / 框架适配层的虚拟滚动核心。
 *
 * 定位：仅负责位置计算、测量派发与快照广播；不持有 DOM 渲染职责，
 * 具体的元素挂载/卸载由上层 composable 或组件完成。
 */
type EstimateSize = (index: number) => number;
type VirtualAlign = 'auto' | 'start' | 'center' | 'end';
type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void;
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
  /** 相邻两项之间的间距（px），不作用于首尾；语义与 CSS `gap` 对齐，默认 0 */
  gap?: number;
  /** 初始滚动偏移（px），默认 0 */
  initialOffset?: number;
  /** 未 mount 前使用的初始 viewport 尺寸（px），默认 0 */
  initialViewport?: number;
  /** 项预估尺寸函数，默认返回 36 */
  estimateSize?: EstimateSize;
}
/** 单个虚拟项在滚动轴上的位置描述。 */
interface VirtualItem {
  /** 对应的绝对索引 */
  index: number;
  /** 在滚动轴上的起点（px，含 paddingStart） */
  start: number;
  /** 在滚动轴上的终点（px，= start + size） */
  end: number;
  /** 实际测量或预估的尺寸（px） */
  size: number;
}
/** 当前可见范围（未挂载或 viewport 为空时为 null）。 */
interface VirtualRange {
  /** 可视区内首个命中项的索引 */
  startIndex: number;
  /** 可视区内最后一个命中项的索引 */
  endIndex: number;
}
/** 外部订阅所拿到的快照；同一 recompute 期间保证不可变。 */
interface VirtualSnapshot {
  /** 需要渲染的虚拟项列表（已含 overscan） */
  items: VirtualItem[];
  /** 纯可视区范围（不含 overscan），可能为 null */
  range: VirtualRange | null;
  /** 内容总尺寸（px，含 paddingStart、gap、paddingEnd） */
  totalSize: number;
  /** 首个渲染项前的占位尺寸（用于做块状 spacer） */
  beforeSize: number;
  /** 末个渲染项后的占位尺寸 */
  afterSize: number;
  /** 当前滚动偏移（px） */
  offset: number;
  /** 当前 viewport 尺寸（px） */
  viewportSize: number;
  /** 当前是否为水平模式 */
  horizontal: boolean;
  /** 当前是否处于滚动中（用于 UI 控制 hover、悬浮等） */
  isScrolling: boolean;
}
/** 滚动到指定位置/索引时的选项。 */
interface VirtualScrollOptions {
  /** 对齐方式：auto 仅在不可见时滚入、start/center/end 强制对齐 */
  align?: VirtualAlign;
  /** 原生 scrollTo 行为 */
  behavior?: ScrollBehavior;
}
declare class Virtualizer {
  private count;
  private overscan;
  private horizontal;
  private paddingStart;
  private paddingEnd;
  private gap;
  private estimateSize;
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
  private scrollEndListenerAttached;
  constructor(options?: VirtualizerOptions);
  /**
   * 批量更新配置；仅提供的字段会生效，未提供者保持原值。
   * 完成后总会触发一次重算，可能派发 notify。
   */
  setOptions(options: VirtualizerOptions): this;
  /**
   * 设置总项数。增长时仅对新增尾部失效，收缩时复用现有缓存，避免 O(count) 全量重算。
   */
  setCount(count: number): this;
  /** 设置 viewport 尺寸；常由外部观察器或 composable 调用。 */
  setViewport(size: number): this;
  /** 手动设置滚动偏移，不会驱动真实 DOM 滚动（对应方法为 scrollToOffset）。 */
  setOffset(offset: number): this;
  /**
   * 挂载到滚动容器：注册 scroll / scrollend 监听，并用容器 ResizeObserver 跟踪 viewport。
   * 再次传入同一元素时仅做同步；传入 null 等同于 unmount。
   */
  mount(element: HTMLElement | null): this;
  /** 卸载当前容器：移除监听、断开容器观察器、清理滚动结束定时器。不清除订阅者。 */
  unmount(): this;
  /** 彻底销毁：unmount + 断开项观察器、清空 mounted 元素映射与订阅者。 */
  destroy(): void;
  /**
   * 订阅快照变化；订阅时会立即推送一次当前快照以便初始化渲染。
   * 返回的函数用于取消订阅。
   */
  subscribe(listener: VirtualizerSubscriber): () => void;
  /**
   * 外部提供真实尺寸进行单项测量；若尺寸发生变化会立即重算并可能 notify。
   * 越界或未变化的测量为 no-op。
   */
  measure(index: number, size: number): this;
  /**
   * 将 DOM 元素与索引绑定并交给 ResizeObserver 跟踪；元素变化时自动解绑旧元素。
   * 传 null 等同于解绑。会立刻基于元素的当前尺寸做一次测量。
   */
  measureElement(index: number, element: Element | null): void;
  /**
   * 驱动真实 DOM 滚动到指定偏移（若已 mount），并同步内部 offset。
   */
  scrollToOffset(offset: number, options?: VirtualScrollOptions): this;
  /**
   * 滚动到指定索引；align 为 auto 时仅在该项不完全可见时滚入。
   */
  scrollToIndex(index: number, options?: VirtualScrollOptions): this;
  /** 清空所有测量缓存并将 offset 归零；通常用于数据源整体替换的场景。 */
  reset(): this;
  /** 返回当前快照；同一 recompute 期内引用稳定，未变化时也不会重建对象。 */
  getSnapshot(): VirtualSnapshot;
  /**
   * 按索引获取单项的最新位置；快照不提供此类随机访问，故保留为公共方法。
   * 越界抛出 RangeError。
   */
  getItem(index: number): VirtualItem;
  private applyOptions;
  private pruneCaches;
  private invalidateFrom;
  /** 仅更新单项尺寸缓存并在发生变化时标记失效，不触发 recompute。 */
  private applyMeasurement;
  private ensureMeasurements;
  private recompute;
  /**
   * 仅比较对视觉产出有影响的关键字段以跳过冗余 notify；
   * 出于性能考虑只对 items 的首尾做抽样比对，中间项尺寸变化通过 totalSize / 末项 end 的变动捕获。
   */
  private isEquivalentSnapshot;
  /**
   * 基于当前缓存计算总尺寸；用于 recompute 与 clampOffset，外部请通过 getSnapshot().totalSize 访问。
   */
  private getTotalSize;
  private calculateRange;
  private createItems;
  private findStartIndex;
  private clampOffset;
  /** 容器尺寸变化时同步 viewport，不重新绑定项观察器。 */
  private observeContainer;
  /**
   * 懒创建项观察器。回调内对一整批 entries 先批量 applyMeasurement，
   * 只有当存在实际尺寸变化时才触发一次 recompute，避免 N 项 resize 引发 N 次布局重算。
   */
  private ensureItemObserver;
  private syncFromElement;
  /** 滚动事件：同步 offset 并标记滚动中；不支持 scrollend 时用 setTimeout 兜底判定结束。 */
  private handleScroll;
  private handleScrollEnd;
  /** 统一的滚动结束收束：仅在仍处于 isScrolling 时关闭并触发一次重算。 */
  private markScrollEnd;
  private stopScrollTracking;
  private notify;
}
//#endregion
export { EstimateSize, VirtualAlign, VirtualItem, VirtualRange, VirtualScrollOptions, VirtualSnapshot, Virtualizer, VirtualizerOptions, VirtualizerSubscriber };