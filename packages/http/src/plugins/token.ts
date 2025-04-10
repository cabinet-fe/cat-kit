import type { ClientPlugin } from '../types'

export function TokenPlugin(): ClientPlugin {
  return {
    beforeRequest() {},
    afterRespond() {}
  }
}
