<template>
{{ getChainValue({ person: { name: '张三' } }, 'person.name') }}
</template>

<script lang="ts" setup>
import { getChainValue } from '@cat-kit/fe'
</script>