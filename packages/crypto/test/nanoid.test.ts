import { customAlphabet, customRandom, nanoid, random, urlAlphabet } from '@cat-kit/crypto'

describe('nanoid', () => {
  it('默认生成 21 位 URL 安全 ID', () => {
    const id = nanoid()

    expect(id).toHaveLength(21)
    expect([...id].every((char) => urlAlphabet.includes(char))).toBe(true)
  })

  it('支持自定义长度并在长度为 0 时返回空字符串', () => {
    expect(nanoid(8)).toHaveLength(8)
    expect(nanoid(0)).toBe('')
  })

  it('生成指定字母表的随机 ID', () => {
    const createId = customAlphabet('abc', 12)
    const id = createId()

    expect(id).toHaveLength(12)
    expect([...id].every((char) => 'abc'.includes(char))).toBe(true)
  })

  it('customRandom 会拒绝导致 modulo bias 的随机字节', () => {
    const createId = customRandom('abc', 2, () => new Uint8Array([0, 1, 255, 2]))

    expect(createId()).toBe('cb')
  })

  it('random 返回指定长度的安全随机字节', () => {
    const bytes = random(16)

    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes).toHaveLength(16)
  })
})
