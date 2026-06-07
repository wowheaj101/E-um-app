<script setup lang="ts">
/**
 * AppHeader — 상단 바. 뒤로가기/타이틀/우측 액션 슬롯.
 * 흰 배경 + hairline 하단 보더. 모바일 safe-area 대응.
 */
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'

withDefaults(
  defineProps<{
    title?: string
    back?: boolean
  }>(),
  { title: '', back: false }
)

const router = useRouter()
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__left">
        <button v-if="back" class="icon-btn" aria-label="뒤로" @click="goBack">
          <AppIcon name="chevronLeft" :size="24" />
        </button>
        <slot name="left" />
      </div>
      <h1 v-if="title" class="app-header__title wt-headline1">{{ title }}</h1>
      <div class="app-header__right">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--background-normal);
  box-shadow: inset 0 -1px 0 var(--line-normal);
  padding-top: env(safe-area-inset-top);
}
.app-header__inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 56px;
  padding: 0 12px;
  max-width: var(--max-app, 480px);
  margin: 0 auto;
}
.app-header__left,
.app-header__right {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 44px;
}
.app-header__right {
  justify-content: flex-end;
}
.app-header__title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: var(--label-normal);
  white-space: nowrap;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  color: var(--label-normal);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}
.icon-btn:hover {
  background: var(--fill-normal);
}
.icon-btn:active {
  background: var(--fill-strong);
}
</style>
