<template>
  <div>
    {{ data  }}

    <button @click="request">发起请求</button>
  </div>
</template>

<script lang="ts" setup>
import { Http } from '@cat-kit/fe'
import { shallowRef } from 'vue'

const data = shallowRef()

const http = new Http({
  baseUrl: '/api'
})


const request = async () => {

  const res = await http.get('/hello', {
    after(res, returnBy) {
      returnBy('error')

      return res
    }
  }).catch(err => {
    console.log(err)
  })
  // data.value = res.data
}
</script>
