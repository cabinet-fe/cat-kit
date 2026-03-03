export class SharedStringPool {
  private readonly valueToIndex = new Map<string, number>()
  private readonly values: string[] = []

  add(value: string): number {
    const existing = this.valueToIndex.get(value)
    if (existing != null) return existing
    const index = this.values.length
    this.values.push(value)
    this.valueToIndex.set(value, index)
    return index
  }

  all(): string[] {
    return [...this.values]
  }

  size(): number {
    return this.values.length
  }
}
