<script setup lang="ts">
/**
 * AssetAvatar — 자산 유형별 아이콘 타일 (rounded square).
 * 유형마다 DS content-accent 색 페어(전경/배경)를 사용.
 */
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import type { IconName } from '@/components/common/icons'
import type { AssetType } from '@/types'

const props = withDefaults(defineProps<{ type: AssetType; size?: number }>(), { size: 48 })

const MAP: Record<AssetType, { icon: IconName; fg: string; bg: string }> = {
  bank: { icon: 'coins', fg: 'var(--accent-foreground-navy)', bg: 'var(--accent-background-navy)' },
  insurance: { icon: 'circleCheck', fg: 'var(--accent-foreground-green)', bg: 'var(--accent-background-green)' },
  realestate: { icon: 'home', fg: 'var(--accent-foreground-orange)', bg: 'var(--accent-background-orange)' },
  crypto: { icon: 'globe', fg: 'var(--accent-foreground-violet)', bg: 'var(--accent-background-violet)' },
}

const cfg = computed(() => MAP[props.type])
</script>

<template>
  <span
    class="asset-avatar"
    :style="{ width: `${size}px`, height: `${size}px`, background: cfg.bg, color: cfg.fg }"
  >
    <AppIcon :name="cfg.icon" :size="Math.round(size * 0.5)" />
  </span>
</template>

<style scoped>
.asset-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-12);
  flex-shrink: 0;
}
</style>
