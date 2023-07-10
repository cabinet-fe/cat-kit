<template>
{{ merge({ name: '张三' }, { name: '李四', age: 20 }) }}
</template>

<script lang="ts" setup>
import { merge } from '@cat-kit/fe'
</script>