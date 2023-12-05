<template>
  <div>
    <div>
      <label>
        <input v-model="readType" type="radio" value="text" /> 文本
      </label>

      <label>
        <input v-model="readType" type="radio" value="dataUrl" /> 链接
      </label>

      <label>
        <input v-model="readType" type="radio" value="arrayBuffer" /> 缓冲数据
      </label>
    </div>

    <div>当前文件类型: {{ fileType  }}</div>

    <!-- 读取文本 -->
    <div style="word-break: break-all" v-if="readType === 'text'">
      <input type="file" accept="text/*, image/svg+xml" @change="handleChange" />

      <div>{{ content }}</div>
    </div>

    <!-- 读取图片 -->
    <div style="word-break: break-all" v-else-if="readType === 'dataUrl'">
      <input type="file" accept="image/*" @change="handleChange" />
      <img style="width: 100px; height: 100px" v-if="content" :src="content" />
    </div>

    <!-- 读取缓冲区数据 -->
    <div style="word-break: break-all" v-else-if="readType === 'arrayBuffer'">
      <input type="file" @change="handleChange" />

      <div>
        总计 {{ bytes.length }}字节, {{ n(bytes.length / 1024).fixed(2) }}KB, {{ n(bytes.length / 1024 / 1024 ).fixed(2) }}MB
        <br>
        前100个字节: {{ bytes.slice(0, 100) }}...
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { readFile, type ReadType, n, MD5 } from '@cat-kit/fe'
import { computed, shallowRef, watch } from 'vue'

const readType = shallowRef<ReadType>('text')

const content = shallowRef<any>()

const fileType = shallowRef('')

watch(readType, v => {
  content.value = undefined
})

MD5('1234').then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})


const handleChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files![0]
  if(!file) {
    fileType.value = ''
    content.value = undefined
    return
  }
  fileType.value = file.type
  const { result } = await readFile(file, readType.value as any)
  content.value = result
}


const bytes = computed(() => {
  return readType.value === 'arrayBuffer' ? new Uint8Array(content.value) : new Uint8Array()
})
</script>
