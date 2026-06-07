<script setup lang="ts">
/**
 * BaseCard — 기본 콘텐츠 표면. Wanted DS 는 그림자보다 hairline 보더 우선.
 * elevation="raised|floating" 일 때만 그림자.
 */
import { computed } from 'vue'

type Elevation = 'flat' | 'none' | 'raised' | 'floating'

const props = withDefaults(
  defineProps<{
    elevation?: Elevation
    padding?: number | string
    radius?: number | string
    interactive?: boolean
    as?: string
  }>(),
  { elevation: 'flat', padding: 20, radius: 16, interactive: false, as: 'div' }
)

const shadow = computed(() => {
  const map: Record<Elevation, string> = {
    none: 'none',
    flat: 'none',
    raised: 'var(--shadow-card)',
    floating: 'var(--shadow-raised)',
  }
  const border =
    props.elevation === 'flat' || props.elevation === 'none'
      ? 'inset 0 0 0 1px var(--line-normal)'
      : ''
  return [border, map[props.elevation]].filter((s) => s && s !== 'none').join(', ') || 'none'
})

const style = computed(() => ({
  padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
  borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
  boxShadow: shadow.value,
  cursor: props.interactive ? 'pointer' : undefined,
}))
</script>

<template>
  <component :is="as" class="card" :class="{ 'card--interactive': interactive }" :style="style">
    <slot />
  </component>
</template>

<style scoped>
.card {
  box-sizing: border-box;
  background: var(--background-elevated);
}
.card--interactive {
  transition:
    box-shadow var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-standard);
}
.card--interactive:active {
  transform: scale(0.995);
}
</style>
