import base64 from "./base64"

describe('base64', () => {
  const text = '你好'
  const expectResult = '5L2g5aW9'


  test('base64编码', () => {
    expect(base64.encode(text)).toBe(expectResult)
  })

  test('base64解码', () => {
    expect(base64.decode(expectResult)).toBe(text)
  })
})