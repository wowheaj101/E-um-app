<script setup lang="ts">
/**
 * ListCell — 탭 가능한 리스트 행: [leading] title/description [trailing].
 * Wanted DS 의 설정·메뉴·리소스 목록용 workhorse.
 */
withDefaults(
  defineProps<{
    title: string
    description?: string | null
    divider?: boolean
    disabled?: boolean
    tappable?: boolean
  }>(),
  { description: null, divider: false, disabled: false, tappable: false }
)
</script>

<template>
  <div
    class="list-cell"
    :class="{ 'list-cell--tappable': tappable && !disabled, 'list-cell--divider': divider, 'list-cell--disabled': disabled }"
    :role="tappable && !disabled ? 'button' : undefined"
    :tabindex="tappable && !disabled ? 0 : undefined"
  >
    <span v-if="$slots.leading" class="list-cell__leading"><slot name="leading" /></span>
    <span class="list-cell__body">
      <span class="list-cell__title wt-body1">{{ title }}</span>
      <span v-if="description" class="list-cell__desc wt-label2">{{ description }}</span>
    </span>
    <span v-if="$slots.trailing" class="list-cell__trailing"><slot name="trailing" /></span>
  </div>
</template>

<style scoped>
.list-cell {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 4px;
  border-radius: var(--radius-12);
  background: transparent;
  transition: background var(--duration-fast) var(--ease-standard);
}
.list-cell--divider {
  box-shadow: inset 0 -1px 0 var(--line-alternative);
}
.list-cell--tappable {
  cursor: pointer;
}
.list-cell--tappable:hover {
  background: var(--fill-alternative);
}
.list-cell--tappable:active {
  background: var(--fill-normal);
}
.list-cell--disabled {
  opacity: 0.5;
}
.list-cell__leading {
  display: inline-flex;
  flex-shrink: 0;
}
.list-cell__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.list-cell__title {
  color: var(--label-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list-cell__desc {
  color: var(--label-alternative);
}
.list-cell__trailing {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--label-alternative);
}
</style>
