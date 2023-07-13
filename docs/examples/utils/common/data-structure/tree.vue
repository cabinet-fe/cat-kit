<template>
  <div></div>
</template>

<script lang="ts" setup>
import { Tree } from '@cat-kit/fe'

const data = [
  {
    id: 1,
    children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }, { id: 5 }]
  },
  { id: 6 }
]

const tree =  new Tree(data)
console.log(tree.getNodeList(node => node.data.id < 3))
</script>
