<template>
  <div>
    <div>大于1000的超时</div>

    运行任务:
    <v-button @click="run">运行</v-button>
    <v-button @click="pause">暂停</v-button>
    <v-button @click="cont">继续</v-button>
    <v-button @click="retry">错误重试</v-button>
    <br />
    <br />


    失败后停止所有操作:
    <v-button @click="runMode()">运行</v-button>

    <br />
    <br />

    失败后继续剩余操作:
    <v-button @click="runMode('continue')">运行</v-button>

    <br />
    <br />

    <div>所有任务({{ timeouts.length }}个): {{ timeouts }}</div>
    <div>成功执行任务({{ finished.length }}个): {{ finished }}</div>
    <div>失败任务: {{ errs }}</div>
    <div>总共执行: {{ count }}次</div>
  </div>
</template>

<script lang="ts" setup>
import { ConcurrenceController } from '@cat-kit/fe'
import { shallowReactive, ref } from 'vue'
const timeouts = [
  1100, 500, 180, 400, 300, 200, 150, 400, 1300, 200, 100, 500, 600, 500, 200,
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



let cc: null | ConcurrenceController = null

const run = () => {
  reset()
  cc = new ConcurrenceController({
    queue: timeouts,
    action: async delay => {
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
      return result
    },
    max: 3,
    mode: 'continue'
  })

  cc.on('complete', e => {
    console.log(e)
    // cc = null
  })

  cc.start()
}

const pause = () => {
  cc?.pause()
}

const cont = () => {
  cc?.continue()
}

const retry = () => {
  cc?.retry()
}

const runMode = async (mode?: 'continue' | 'end') => {
  reset()
  await new Promise((rs, rj) => {
    const cc = new ConcurrenceController({
      queue: timeouts,
      action: async delay => {
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
      max: 2,
      mode
    })

    cc.on('failed', e => {
      rj(e.errors)
    })

    cc.on('success', e => {
      rs(e.result)
    })

    cc.start()
  })
  console.log('success')
}
</script>
