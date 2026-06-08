<script setup lang="ts">
/** 앱 셸 — 모바일 우선 중앙 정렬 컬럼(최대 480px). */
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <!--
      페이지 전환 애니메이션(<transition mode="out-in">)은 제거했다.
      lazy(async) 라우트로 처음 이동할 때 청크를 네트워크로 받는 비동기 지연과
      out-in 시퀀스가 어긋나 enter 트랜지션이 .fade-enter-from(opacity:0) 상태로
      굳어, 컴포넌트는 마운트됐지만 화면이 투명(=빈 화면)으로 남고 새로고침해야
      보이던 버그의 원인이었다. 시니어 대상 앱이라 모션 제거가 UX상 오히려 낫다.
    -->
    <RouterView />
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
</style>
