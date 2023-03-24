<template>
  <section>
    <div>输入十进制</div>

    <div>
      <input class="input" type="number" v-model="val1" />
      ^
      <input class="input" type="number" v-model="val2" />
    </div>

    <div>
      <VBinNumber :value="valBin1" />
      <VBinNumber :value="valBin2" />
      <div>↓</div>
      <VBinNumber :value="valBinResult" />
      <div>↓</div>
      <div>结果: {{ (val1 ?? 0) ^ (val2 ?? 0) }}</div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { shallowRef, watch } from 'vue'

const val1 = shallowRef<number>()
const val2 = shallowRef<number>()

const valBin1 = shallowRef('')
const valBin2 = shallowRef('')

const valBinResult = shallowRef('')

watch([val1, val2], ([v1, v2]) => {
  let bin1 = (v1 || 0).toString(2)
  let bin2 = (v2 || 0).toString(2)


   bin1 = '0'.repeat(32 - bin1.length) + bin1
   bin2 = '0'.repeat(32 - bin2.length) + bin2

  valBin1.value = bin1
  valBin2.value = bin2

  valBinResult.value = ''
  let i = -1
  while (++i < 32) {
    valBinResult.value += bin1[i] !== bin2[i] ? '1' : '0'
  }
})
</script>
