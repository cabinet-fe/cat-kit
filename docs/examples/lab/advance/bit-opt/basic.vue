<template>
  <div>
    <section>
      按位与:
      <div>输入十进制</div>
      <div>
        <input class="input" type="number" v-model="andVal1" />
        &
        <input class="input" type="number" v-model="andVal2" />
      </div>
      <div>
        <VBinNumber :value="andValBin1" />
        <VBinNumber :value="andValBin2" />
        <div>↓</div>
        <VBinNumber :value="andValBinResult" />
        <div>↓</div>
        <div>{{ (andVal1 ?? 0) & (andVal2 ?? 0) }}</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { shallowRef, watch } from 'vue'

// 与
const andVal1 = shallowRef<number>()
const andVal2 = shallowRef<number>()

const andValBin1 = shallowRef('')
const andValBin2 = shallowRef('')

const andValBinResult = shallowRef('')

watch([andVal1, andVal2], ([v1, v2]) => {
  let bin1 = (v1 || 0).toString(2)
  let bin2 = (v2 || 0).toString(2)

  let maxLen = Math.max(bin1.length, bin2.length)
  bin1.length < maxLen && (bin1 = '0'.repeat(maxLen - bin1.length) + bin1)
  bin2.length < maxLen && (bin2 = '0'.repeat(maxLen - bin2.length) + bin2)

  andValBin1.value = bin1
  andValBin2.value = bin2

  andValBinResult.value = ''
  let i = -1
  while (++i < maxLen) {
    andValBinResult.value += bin1[i] === '1' && bin2[i] === '1' ? '1' : '0'
  }
})



// 或
</script>
