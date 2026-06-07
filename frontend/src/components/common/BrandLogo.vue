<script setup lang="ts">
/**
 * BrandLogo — E-UM 심볼(+워드마크 "이음") 락업.
 * 심볼은 /logo.png (public). variant 로 심볼만 / 락업 선택.
 */
withDefaults(
  defineProps<{
    variant?: 'lockup' | 'symbol'
    size?: number
  }>(),
  { variant: 'lockup', size: 32 }
)
</script>

<template>
  <span class="brand" :class="`brand--${variant}`">
    <img class="brand__symbol" src="/logo.png" alt="이음" :style="{ width: `${size}px`, height: `${size}px` }" />
    <span v-if="variant === 'lockup'" class="brand__wordmark" :style="{ fontSize: `${size * 0.66}px` }">이음</span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.brand__symbol {
  display: block;
  object-fit: contain;
}
.brand__wordmark {
  font-family: var(--font-sans);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary-normal);
  line-height: 1;
}
</style>
