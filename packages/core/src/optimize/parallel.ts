export function parallel<T>(tasks: (() => T)[]): T[] {
  return tasks.map(task => task())
}
