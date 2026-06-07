<script setup lang="ts">
/**
 * OcrInputView — 사진으로 자산 추가.
 * 카메라/앨범 → 이미지 → ocr(Gemini Vision/mock) → 추출값 편집 → 추가.
 * VoiceInputView 와 짝을 이루는 입력 수단(자산 등록 UX 완결).
 */
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AssetAvatar from '@/components/asset/AssetAvatar.vue'
import { useAssetStore } from '@/stores/asset'
import { assetService } from '@/services'
import { assetTypeLabel, formatWon } from '@/utils/format'
import type { AssetType, OcrResult } from '@/types'

const router = useRouter()
const assetStore = useAssetStore()

const cameraInput = ref<HTMLInputElement | null>(null)
const albumInput = ref<HTMLInputElement | null>(null)

const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const analyzing = ref(false)
const result = ref<OcrResult | null>(null)
const added = ref(false)
const showRaw = ref(false)

// 편집 가능한 자산 폼 (OCR 추출값으로 채워짐)
const TYPES: AssetType[] = ['bank', 'insurance', 'realestate', 'crypto']
const form = ref<{ asset_type: AssetType; institution: string; asset_name: string; amount: number | null }>({
  asset_type: 'bank',
  institution: '',
  asset_name: '',
  amount: null,
})

const canAdd = computed(() => form.value.asset_name.trim().length > 0)

function openCamera() {
  cameraInput.value?.click()
}
function openAlbum() {
  albumInput.value?.click()
}

function onPick(e: Event) {
  const picked = (e.target as HTMLInputElement).files?.[0]
  if (!picked) return
  reset()
  file.value = picked
  previewUrl.value = URL.createObjectURL(picked)
  // 같은 파일 재선택도 change 이벤트가 뜨도록 input 비우기
  ;(e.target as HTMLInputElement).value = ''
  analyze()
}

async function analyze() {
  if (!file.value) return
  analyzing.value = true
  result.value = null
  try {
    const res = await assetService.ocr(file.value)
    result.value = res
    form.value = {
      asset_type: 'bank',
      institution: res.extracted.institution ?? '',
      asset_name: res.extracted.asset_name ?? '',
      amount: res.extracted.amount,
    }
  } finally {
    analyzing.value = false
  }
}

async function addAsset() {
  if (!canAdd.value) return
  await assetStore.add({
    asset_type: form.value.asset_type,
    asset_name: form.value.asset_name.trim(),
    institution: form.value.institution.trim() || null,
    amount: form.value.amount,
    source: 'ocr',
  })
  added.value = true
}

function reset() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  file.value = null
  previewUrl.value = null
  result.value = null
  analyzing.value = false
  added.value = false
  showRaw.value = false
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <AppHeader title="사진으로 추가" back />

  <main class="page">
    <p class="lead wt-body1">
      통장이나 증서를 찍어 주세요.<br />글자를 <em>자동으로 읽어</em> 정리해 드려요.
    </p>

    <!-- 숨김 파일 입력 (촬영 / 앨범) -->
    <input
      ref="cameraInput"
      class="sr-only"
      type="file"
      accept="image/*"
      capture="environment"
      @change="onPick"
    />
    <input ref="albumInput" class="sr-only" type="file" accept="image/*" @change="onPick" />

    <!-- 업로드 존 -->
    <section class="shot">
      <div v-if="previewUrl" class="preview">
        <img :src="previewUrl" alt="선택한 사진" class="preview__img" />
        <button class="preview__redo" @click="openAlbum">
          <AppIcon name="bookmark" :size="16" /> 다시 선택
        </button>
      </div>
      <button v-else class="dropzone" @click="openCamera">
        <span class="dropzone__icon"><AppIcon name="bookmark" :size="32" /></span>
        <span class="wt-headline2 dropzone__title">사진 찍기</span>
        <span class="wt-label2 dropzone__hint">통장·보험증서·등기부 등</span>
      </button>

      <div v-if="!previewUrl" class="shot__alt">
        <BaseButton variant="weak" size="md" @click="openAlbum">
          <template #leading><AppIcon name="bookmark" :size="18" /></template>
          앨범에서 선택
        </BaseButton>
      </div>
    </section>

    <!-- 분석 중 -->
    <section v-if="analyzing" class="analyzing">
      <span class="spinner" aria-hidden="true" />
      <p class="wt-body1">사진을 읽고 있어요…</p>
    </section>

    <!-- 결과 (편집 가능) -->
    <section v-else-if="result" class="results">
      <h3 class="wt-heading2 results__title">이렇게 읽었어요</h3>
      <p class="wt-label2 results__sub">내용이 다르면 직접 고친 뒤 추가해 주세요.</p>

      <!-- 미리보기 카드 -->
      <div class="cand">
        <AssetAvatar :type="form.asset_type" :size="48" />
        <div class="cand__info">
          <span class="wt-body1 cand__name">
            {{ form.institution || assetTypeLabel(form.asset_type) }} {{ form.asset_name || '자산명 미입력' }}
          </span>
          <span class="wt-label2 cand__meta">
            {{ assetTypeLabel(form.asset_type) }} · {{ formatWon(form.amount) }}
          </span>
        </div>
      </div>

      <!-- 유형 -->
      <div class="field">
        <span class="wt-label1 field__label">자산 유형</span>
        <div class="seg">
          <button
            v-for="t in TYPES"
            :key="t"
            class="seg__btn wt-label1"
            :class="{ 'seg__btn--on': form.asset_type === t }"
            @click="form.asset_type = t"
          >
            {{ assetTypeLabel(t) }}
          </button>
        </div>
      </div>

      <!-- 기관 -->
      <div class="field">
        <label class="wt-label1 field__label" for="ocr-inst">기관 (은행·보험사 등)</label>
        <input id="ocr-inst" v-model="form.institution" class="field__input wt-body1" placeholder="예: 국민은행" />
      </div>

      <!-- 자산명 -->
      <div class="field">
        <label class="wt-label1 field__label" for="ocr-name">자산명</label>
        <input id="ocr-name" v-model="form.asset_name" class="field__input wt-body1" placeholder="예: 정기예금" />
      </div>

      <!-- 금액 -->
      <div class="field">
        <label class="wt-label1 field__label" for="ocr-amount">금액 (원)</label>
        <input
          id="ocr-amount"
          v-model.number="form.amount"
          class="field__input wt-body1"
          type="number"
          inputmode="numeric"
          placeholder="모르면 비워 두세요"
        />
        <span v-if="form.amount" class="wt-label2 field__hint">{{ formatWon(form.amount) }}</span>
      </div>

      <!-- 원문 보기 -->
      <button class="raw-toggle wt-label1" @click="showRaw = !showRaw">
        <AppIcon :name="showRaw ? 'chevronDown' : 'chevronRight'" :size="16" />
        읽은 원문 보기
      </button>
      <pre v-if="showRaw" class="raw wt-label2">{{ result.raw_text }}</pre>

      <!-- 추가 -->
      <BaseButton v-if="!added" size="lg" full-width :disabled="!canAdd" @click="addAsset">
        <template #leading><AppIcon name="plus" :size="20" /></template>
        이 자산 추가하기
      </BaseButton>
      <template v-else>
        <div class="done-banner wt-body1">
          <AppIcon name="circleCheck" :size="22" /> 자산을 추가했어요.
        </div>
        <BaseButton variant="weak" size="lg" full-width @click="router.push('/assets')">
          내 자산에서 확인하기
        </BaseButton>
        <BaseButton variant="text" size="md" full-width @click="reset">사진 한 장 더 추가</BaseButton>
      </template>
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
.lead {
  color: var(--label-neutral);
  text-align: center;
}
.lead em {
  font-style: normal;
  color: var(--primary-normal);
  font-weight: 700;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* shot zone */
.shot {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 200px;
  padding: 28px;
  border: none;
  border-radius: var(--radius-20);
  background: var(--primary-tint);
  box-shadow: inset 0 0 0 2px var(--primary-normal);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-standard);
}
.dropzone:active {
  transform: scale(0.99);
}
.dropzone__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--primary-normal);
  color: var(--static-white);
}
.dropzone__title {
  color: var(--label-normal);
  margin-top: 4px;
}
.dropzone__hint {
  color: var(--label-alternative);
}
.shot__alt {
  display: flex;
  justify-content: center;
}

/* preview */
.preview {
  position: relative;
  border-radius: var(--radius-20);
  overflow: hidden;
  background: var(--fill-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
}
.preview__img {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  background: var(--static-black);
}
.preview__redo {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.62);
  color: var(--static-white);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* analyzing */
.analyzing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 0;
  color: var(--label-neutral);
}
.spinner {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 4px solid var(--primary-tint);
  border-top-color: var(--primary-normal);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* results */
.results {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.results__title {
  color: var(--label-normal);
}
.results__sub {
  color: var(--label-alternative);
  margin-top: -10px;
}
.cand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-16);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
}
.cand__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.cand__name {
  color: var(--label-normal);
}
.cand__meta {
  color: var(--label-alternative);
}

/* field */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field__label {
  color: var(--label-alternative);
}
.field__input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: var(--radius-12);
  border: none;
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
  color: var(--label-normal);
  font-family: var(--font-sans);
}
.field__input:focus {
  outline: none;
  box-shadow: inset 0 0 0 1px var(--primary-normal), 0 0 0 3px var(--primary-tint);
}
.field__hint {
  color: var(--primary-normal);
  font-weight: 600;
}

/* segmented type */
.seg {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.seg__btn {
  padding: 10px 4px;
  border: none;
  border-radius: var(--radius-10);
  background: var(--fill-normal);
  color: var(--label-alternative);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.seg__btn--on {
  background: var(--primary-normal);
  color: var(--static-white);
}

/* raw text */
.raw-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--label-neutral);
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.raw {
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--radius-12);
  background: var(--fill-alternative);
  color: var(--label-neutral);
  font-family: var(--font-mono, monospace);
  white-space: pre-wrap;
  word-break: break-all;
}

/* done */
.done-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: var(--radius-12);
  background: var(--status-positive-bg, var(--accent-warm-tint));
  color: var(--status-positive);
  font-weight: 600;
}
</style>
