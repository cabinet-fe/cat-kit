import { Stack } from './stack'

describe('栈结构测试', () => {
  test('测试括号是否匹配', () => {
    const rightStr = '1 + 3 / (2 / 5)'
    const errStr = '1 + 3 (/ (2 / 5)'

    const stack = new Stack<string>()

    let i = 0
    while (i < rightStr.length) {
      let item = rightStr[i]
      if (item === '(') {
        stack.push(item)
      } else if (item === ')') {
        stack.pop()
      }
      i++
    }
    expect(stack.size).toBe(0)

    let j = 0
    while (i < errStr.length) {
      let item = errStr[j]
      if (item === '(') {
        stack.push(item)
      } else if (item === ')') {
        stack.pop()
      }
      j++
    }
    expect(stack.isEmpty()).toBe(false)
  })

  test('栈变更事件', () => {
    const stack = new Stack([1, 2, 3, 4, 5])

    let count = 0

    stack.onChange(stack => {
      count++
    })

    stack.pop()
    stack.pop()
    stack.push(1)
    stack.pop()
    stack.push(2)

    expect(count).toBe(5)
  })
})
