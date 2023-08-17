<template>
  <div>
    <div>需要在开发模式下在项目根目录执行pnpm docs:server命令</div>

    <br />
    <v-button @click="request1">发起请求></v-button> <br />
    <v-button @click="request2">发起请求并使任意请求以错误的形式返回></v-button><br />
    <v-button @click="request3">
      超时的请求>
      <template v-if="timeout">等待{{ timeout / 1000 }}s</template>
    </v-button>
    <br />
    <v-button @click="request4">1s后终止所有本次发起的请求</v-button>
  </div>
</template>

<script lang="ts" setup>
import { Http, type IRequestor } from '@cat-kit/fe'
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
  const res = await http.post('/test', null, {
    created(req) {
      console.log(req)
    }
  })
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

const request4 = () => {
  const requests = new Set<IRequestor>()
  console.time('耗时:')
  Array.from({ length: 10 }).forEach((_, i) => {
    const sleep = Math.random() * 2000
    console.log(`第${i}个请求需要${sleep}ms返回数据`)
    http.post(
      '/test',
      {
        sleep
      },
      {
        created(req) {
          requests.add(req)
        },
        complete(req) {
          requests.delete(req)
        }
      }
    ).then(() => {
      console.log(`第${i}个请求完成`)
    }).catch(() => {
      console.log(`第${i}个请求被终止`)
    })
  })
  console.timeEnd('耗时:')
  // 1s后将所有没有请求的响应终止
  setTimeout(() => {
    requests.forEach(item => item.abort())
  }, 1000)
}
</script>
