export class BaseTreeNode<Data> {
  data: Data

  index: number = 0

  constructor(data: Data) {
    this.data = data
  }
}