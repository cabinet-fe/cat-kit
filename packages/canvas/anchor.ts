import { Graph } from './graph'

interface AnchorConfig {}

// 锚点用于相互之间的连接

export class Anchor extends Graph {
  name = 'Anchor'

  draw(): void {}
}
