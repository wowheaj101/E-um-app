<script setup lang="ts">
/**
 * MicIcon — DS 아이콘 세트에 마이크가 없어 별도 stroke 글리프로 제공.
 * currentColor 로 칠해진다.
 */
withDefaults(defineProps<{ size?: number }>(), { size: 24 })
</script>

<template>
  <span class="mic-icon" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2.5" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M6 11.5a6 6 0 0 0 12 0"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
      />
      <path
        d="M12 17.5V21M9 21h6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>

<style scoped>
.mic-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mic-icon svg {
  display: block;
}
</style>
