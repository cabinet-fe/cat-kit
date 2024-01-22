<template>
  <div>
    <div>人民币: {{ n(1000).currency('CNY') }}</div>
    <div>
      人民币（强制保留2位小数）:
      {{
        n(1000).currency('CNY', {
          precision: 2
        })
      }}
    </div>
    <div>
      人民币（最小保留2位小数）:
      {{
        n(1000.1).currency('CNY', {
          minPrecision: 2
        })
      }}
    </div>
    <div>
      人民币（最大保留2位小数）:
      {{
        n(1000.11).currency('CNY', {
          maxPrecision: 2
        })
      }}
    </div>
    <div>人民币大写: {{ n(1000).currency('CNY_HAN') }}</div>
  </div>
</template>

<script lang="ts" setup>
import { n } from '@cat-kit/fe'
</script>
