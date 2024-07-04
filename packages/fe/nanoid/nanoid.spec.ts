import { nanoid, customAlphabet } from './nanoid'

describe('nanoid', () => {
  test('nanoid', () => {
    expect(nanoid().length).toBe(21)
  })

  test('customAlphabet', () => {
    const nano = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10)
    expect(nano().length).toBe(10)
  })
})
