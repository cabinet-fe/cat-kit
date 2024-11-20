<template>
  <div class="wrap">
    <div class="title">保留小数位数</div>
    <div>
      <input style="width: 100px" type="text" v-model.number="fixedNum" />
      保留
      <input style="width: 100px" type="text" v-model.number="precision" />
    </div>
    <div class="sub-title">原生JS</div>
    <div class="result">结果: {{ fixedNum.toFixed(precision) }}</div>
    <div class="sub-title">n(num).fixed()方法</div>
    <div class="result">结果: {{ n(fixedNum).fixed(precision) }}</div>

    <div class="sub-title">n(num).fixed()方法(指定最大精度)</div>
    <div class="result">
      结果: {{ n(fixedNum).fixed({ maxPrecision: precision }) }}
    </div>

    <div class="sub-title">n(num).fixed()方法(指定最小精度)</div>
    <div class="result">
      结果: {{ n(fixedNum).fixed({ minPrecision: precision }) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { n } from '@cat-kit/fe'
import { ref } from 'vue'

const fixedNum = ref(1.255)
const precision = ref(2)
</script>

<style scoped>
.wrap {
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 4px;
}

.title {
  color: #333;
}

.sub-title {
  color: #666;
  font-size: 14px;
  line-height: 1;
  margin-top: 4px;
}

.result {
  color: #f00;
  font-size: 14px;
}

.ele {
  margin-top: 12px;
}
</style>
