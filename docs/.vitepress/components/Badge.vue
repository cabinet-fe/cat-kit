<template>
  <span class="badge"> </span>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.badge {
  display: inline-block;
  font-size: 14px;
  height: 18px;
  line-height: 18px;
  border-radius: 3px;
  padding: 0 6px;
  color: var(--c-bg);
  vertical-align: top;
  transition: color var(--t-color), background-color var(--t-color);
}
</style>
