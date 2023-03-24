# 链表 List

链表和数组在应用层面上表现一直, 都是有序数据结构.

数组在任何时候都近乎完美, 除了在删除和插入时. 因为数组的每个数据存在于连续的内存空间中, 因此数组的插入和删除几乎是O(n)的时间复杂度.

链表的出现正好解决了数组的这个缺陷, 链表的删除只需要将当前节点的上一个节点的下一个节点指向当前节点的下一个节点.

我们尝试用代码表示为

```ts

class LinkNode {
  data = null
  pre = null
  next = null

  constructor(data: any) {
    this.data = data
  }
}

class LinkedList {
  head = null
  tail = null

  constructor(node: LinkNode) {
    this.head = head
    this.tail = node
  }

  find(data: any) {
    let current = this.head
    while(current && current.data !== data) {
      current = current.next
    }
    return current
  }

  insert(data: any, node?: LinkNode) {
    if (!node) {

    }
  }

  remove() {}
}

const linkList = new LinkedList(new LinkNode(1))

```