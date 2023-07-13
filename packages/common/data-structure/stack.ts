/**
 * 栈
 */
export class Stack<T> {
  private items: T[]

  private changeEvent?: (stack: Stack<T>) => void

  constructor(initial?: T[]) {
    this.items = initial || []
  }

  /**
   * 入栈
   * @param item 元素
   */
  push(item: T): void {
    this.items.push(item)
    this.emit()
  }

  /**
   * 出栈
   * @returns
   */
  pop(): T | undefined {
    const item = this.items.pop()
    this.emit()
    return item
  }

  /**
   * 栈顶
   * @returns
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  /**
   * 检查栈是否为空
   * @returns
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 栈的大小
   * @returns
   */

  get size(): number {
    return this.items.length
  }

  /**
   * 清空栈
   */
  clear(): void {
    this.items = []
    this.emit()
  }

  private emit() {
    this.changeEvent?.(this)
  }

  onChange(cb: (stack: Stack<T>) => void): void {
    this.changeEvent = cb
  }
}
