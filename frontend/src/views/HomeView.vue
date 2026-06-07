<script setup lang="ts">
/**
 * HomeView — 시니어 홈 (시연 쇼케이스).
 * 자산 합계 → 음성/목록 액션 → 최근 자산 → 가족 연결.
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/common/AppHeader.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import MicIcon from '@/components/common/MicIcon.vue'
import AssetAvatar from '@/components/asset/AssetAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { useAssetStore } from '@/stores/asset'
import { formatKRW } from '@/utils/format'

const router = useRouter()
const auth = useAuthStore()
const assetStore = useAssetStore()
const { displayName, mode } = storeToRefs(auth)
const { items, totalAmount, count } = storeToRefs(assetStore)

const recent = computed(() => items.value.slice(0, 3))

onMounted(() => assetStore.fetch())
</script>

<template>
  <AppHeader>
    <template #left>
      <BrandLogo variant="lockup" :size="30" />
    </template>
    <template #right>
      <div class="size-toggle" role="group" aria-label="글자 크기">
        <button :class="{ on: mode === 'helper' }" @click="auth.setMode('helper')">보통</button>
        <button :class="{ on: mode === 'senior' }" @click="auth.setMode('senior')">크게</button>
      </div>
    </template>
  </AppHeader>

  <main class="page">
    <!-- 인사 -->
    <section class="greeting">
      <h2 class="wt-title3">{{ displayName }} 님,</h2>
      <p class="wt-body1 greeting__sub">오늘도 자산을 안전하게 지켜요.</p>
    </section>

    <!-- 자산 합계 (navy hero) -->
    <section class="hero">
      <div class="hero__top">
        <span class="wt-label1 hero__label">내 자산 합계</span>
        <span class="hero__dot" aria-hidden="true" />
      </div>
      <strong class="hero__amount">{{ formatKRW(totalAmount) }}</strong>
      <div class="hero__meta wt-body2">
        <AppIcon name="circleCheck" :size="18" />
        <span>총 {{ count }}건 · 가족과 안전하게 연결됨</span>
      </div>
    </section>

    <!-- 주요 액션 -->
    <section class="actions">
      <button class="action action--primary" @click="router.push('/voice')">
        <span class="action__icon"><MicIcon :size="30" /></span>
        <span class="action__label wt-headline1">음성으로 추가</span>
        <span class="action__hint wt-label2">말하면 자동으로 정리돼요</span>
      </button>
      <button class="action" @click="router.push('/assets')">
        <span class="action__icon action__icon--alt"><AppIcon name="coins" :size="28" /></span>
        <span class="action__label wt-headline1">내 자산 보기</span>
        <span class="action__hint wt-label2">{{ count }}건 한눈에</span>
      </button>
    </section>
    <button class="action action--wide" disabled>
      <AppIcon name="bookmark" :size="22" />
      <span class="wt-body1">사진으로 추가 · 직접 입력 (준비 중)</span>
    </button>

    <!-- 최근 자산 -->
    <section class="block">
      <div class="block__head">
        <h3 class="wt-heading2">최근 자산</h3>
        <button class="link wt-label1" @click="router.push('/assets')">
          전체 보기 <AppIcon name="chevronRight" :size="16" />
        </button>
      </div>
      <div class="recent">
        <button
          v-for="a in recent"
          :key="a.id"
          class="recent__row"
          @click="router.push('/assets')"
        >
          <AssetAvatar :type="a.asset_type" :size="48" />
          <span class="recent__info">
            <span class="wt-body1 recent__name">{{ a.institution || a.asset_name }}</span>
            <span class="wt-label2 recent__desc">{{ a.asset_name }}</span>
          </span>
          <span class="wt-headline2 recent__amount">{{ formatKRW(a.amount) }}</span>
        </button>
      </div>
    </section>

    <!-- 가족 연결 -->
    <section class="family">
      <span class="family__icon"><AppIcon name="person" :size="22" /></span>
      <span class="family__text">
        <span class="wt-body1 family__title">가족 연결</span>
        <span class="wt-label2 family__sub">김민준 님이 자산을 함께 지켜봐요 (읽기 전용)</span>
      </span>
      <AppIcon name="chevronRight" :size="18" />
    </section>
  </main>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px var(--gutter-mobile) 40px;
  background: var(--background-normal-alternative);
}

.greeting {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}
.greeting__sub {
  color: var(--label-alternative);
}

/* size toggle */
.size-toggle {
  display: inline-flex;
  padding: 3px;
  border-radius: var(--radius-full);
  background: var(--fill-normal);
}
.size-toggle button {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--label-alternative);
  cursor: pointer;
}
.size-toggle button.on {
  background: var(--background-normal);
  color: var(--primary-normal);
  box-shadow: var(--shadow-card);
}

/* hero */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  border-radius: var(--radius-20);
  background: linear-gradient(135deg, var(--navy-40), var(--navy-30));
  color: var(--static-white);
  overflow: hidden;
}
.hero__top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hero__label {
  color: rgba(255, 255, 255, 0.82);
}
.hero__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--accent-warm);
  box-shadow: 0 0 0 4px rgba(248, 184, 32, 0.25);
}
.hero__amount {
  font-size: 34px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.hero__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.88);
}

/* actions */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 20px;
  min-height: 132px;
  border: none;
  border-radius: var(--radius-16);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
  cursor: pointer;
  text-align: left;
  transition: box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);
}
.action:active {
  transform: scale(0.99);
}
.action--primary {
  background: var(--primary-tint);
  box-shadow: inset 0 0 0 1px transparent;
}
.action__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-14);
  background: var(--primary-normal);
  color: var(--static-white);
}
.action__icon--alt {
  background: var(--accent-warm-tint);
  color: var(--accent-warm-strong);
}
.action__label {
  color: var(--label-normal);
  margin-top: 4px;
}
.action__hint {
  color: var(--label-alternative);
}
.action--wide {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 0;
  padding: 16px;
  color: var(--label-alternative);
  background: var(--background-normal);
  cursor: not-allowed;
}

/* block */
.block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.block__head h3 {
  color: var(--label-normal);
}
.link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: none;
  background: transparent;
  color: var(--primary-normal);
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
}
.recent {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-16);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
  overflow: hidden;
}
.recent__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  box-shadow: inset 0 -1px 0 var(--line-alternative);
}
.recent__row:last-child {
  box-shadow: none;
}
.recent__row:active {
  background: var(--fill-alternative);
}
.recent__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.recent__name {
  color: var(--label-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.recent__desc {
  color: var(--label-alternative);
}
.recent__amount {
  color: var(--label-normal);
  flex-shrink: 0;
}

/* family */
.family {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-16);
  background: var(--accent-warm-tint);
  color: var(--label-normal);
}
.family__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--background-normal);
  color: var(--accent-warm-strong);
  flex-shrink: 0;
}
.family__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.family__sub {
  color: var(--label-alternative);
}
</style>
