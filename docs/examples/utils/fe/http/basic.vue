<template>
  <div>
    <div>需要在开发模式下在项目根目录执行pnpm docs:server命令</div>

    <br />
    <v-button @click="request1">发起请求</v-button> <br />

    <v-button @click="request2">发起请求并使任意请求以错误的形式返回></v-button
    ><br />
    <v-button @click="request3">
      超时的请求>
      <template v-if="timeout">等待{{ timeout / 1000 }}s</template>
    </v-button>
    <br />
    <v-button @click="request4">1s后终止所有本次发起的请求</v-button>
    <br />
    <v-button @click="request5">DELETE请求和PUT请求转换为POST请求</v-button>
    <br />
    <v-button @click="request6">发起二进制请求</v-button>
    <br/>
    <v-button @click="request7">发起form-data请求</v-button>
  </div>
</template>

<script lang="ts" setup>
import { Http, type IRequestor } from '@cat-kit/fe'
import { shallowRef } from 'vue'
const env = 'zwt'
const http = new Http({
  baseUrl: '/api',
  timeout: 18000,
  before(conf) {
    if (env === 'zwt' && ['PUT', 'DELETE'].includes(conf.method)) {
      conf.headers['X-HTTP-Method-Override'] = conf.method
      conf.method = 'POST'
    }
    return conf
  },
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
    http
      .post(
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
      )
      .then(() => {
        console.log(`第${i}个请求完成`)
      })
      .catch(() => {
        console.log(`第${i}个请求被终止`)
      })
  })
  console.timeEnd('耗时:')
  // 1s后将所有没有请求的响应终止
  setTimeout(() => {
    requests.forEach(item => item.abort())
  }, 1000)
}

const request5 = () => {
  http.put('/put').then(res => {
    console.log(res)
  })
}

const request6 = async () => {
  let buffer = new ArrayBuffer(512)
  let u8a = new Uint8Array(buffer)

  for (let i = 0; i < u8a.length; i++) {
    u8a[i] = i % 255
  }
  const res = await http.post('/test3', buffer, {
    created(req) {
      console.log(req)
    },
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
  console.log('request1: ', res.data)
}
const request7 = async () => {
  const formData = new FormData()
  formData.append('url', 'http://192.168.31.250:9000/chunk/cd461c8890bd0a5cc5bd847321c35e51/1.chunk?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=szyh%2F20240201%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240201T055829Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=86a6064efcbc288d71075bb62b7b1ff1304d716fea76f065885fa3d1c7eb2bc4')

  const buffer = new ArrayBuffer(10)
  const u8a = new Uint8Array(buffer)
  for (let index = 0; index < 10; index++) {
    u8a[index] = index
  }

  const file = new File([new Blob([buffer])], 'a.js')
  formData.append('file', file)
  const res = await http.put('/admin/file/forwardMinio', formData, {

  })
  console.log('request7: ', res.data)
}
</script>
