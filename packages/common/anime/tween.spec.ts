import { Tween } from './tween'

describe('补间动画', () => {
  it('动画完成后的回调', () => {
    const tween = new Tween({ x: 0 }, { duration: 1000 })
    let completed = false
    tween.to(
      { x: 100 },
      {
        onComplete(state) {
          completed = true
          expect(state.x).toBe(100)
        }
      }
    )

    setTimeout(() => {
      expect(completed).toBeFalsy()
    }, 999)
  })


})
