<script setup lang="ts">
/**
 * HelperDashboardView — 가족(조력자)에게 보이는 read-only 자산 화면.
 * 핵심 메시지: 조력자는 '함께 지켜보기'만 — 이체·수정·삭제 불가(명세서 §3, RLS SELECT 전용).
 * 시니어가 "내 자산이 가족에게 어떻게 보이는지" 확인하는 안심 동선이기도 하다.
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/common/AppHeader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AssetAvatar from '@/components/asset/AssetAvatar.vue'
import { useHelperStore } from '@/stores/helper'
import { assetTypeLabel, formatKRW, sourceLabel } from '@/utils/format'
import type { Asset, AssetType } from '@/types'

const router = useRouter()
const helperStore = useHelperStore()
const { senior, assets, totalAmount, assetCount, loading, error, activeLink } = storeToRefs(helperStore)

const TYPE_ORDER: AssetType[] = ['bank', 'insurance', 'realestate', 'crypto']
const groups = computed(() =>
  TYPE_ORDER.map((type) => ({
    type,
    label: assetTypeLabel(type),
    assets: assets.value.filter((a) => a.asset_type === type),
  })).filter((g) => g.assets.length > 0)
)

/** 조력자 이름 — mock 관계의 helper 표기(시연: 김민준) */
const helperName = computed(() => '김민준')

function displayName(a: Asset): string {
  return a.institution ? `${a.institution} ${a.asset_name}` : a.asset_name
}

onMounted(() => helperStore.loadDashboard())
</script>

<template>
  <AppHeader title="가족에게 보이는 화면" back />

  <main class="page">
    <!-- 로딩 -->
    <div v-if="loading && !senior" class="state">
      <div v-for="n in 3" :key="n" class="skeleton" />
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="state state--error">
      <AppIcon name="triangleExclamation" :size="28" />
      <p class="wt-body1">{{ error }}</p>
      <BaseButton variant="weak" size="md" @click="helperStore.loadDashboard(true)">다시 시도</BaseButton>
    </div>

    <template v-else>
      <!-- 관계 카드 -->
      <section class="relation">
        <span class="relation__avatar"><AppIcon name="person" :size="26" /></span>
        <span class="relation__text">
          <span class="wt-headline1 relation__name">{{ helperName }} 님</span>
          <span class="wt-label1 relation__role">자녀 · 조력자</span>
        </span>
        <span class="badge wt-label2"><AppIcon name="circleCheck" :size="14" /> 읽기 전용</span>
      </section>

      <!-- read-only 안심 배너 -->
      <section class="guard">
        <AppIcon name="circleCheck" :size="22" />
        <p class="wt-body2 guard__text">
          {{ helperName }} 님은 자산을 <strong>함께 지켜보기만</strong> 할 수 있어요.<br />
          이체·수정·삭제는 <strong>할 수 없습니다.</strong>
        </p>
      </section>

      <!-- 자산 합계 (navy hero) -->
      <section class="hero">
        <span class="wt-label1 hero__label">{{ senior?.name }} 님의 자산</span>
        <strong class="hero__amount">{{ formatKRW(totalAmount) }}</strong>
        <div class="hero__meta wt-body2">
          <AppIcon name="coins" :size="18" />
          <span>총 {{ assetCount }}건 · 안전하게 연결됨</span>
        </div>
      </section>

      <!-- 자산 목록 (read-only) -->
      <section v-for="g in groups" :key="g.type" class="group">
        <h3 class="wt-label1 group__title">{{ g.label }}</h3>
        <div class="card-list">
          <div v-for="a in g.assets" :key="a.id" class="row">
            <AssetAvatar :type="a.asset_type" :size="48" />
            <span class="row__info">
              <span class="wt-body1 row__name">{{ displayName(a) }}</span>
              <span class="wt-label2 row__tag">
                <AppIcon
                  :name="a.source === 'voice' ? 'circleCheck' : a.source === 'ocr' ? 'bookmark' : 'person'"
                  :size="14"
                />
                {{ sourceLabel(a.source) }}
              </span>
            </span>
            <span class="wt-headline2 row__amount">{{ formatKRW(a.amount) }}</span>
          </div>
        </div>
      </section>

      <!-- 푸터 안내 -->
      <p class="foot wt-label2">
        <AppIcon name="circleInfo" :size="14" />
        연결을 끊으면 {{ helperName }} 님은 더 이상 자산을 볼 수 없어요.
      </p>
      <p v-if="activeLink" class="foot foot--meta wt-label2">
        연결됨 · {{ new Date(activeLink.accepted_at ?? activeLink.invited_at).toLocaleDateString('ko-KR') }}부터
      </p>
    </template>
  </main>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px var(--gutter-mobile) 40px;
  background: var(--background-normal-alternative);
}

/* 관계 카드 */
.relation {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-16);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
}
.relation__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: var(--accent-warm-tint);
  color: var(--accent-warm-strong);
  flex-shrink: 0;
}
.relation__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.relation__name {
  color: var(--label-normal);
}
.relation__role {
  color: var(--label-alternative);
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: var(--accent-background-green);
  color: var(--accent-foreground-green);
  font-weight: 600;
  flex-shrink: 0;
}

/* read-only 안심 배너 */
.guard {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  border-radius: var(--radius-16);
  background: var(--accent-background-green);
  color: var(--accent-foreground-green);
}
.guard :deep(svg) {
  flex-shrink: 0;
  margin-top: 1px;
}
.guard__text {
  line-height: 1.5;
}
.guard__text strong {
  font-weight: 700;
}

/* navy hero */
.hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 22px 24px;
  border-radius: var(--radius-20);
  background: linear-gradient(135deg, var(--navy-40), var(--navy-30));
  color: var(--static-white);
}
.hero__label {
  color: rgba(255, 255, 255, 0.82);
}
.hero__amount {
  font-size: 32px;
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

/* 자산 목록 */
.group__title {
  color: var(--label-alternative);
  margin-bottom: 8px;
  padding-left: 4px;
}
.card-list {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-16);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
  overflow: hidden;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  box-shadow: inset 0 -1px 0 var(--line-alternative);
}
.row:last-child {
  box-shadow: none;
}
.row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.row__name {
  color: var(--label-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--label-alternative);
}
.row__amount {
  color: var(--label-normal);
  flex-shrink: 0;
}

/* 푸터 */
.foot {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--label-alternative);
  padding: 0 4px;
}
.foot--meta {
  margin-top: -10px;
  padding-left: 23px;
}

/* states */
.state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.state--error {
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  color: var(--label-alternative);
}
.state--error :deep(svg) {
  color: var(--status-cautionary);
}
.skeleton {
  height: 72px;
  border-radius: var(--radius-16);
  background: linear-gradient(90deg, var(--fill-normal), var(--fill-alternative), var(--fill-normal));
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
