<template>
  <section>
    <div>输入十进制</div>

    <div>
      ~ <input class="input" type="number" v-model="val" />
    </div>

    <div>
      <VBinNumber :value="valBin" />
      <div>↓</div>
      <VBinNumber :value="valBinResult" />
      <div>↓</div>
      <div>结果: {{ ~(val ?? 0) }}</div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { shallowRef, watch } from 'vue'

const val = shallowRef<number>()

const valBin = shallowRef('')

const valBinResult = shallowRef('')

watch(val, v => {
  let bin = (v || 0).toString(2)
  bin = ((v || 0) >= 0 ? '0' : '1') + '0'.repeat(31 - bin.length) + bin
  valBin.value = bin

  valBinResult.value = ''
  let i = -1
  while (++i < bin.length) {
    valBinResult.value += bin[i] === '0' ? '1' : '0'
  }
})
</script>
