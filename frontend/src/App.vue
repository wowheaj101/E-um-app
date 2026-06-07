<script setup lang="ts">
/** 앱 셸 — 모바일 우선 중앙 정렬 컬럼(최대 480px). */
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style>
.app-shell {
  --max-app: 480px;
  width: 100%;
  max-width: var(--max-app);
  min-height: 100dvh;
  margin: 0 auto;
  background: var(--background-normal);
  box-shadow: 0 0 0 1px var(--line-alternative);
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
