<template>
  {{ diff }}
</template>

<script lang="ts" setup>
import { Virtualizer } from '@cat-kit/fe'
import { date } from '@cat-kit/core'
import { IDB } from '@cat-kit/fe'

const virtualizer = new Virtualizer({
  count: 100,
  estimateSize: () => 100,
  direction: 'vertical'
})

const diff = date('2025-04-15 09:12:23:345').compare('2025-04-13 15:25:33:666')

const configs = IDB.defineStore('configs', {
  id: {
    type: Number,
    autoIncrement: true,

    primary: true
  },
  name: {
    type: String,
    required: true
  }
})

const idb = new IDB('test', {
  version: 1,
  stores: [configs]
})

async function op() {
  await configs.add({
    name: 'test',
    id: 1
  })

  const data = await configs.find({
    name: 'test'
  })

  console.log(data)
}

setTimeout(() => {
  op()
}, 100)
</script>
