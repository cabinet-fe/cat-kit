<template>
  <div class="wrap">
    <div class="title">货币</div>
    <div>
      <input type="text" v-model.number="currencyNum" />
      保留
      <input style="width: 100px" type="text" v-model.number="precision" />
    </div>
    <div class="sub-title">人民币</div>
    <div class="result">
      结果: {{ n(currencyNum).currency('CNY', precision) }}
    </div>
    <div class="sub-title">人民币大写</div>
    <div class="result">
      结果: {{ n(currencyNum).currency('CNY_HAN', precision) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { n } from '@cat-kit/fe'
import { ref } from 'vue'

const precision = ref(2)

const currencyNum = ref(-123456.23)
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