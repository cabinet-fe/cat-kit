<template>
  <div>
    <div>字符串：</div>
    <textarea v-model="text" placeholder="原文"> </textarea>
    <div>
      <v-button @click="handleCalcStringMD5">计算</v-button>
      结果: {{ textMd5 }}
    </div>

    <div>文件：</div>
    <input type="file" @change="handleCalcFileMD5" />
    <div>
      读取第{{ number }}片 进度: {{ progress }} 结果: {{ fileMd5 }} 耗时：{{
        usedTime
      }}ms
    </div>
  </div>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue'
import { MD5 } from '@cat-kit/crypto'
import MD5Worker from './md5.worker?worker'

const text = shallowRef('')
const textMd5 = shallowRef('')

const handleCalcStringMD5 = async () => {
  textMd5.value = await MD5(text.value)
}

const fileMd5 = shallowRef('')
const progress = shallowRef(0)
const number = shallowRef(0)
const usedTime = shallowRef<number>()

let start = 0
const worker = new MD5Worker()

worker.onmessage = e => {
  if (e.data.event === 'progress') {
    progress.value = e.data.data
    number.value += 1
  } else {
    fileMd5.value = e.data.data
    usedTime.value = Date.now() - start
  }
}
const handleCalcFileMD5 = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files![0]
  if (!file) return
  start = Date.now()
  worker.postMessage(file)


  // 在读取文件的过程中，可以监听进度
  // MD5(file, {
  //   onProgress(p) {
  //     progress.value = p
  //     number.value += 1
  //   }
  // }).then(md5 => {
  //   fileMd5.value = md5
  //   usedTime.value = Date.now() - start
  // })
}
</script>
