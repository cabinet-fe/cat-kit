import type { ClientPlugin } from '../types'

export function MethodOverridePlugin(): ClientPlugin {
  return {
    beforeRequest() {},
    afterRespond() {}
  }
}
