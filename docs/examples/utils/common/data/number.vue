<template>
  <div class="wrap">
    <div class="title">精确计算</div>
    <div class="ele">
      <input style="width: 100px" type="text" v-model.number="plusNum1" />
      +
      <input style="width: 100px" type="text" v-model.number="plusNum2" />
    </div>
    <div class="sub-title">原生JS</div>
    <div class="result">结果: {{ plusNum1 + plusNum2 }}</div>
    <div class="sub-title">n.plus()方法</div>
    <div class="result">结果: {{ n.plus(plusNum1, plusNum2) }}</div>

    <div class="ele">
      <input style="width: 100px" type="text" v-model.number="minusNum1" />
      -
      <input style="width: 100px" type="text" v-model.number="minusNum2" />
    </div>
    <div class="sub-title">原生JS</div>
    <div class="result">结果: {{ minusNum1 - minusNum2 }}</div>
    <div class="sub-title">n.minus()方法</div>
    <div class="result">结果: {{ n.minus(minusNum1, minusNum2) }}</div>

    <div class="ele">
      <input style="width: 100px" type="text" v-model.number="mulNum1" />
      *
      <input style="width: 100px" type="text" v-model.number="mulNum2" />
    </div>
    <div class="sub-title">原生JS</div>
    <div class="result">结果: {{ mulNum1 * mulNum2 }}</div>
    <div class="sub-title">n.mul()方法</div>
    <div class="result">结果: {{ n.mul(mulNum1, mulNum2) }}</div>

    <div class="ele">
      <input style="width: 100px" type="text" v-model.number="divNum1" />
      /
      <input style="width: 100px" type="text" v-model.number="divNum2" />
    </div>
    <div class="sub-title">原生JS</div>
    <div class="result">结果: {{ divNum1 / divNum2 }}</div>
    <div class="sub-title">n.div()方法</div>
    <div class="result">结果: {{ n.div(divNum1, divNum2) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { n } from '@cat-kit/fe'
import { ref } from 'vue'

const plusNum1 = ref(0.1)
const plusNum2 = ref(0.2)

const minusNum1 = ref(0.3)
const minusNum2 = ref(0.2)

const mulNum1 = ref(1.255)
const mulNum2 = ref(100)

const divNum1 = ref(2.1)
const divNum2 = ref(10)
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
