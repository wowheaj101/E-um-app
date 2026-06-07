<script setup lang="ts">
/**
 * BaseButton — Wanted DS Button 이식.
 * variant(solid·weak·outline·text) × tone(primary·neutral·negative) × size(lg·md·sm).
 * hover/press 는 토큰 스왑(normal→strong→heavy)을 CSS :hover/:active 로 처리.
 * 색 계산은 script, 상호작용은 scoped CSS — 인라인 mouse state 없이 동작.
 */
import { computed } from 'vue'

type Variant = 'solid' | 'weak' | 'outline' | 'text'
type Tone = 'primary' | 'neutral' | 'negative'
type Size = 'lg' | 'md' | 'sm'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    tone?: Tone
    size?: Size
    disabled?: boolean
    fullWidth?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'solid',
    tone: 'primary',
    size: 'md',
    disabled: false,
    fullWidth: false,
    type: 'button',
  }
)

const TONES: Record<Tone, { normal: string; strong: string; heavy: string; tint: string; fg: string }> = {
  primary: {
    normal: 'var(--primary-normal)',
    strong: 'var(--primary-strong)',
    heavy: 'var(--primary-heavy)',
    tint: 'var(--primary-tint)',
    fg: 'var(--primary-normal)',
  },
  neutral: {
    normal: 'var(--label-normal)',
    strong: '#000',
    heavy: '#000',
    tint: 'var(--fill-normal)',
    fg: 'var(--label-normal)',
  },
  negative: {
    normal: 'var(--status-negative)',
    strong: 'var(--red-40)',
    heavy: 'var(--red-30)',
    tint: 'var(--status-negative-bg)',
    fg: 'var(--status-negative)',
  },
}

const cssVars = computed(() => {
  const t = TONES[props.tone]
  let bg = 'transparent'
  let bgHover = 'var(--fill-normal)'
  let bgActive = 'var(--fill-strong)'
  let fg = t.fg
  let border = 'transparent'

  if (props.disabled) {
    return {
      '--btn-bg': props.variant === 'solid' ? 'var(--interaction-disable)' : 'transparent',
      '--btn-bg-hover': props.variant === 'solid' ? 'var(--interaction-disable)' : 'transparent',
      '--btn-bg-active': props.variant === 'solid' ? 'var(--interaction-disable)' : 'transparent',
      '--btn-fg': 'var(--label-disable)',
      '--btn-shadow': props.variant === 'outline' ? 'inset 0 0 0 1px var(--line-neutral)' : 'none',
    }
  }

  if (props.variant === 'solid') {
    bg = t.normal
    bgHover = t.strong
    bgActive = t.heavy
    fg = 'var(--static-white)'
  } else if (props.variant === 'weak') {
    bg = t.tint
    bgHover = `color-mix(in srgb, ${t.normal} 14%, transparent)`
    bgActive = `color-mix(in srgb, ${t.normal} 22%, transparent)`
    fg = t.fg
  } else if (props.variant === 'outline') {
    border = 'var(--line-normal)'
  }

  return {
    '--btn-bg': bg,
    '--btn-bg-hover': bgHover,
    '--btn-bg-active': bgActive,
    '--btn-fg': fg,
    '--btn-shadow': border === 'transparent' ? 'none' : `inset 0 0 0 1px ${border}`,
  }
})
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${size}`, { 'btn--full': fullWidth }]"
    :type="type"
    :disabled="disabled"
    :style="cssVars"
  >
    <span v-if="$slots.leading" class="btn__icon"><slot name="leading" /></span>
    <span v-if="$slots.default" class="btn__label"><slot /></span>
    <span v-if="$slots.trailing" class="btn__icon"><slot name="trailing" /></span>
  </button>
</template>

<style scoped>
.btn {
  appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-family: var(--font-sans);
  font-weight: 700;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  color: var(--btn-fg);
  background: var(--btn-bg);
  box-shadow: var(--btn-shadow);
  transition:
    background var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.btn:hover:not(:disabled) {
  background: var(--btn-bg-hover);
}
.btn:active:not(:disabled) {
  background: var(--btn-bg-active);
}
.btn:disabled {
  cursor: not-allowed;
}
.btn--full {
  display: flex;
  width: 100%;
}

/* sizes (lg 48 / md 40 / sm 32) */
.btn--lg {
  gap: 6px;
  padding: 12px 28px;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.006em;
  border-radius: var(--radius-12);
}
.btn--md {
  gap: 5px;
  padding: 9px 20px;
  font-size: 15px;
  line-height: 22px;
  letter-spacing: 0.01em;
  border-radius: var(--radius-10);
}
.btn--sm {
  gap: 4px;
  padding: 7px 14px;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0.019em;
  border-radius: var(--radius-8);
}

.btn__icon {
  display: inline-flex;
  align-items: center;
}
</style>
