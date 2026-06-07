<script setup lang="ts">
/**
 * AssetListView — 자산 전체 목록.
 * 합계 요약 + 유형 구분 리스트. 로딩/빈/에러 상태 처리.
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/common/AppHeader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AssetAvatar from '@/components/asset/AssetAvatar.vue'
import { useAssetStore } from '@/stores/asset'
import { assetTypeLabel, formatKRW, sourceLabel } from '@/utils/format'
import type { Asset, AssetType } from '@/types'

const router = useRouter()
const assetStore = useAssetStore()
const { items, loading, error, totalAmount, count } = storeToRefs(assetStore)

const TYPE_ORDER: AssetType[] = ['bank', 'insurance', 'realestate', 'crypto']
const groups = computed(() =>
  TYPE_ORDER.map((type) => ({
    type,
    label: assetTypeLabel(type),
    assets: items.value.filter((a) => a.asset_type === type),
  })).filter((g) => g.assets.length > 0)
)

function displayName(a: Asset): string {
  return a.institution ? `${a.institution} ${a.asset_name}` : a.asset_name
}

onMounted(() => assetStore.fetch())
</script>

<template>
  <AppHeader title="내 자산" back>
    <template #right>
      <button class="icon-btn" aria-label="추가" @click="router.push('/voice')">
        <AppIcon name="plus" :size="24" />
      </button>
    </template>
  </AppHeader>

  <main class="page">
    <!-- 합계 요약 -->
    <section class="summary">
      <span class="wt-label1 summary__label">총 자산</span>
      <strong class="wt-title2 summary__amount">{{ formatKRW(totalAmount) }}</strong>
      <span class="wt-label2 summary__count">{{ count }}건</span>
    </section>

    <!-- 로딩 -->
    <div v-if="loading && count === 0" class="state">
      <div v-for="n in 3" :key="n" class="skeleton" />
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="state state--error">
      <AppIcon name="triangleExclamation" :size="28" />
      <p class="wt-body1">{{ error }}</p>
      <BaseButton variant="weak" size="md" @click="assetStore.fetch(true)">다시 시도</BaseButton>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="count === 0" class="state state--empty">
      <AppIcon name="coins" :size="36" />
      <p class="wt-body1">아직 등록한 자산이 없어요.</p>
      <BaseButton size="lg" @click="router.push('/voice')">음성으로 첫 자산 추가</BaseButton>
    </div>

    <!-- 목록 -->
    <template v-else>
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

      <BaseButton class="add-btn" size="lg" full-width @click="router.push('/voice')">
        <template #leading><AppIcon name="plus" :size="20" /></template>
        음성으로 자산 추가
      </BaseButton>
    </template>
  </main>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px var(--gutter-mobile) 40px;
  background: var(--background-normal-alternative);
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
}
.icon-btn:hover {
  background: var(--fill-normal);
}

.summary {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  padding: 20px;
  border-radius: var(--radius-16);
  background: var(--primary-tint);
}
.summary__label {
  color: var(--label-alternative);
  width: 100%;
}
.summary__amount {
  color: var(--primary-heavy);
}
.summary__count {
  color: var(--label-alternative);
}

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

.add-btn {
  margin-top: 4px;
}

/* states */
.state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.state--error,
.state--empty {
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
