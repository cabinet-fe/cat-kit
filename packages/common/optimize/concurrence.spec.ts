import { ConcurrenceController } from './concurrence'

describe('并发优化', () => {
  test('并发控制', async () => {
    const queue: number[] = []
    const cc = new ConcurrenceController({
      queue: [
        50, 18, 40, 30, 20, 15, 40, 30, 20, 10, 50, 60, 50, 20, 20, 19, 33
      ],
      action: async delay => {
        const ret = await new Promise<number>(rs => {
          setTimeout(() => {
            rs(delay)
          }, delay)
        })

        queue.push(ret)
      }
    })

    await new Promise((rs, rj) => {
      cc.on('complete', e => {
        rs(e)
      })

      cc.start()
    })

    expect(queue.length).toBe(17)
  })
})
