<script setup lang="ts">
/**
 * AppIcon — DS 24px 그리드 filled 아이콘.
 * currentColor 로 칠해지므로 부모의 text 색을 그대로 따른다.
 */
import { computed } from 'vue'
import { ICONS, type IconName } from './icons'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
    title?: string
  }>(),
  { size: 24 }
)

const glyph = computed(() => ICONS[props.name])
</script>

<template>
  <span
    class="app-icon"
    :role="title ? 'img' : 'presentation'"
    :aria-label="title || undefined"
    :aria-hidden="title ? undefined : 'true'"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg v-if="glyph" :width="size" :height="size" viewBox="0 0 24 24" fill="none">
      <g :transform="`translate(${glyph.x} ${glyph.y})`">
        <path
          v-for="(p, i) in glyph.p"
          :key="i"
          :d="p[0]"
          fill="currentColor"
          :fill-rule="p[1]"
          :clip-rule="p[1]"
        />
      </g>
    </svg>
  </span>
</template>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.app-icon svg {
  display: block;
}
</style>
