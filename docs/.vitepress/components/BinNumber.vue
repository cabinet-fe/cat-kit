<template>
  <div class="bin-number">
    <span class="bin-item" v-for="v of valueArr">{{ v }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: '',
  }
})

const valueArr = computed(() => {
  return props.value.split('')
})
</script>

<script lang="ts">
export default {
  name: 'VBinNumber'
}
</script>

<style  scoped>
.bin-item {
  border-radius: 2px;
  border: 1px solid #ccc;
  display: inline-block;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;

  font-size: 14px;
}
.bin-item:not(:last-child) {
  margin-right: 2px;
}
</style>
