<template>
  <div>
    <div>需要在开发模式下在项目根目录执行pnpm docs:server命令</div>
    <div>响应内容请打开控制台查看</div>
    <br />
    <a @click="request1">发起请求></a> <br />
    <a @click="request2">发起请求并使任意请求以错误的形式返回></a><br />
    <a @click="request3">
      超时的请求>
      <template v-if="timeout">等待{{ timeout / 1000 }}s</template>
    </a>
    <br />
  </div>
</template>

<script lang="ts" setup>
import { Http } from '@cat-kit/fe'
import { shallowRef } from 'vue'

const http = new Http({
  baseUrl: '/api',
  timeout: 18000,
  after(res, _, resType) {
    if (resType === 'error') {
      console.error('抛出错误, 错误信息: ', res.message)
    }

    return res
  }
})

const timeout = shallowRef(0)

const count = () => {
  setTimeout(() => {
    timeout.value -= 1000

    if (timeout.value < 0) {
      timeout.value = 0
    }

    if (timeout.value > 0) {
      count()
    }
  }, 1000)
}

const request1 = async () => {
  const res = await http.post('/test', null)
  console.log('request1: ', res.data)
}

const request2 = async () => {
  await http.post('/test', null, {
    after(res, responseAs) {
      responseAs('error')
    }
  })
  console.log('request2')
}

const request3 = async () => {
  timeout.value = 18000
  count()
  await http.post('/test', {
    // 告诉服务器设置20000ms之后再响应数据
    sleep: 20000
  })
  console.log('request3')
}
</script>
