<template>
  <div>单次</div>
  <div>[1, 2, 3, 4]之和为: {{resultOnce}}, 用时{{usedTimeOnce}}ms</div>

  <hr/>

  <div>多次:</div>
  <div><input style="width: 100px; border: 1px solid #eee; padding: 0 4px" v-model="count" /> 个随机数的和为: {{ result }}, 用时{{usedTime}}ms</div>
  <button @click="handleSum" style="color: var(--vp-c-brand)">重新计算</button>
</template>

<script lang="ts" setup>
// 可以使用 import { runWorkerOnce, runWorker } from 'cat-kit'
import { runWorkerOnce, runWorker } from '@cat-kit/fe'
import { shallowRef } from 'vue'

const url = new URL('./sum.js', import.meta.url)

const resultOnce = shallowRef(0)
const usedTimeOnce = shallowRef(0)
let t = Date.now()
runWorkerOnce<number>(url, [1, 2, 3, 4]).then(sum => {
  resultOnce.value = sum
  usedTimeOnce.value  = Date.now() - t
}).catch(err => console.error(err))

const result = shallowRef(0)
const usedTime = shallowRef(0)
let t2 = 0
const count = shallowRef(10)
const worker = runWorker<number>(url, {
  onMessage(data) {
    result.value = data.data
    usedTime.value = Date.now() - t2
  },
  onError(err) {
    console.error(err)
  }
})

const handleSum = () => {
  const randomNumbers = Array.from({ length: count.value }).map(() => {
    return Math.floor(Math.random() * 100)
  })
  t2 = Date.now()
  worker.send(randomNumbers)
}

handleSum()
</script>
