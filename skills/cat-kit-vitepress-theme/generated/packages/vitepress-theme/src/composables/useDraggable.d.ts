import * as vue from "vue";

//#region src/composables/useDraggable.d.ts
interface UseDraggableOptions {
  /** 初始值 */
  initial?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 拖拽方向：垂直或水平 */
  direction?: 'vertical' | 'horizontal';
  /** 是否反向（向上/向左增加） */
  reverse?: boolean;
}
/**
 * 拖拽调整尺寸 composable
 */
declare function useDraggable(options?: UseDraggableOptions): {
  value: vue.Ref<number, number>;
  isDragging: vue.Ref<boolean, boolean>;
  onDragStart: (e: MouseEvent) => void;
};
//#endregion
export { UseDraggableOptions, useDraggable };
//# sourceMappingURL=useDraggable.d.ts.map