<template>
<!-- 时间戳（毫秒） -->
{{(date().timestamp)}}
</template>

<script lang="ts" setup>
import { date } from '@cat-kit/fe'
</script>