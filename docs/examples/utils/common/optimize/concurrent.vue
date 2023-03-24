<template>
  <div>
    <div>大于1000的超时</div>

    运行任务, 遇到错误重试一次: <v-button @click="run">运行</v-button>
    <br />
    <br />
    运行任务, 出错的任务不再重试:
    <v-button @click="runWithoutRetry">运行</v-button>

    <br />
    <br />
    <div>所有任务({{ timeouts.length }}个): {{ timeouts }}</div>
    <div>成功执行任务({{ finished.length }}个): {{ finished }}</div>
    <div>失败任务: {{ errs }}</div>
    <div>总共执行: {{ count }}次</div>
  </div>
</template>

<script lang="ts" setup>
import { concurrent, type ConcurrentOptions } from '@cat-kit/fe'
import { shallowReactive, ref } from 'vue'
const timeouts = [
  1100, 500, 180, 400, 300, 200, 150, 400, 300, 200, 100, 500, 600, 500, 200,
  200, 190, 330
]

const finished = shallowReactive<number[]>([])
const errs = shallowReactive<number[]>([])
const count = ref(0)

const reset = () => {
  finished.splice(0, finished.length)
  errs.splice(0, errs.length)
  count.value = 0
}

const runOptions = (options?: ConcurrentOptions | number) => {
  concurrent(
    timeouts,
    async delay => {
      count.value++
      const result = await new Promise<number>((rs, rj) => {
        setTimeout(() => {
          if (delay > 1000) {
            rj(delay)
            errs.push(delay)
          } else {
            rs(delay)
          }
        }, delay)
      })

      finished.push(result)
    },
    options as any
  )
}

const run = () => {
  reset()
  runOptions(3)
}

const runWithoutRetry = () => {
  reset()
  runOptions({
    max: 3,
    /** 不再重试 */
    retry: err => {
      console.log(err)
      return false
    }
  })
}
</script>
