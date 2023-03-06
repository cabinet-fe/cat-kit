import { concurrent } from './optimize'

describe('优化', () => {
  test('并发控制', async () => {
    const queue: number[] = []
    await concurrent(
      [
        50, 18, 40, 30, 20, 15, 40, 30, 20, 10, 50, 60, 50, 20,
        20, 19, 33
      ],
      async (delay) => {
        console.log(delay)
        const ret = await new Promise<number>((rs) => {
          setTimeout(() => {
            rs(delay)
          }, delay)
        })

        queue.push(ret)
      },
      5
    )

    expect(queue.length).toBe(17)
  })
})
