<script setup lang="ts">
/**
 * VoiceInputView — 음성으로 자산 추가 (AI 하이라이트).
 * 마이크 → 텍스트 → parseVoice(Gemini/mock) → 후보 확인 → 추가.
 * 미지원 브라우저는 텍스트 입력 fallback.
 */
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import MicIcon from '@/components/common/MicIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AssetAvatar from '@/components/asset/AssetAvatar.vue'
import { useSpeech } from '@/composables/useSpeech'
import { useAssetStore } from '@/stores/asset'
import { assetService } from '@/services'
import { assetTypeLabel, formatKRW } from '@/utils/format'
import type { VoiceCandidate } from '@/types'

const router = useRouter()
const assetStore = useAssetStore()
const { supported, listening, transcript, error, start, stop } = useSpeech()

const text = ref('')
const analyzing = ref(false)
const candidates = ref<VoiceCandidate[] | null>(null)
const added = ref<Set<number>>(new Set())

// 음성 인식 결과를 편집 가능한 text 로 반영
watch(transcript, (v) => {
  if (v) text.value = v
})

function toggleMic() {
  if (listening.value) stop()
  else {
    candidates.value = null
    added.value = new Set()
    start()
  }
}

async function analyze() {
  if (!text.value.trim()) return
  analyzing.value = true
  candidates.value = null
  try {
    const result = await assetService.parseVoice(text.value.trim())
    candidates.value = result.candidates
  } finally {
    analyzing.value = false
  }
}

async function addCandidate(c: VoiceCandidate, idx: number) {
  await assetStore.add({
    asset_type: c.asset_type,
    asset_name: c.asset_name,
    institution: c.institution,
    amount: c.amount,
    source: 'voice',
  })
  added.value = new Set(added.value).add(idx)
}

const EXAMPLES = ['농협에 천이백만원 예금 있어', '삼성생명 종신보험 들었어', '국민은행 정기예금 삼천만원']
</script>

<template>
  <AppHeader title="음성으로 추가" back />

  <main class="page">
    <p class="lead wt-body1">
      자산을 말로 알려주세요.<br />예: <em>"농협에 천이백만원 있어"</em>
    </p>

    <!-- 마이크 -->
    <section class="mic-zone">
      <button
        class="mic"
        :class="{ 'mic--on': listening }"
        :aria-pressed="listening"
        aria-label="마이크"
        @click="toggleMic"
      >
        <MicIcon :size="44" />
      </button>
      <p class="mic__status wt-headline2">
        <span v-if="listening">듣고 있어요…</span>
        <span v-else-if="supported">마이크를 눌러 말씀해 주세요</span>
        <span v-else>이 기기는 음성 입력을 지원하지 않아요. 아래에 입력해 주세요</span>
      </p>
    </section>

    <!-- 입력/편집 (fallback 겸용) -->
    <section class="field">
      <label class="wt-label1 field__label" for="voice-text">인식된 내용 (직접 고칠 수 있어요)</label>
      <textarea
        id="voice-text"
        v-model="text"
        class="field__input wt-body1"
        rows="3"
        placeholder="여기에 자산을 입력하거나 말씀해 주세요"
      />
      <div v-if="error" class="field__error wt-label1">
        <AppIcon name="circleExclamation" :size="16" /> {{ error }}
      </div>
      <div class="examples">
        <button v-for="ex in EXAMPLES" :key="ex" class="chip wt-label2" @click="text = ex">
          {{ ex }}
        </button>
      </div>
    </section>

    <BaseButton size="lg" full-width :disabled="!text.trim() || analyzing" @click="analyze">
      <template #leading><AppIcon name="search" :size="20" /></template>
      {{ analyzing ? '분석 중…' : '분석하기' }}
    </BaseButton>

    <!-- 후보 -->
    <section v-if="candidates" class="results">
      <h3 class="wt-heading2 results__title">이렇게 정리했어요</h3>

      <div v-if="candidates.length === 0" class="empty wt-body1">
        <AppIcon name="circleInfo" :size="24" />
        <span>내용을 알아듣지 못했어요. 다시 말하거나 직접 입력해 주세요.</span>
      </div>

      <div v-for="(c, idx) in candidates" :key="idx" class="cand">
        <AssetAvatar :type="c.asset_type" :size="48" />
        <div class="cand__info">
          <span class="wt-body1 cand__name">{{ c.institution || assetTypeLabel(c.asset_type) }} {{ c.asset_name }}</span>
          <span class="wt-label2 cand__meta">
            {{ assetTypeLabel(c.asset_type) }} · {{ formatKRW(c.amount) }}
            <span class="conf">확신도 {{ Math.round(c.confidence * 100) }}%</span>
          </span>
        </div>
        <BaseButton
          v-if="!added.has(idx)"
          variant="solid"
          size="md"
          @click="addCandidate(c, idx)"
        >
          추가
        </BaseButton>
        <span v-else class="done wt-label1"><AppIcon name="circleCheck" :size="20" /> 완료</span>
      </div>

      <BaseButton
        v-if="added.size > 0"
        variant="weak"
        size="lg"
        full-width
        class="goto"
        @click="router.push('/assets')"
      >
        내 자산에서 확인하기
      </BaseButton>
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

/* mic */
.mic-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}
.mic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 112px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--primary-normal);
  color: var(--static-white);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-standard), background var(--duration-base) var(--ease-standard);
}
.mic:active {
  transform: scale(0.96);
}
.mic--on {
  background: var(--accent-warm-strong);
  animation: pulse 1.4s ease-out infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(248, 184, 32, 0.5); }
  100% { box-shadow: 0 0 0 24px rgba(248, 184, 32, 0); }
}
.mic__status {
  color: var(--label-neutral);
  text-align: center;
}

/* field */
.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field__label {
  color: var(--label-alternative);
}
.field__input {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
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
.field__error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--status-negative);
}
.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  border: none;
  background: var(--fill-normal);
  color: var(--label-neutral);
  padding: 8px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
}
.chip:active {
  background: var(--fill-strong);
}

/* results */
.results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.results__title {
  color: var(--label-normal);
}
.empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: var(--radius-12);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
  color: var(--label-alternative);
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
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.conf {
  color: var(--accent-warm-strong);
  font-weight: 600;
}
.done {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--status-positive);
  flex-shrink: 0;
}
.goto {
  margin-top: 4px;
}
</style>
