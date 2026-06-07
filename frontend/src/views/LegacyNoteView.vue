<script setup lang="ts">
/**
 * LegacyNoteView — 디지털 유산 노트.
 * 남기고 싶은 계정·자산 정보를 남긴다. content(평문)는 저장 시 AES 암호화되어
 * 목록 응답엔 노출되지 않으며 본인만 접근(명세서 §3). 목록 + 추가 + 삭제.
 */
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/common/AppHeader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useLegacyStore } from '@/stores/legacy'
import { legacyCategoryLabel } from '@/utils/format'
import type { IconName } from '@/components/common/icons'
import type { LegacyCategory, LegacyNote, TriggerType } from '@/types'

const legacyStore = useLegacyStore()
const { items, loading, error, count } = storeToRefs(legacyStore)

const CATEGORIES: LegacyCategory[] = ['sns', 'crypto', 'subscription']
const CATEGORY_ICON: Record<LegacyCategory, IconName> = {
  sns: 'message',
  crypto: 'globe',
  subscription: 'calendar',
}

const showForm = ref(false)
const saving = ref(false)
const removingId = ref<string | null>(null)

const form = ref<{
  category: LegacyCategory
  title: string
  content: string
  trigger_type: TriggerType
  trigger_date: string
}>({
  category: 'sns',
  title: '',
  content: '',
  trigger_type: 'manual',
  trigger_date: '',
})

const canSave = computed(
  () =>
    form.value.title.trim().length > 0 &&
    form.value.content.trim().length > 0 &&
    (form.value.trigger_type === 'manual' || form.value.trigger_date.length > 0)
)

function triggerLabel(note: LegacyNote): string {
  if (note.trigger_type === 'date' && note.trigger_date) {
    return `${new Date(note.trigger_date).toLocaleDateString('ko-KR')} 이후 전달`
  }
  return '가족이 직접 확인'
}

function openForm() {
  form.value = { category: 'sns', title: '', content: '', trigger_type: 'manual', trigger_date: '' }
  showForm.value = true
}

async function save() {
  if (!canSave.value) return
  saving.value = true
  try {
    await legacyStore.add({
      category: form.value.category,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      trigger_type: form.value.trigger_type,
      trigger_date: form.value.trigger_type === 'date' ? form.value.trigger_date : null,
    })
    showForm.value = false
  } finally {
    saving.value = false
  }
}

async function remove(note: LegacyNote) {
  if (!window.confirm(`'${note.title}' 항목을 삭제할까요?`)) return
  removingId.value = note.id
  try {
    await legacyStore.remove(note.id)
  } finally {
    removingId.value = null
  }
}

onMounted(() => legacyStore.fetch())
</script>

<template>
  <AppHeader title="디지털 유산" back />

  <main class="page">
    <!-- 보안 인트로 -->
    <section class="intro">
      <span class="intro__icon"><AppIcon name="heart" :size="22" /></span>
      <p class="wt-body2 intro__text">
        남기고 싶은 계정·자산 정보를 남겨요.<br />
        내용은 <strong>암호화되어 본인만</strong> 볼 수 있어요.
      </p>
    </section>

    <!-- 로딩 -->
    <div v-if="loading && count === 0" class="state">
      <div v-for="n in 2" :key="n" class="skeleton" />
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="state state--error">
      <AppIcon name="triangleExclamation" :size="28" />
      <p class="wt-body1">{{ error }}</p>
      <BaseButton variant="weak" size="md" @click="legacyStore.fetch(true)">다시 시도</BaseButton>
    </div>

    <!-- 목록 -->
    <template v-else>
      <div v-if="count === 0 && !showForm" class="state state--empty">
        <AppIcon name="bookmark" :size="36" />
        <p class="wt-body1">아직 남긴 항목이 없어요.</p>
      </div>

      <section v-else class="list">
        <article v-for="note in items" :key="note.id" class="note">
          <span class="note__icon"><AppIcon :name="CATEGORY_ICON[note.category]" :size="22" /></span>
          <div class="note__info">
            <span class="wt-body1 note__title">{{ note.title }}</span>
            <span class="wt-label2 note__meta">{{ legacyCategoryLabel(note.category) }} · {{ triggerLabel(note) }}</span>
            <span class="wt-label2 note__sealed"><AppIcon name="circleCheck" :size="13" /> 내용 암호화됨</span>
          </div>
          <button
            class="note__del"
            aria-label="삭제"
            :disabled="removingId === note.id"
            @click="remove(note)"
          >
            <AppIcon name="trash" :size="20" />
          </button>
        </article>
      </section>

      <!-- 추가 폼 -->
      <section v-if="showForm" class="form">
        <h3 class="wt-heading2 form__title">새 항목 남기기</h3>

        <div class="field">
          <span class="wt-label1 field__label">종류</span>
          <div class="seg">
            <button
              v-for="c in CATEGORIES"
              :key="c"
              class="seg__btn wt-label1"
              :class="{ 'seg__btn--on': form.category === c }"
              @click="form.category = c"
            >
              {{ legacyCategoryLabel(c) }}
            </button>
          </div>
        </div>

        <div class="field">
          <label class="wt-label1 field__label" for="lg-title">제목</label>
          <input id="lg-title" v-model="form.title" class="field__input wt-body1" placeholder="예: 카카오 계정" />
        </div>

        <div class="field">
          <label class="wt-label1 field__label" for="lg-content">내용 (아이디·비밀번호·메모)</label>
          <textarea
            id="lg-content"
            v-model="form.content"
            class="field__input wt-body1"
            rows="3"
            placeholder="가족에게 전할 정보를 적어 주세요"
          />
          <span class="wt-label2 field__hint"><AppIcon name="circleCheck" :size="13" /> 저장 시 암호화돼요</span>
        </div>

        <div class="field">
          <span class="wt-label1 field__label">언제 전달할까요?</span>
          <div class="seg seg--2">
            <button
              class="seg__btn wt-label1"
              :class="{ 'seg__btn--on': form.trigger_type === 'manual' }"
              @click="form.trigger_type = 'manual'"
            >
              가족이 직접 확인
            </button>
            <button
              class="seg__btn wt-label1"
              :class="{ 'seg__btn--on': form.trigger_type === 'date' }"
              @click="form.trigger_type = 'date'"
            >
              특정 날짜 이후
            </button>
          </div>
          <input
            v-if="form.trigger_type === 'date'"
            v-model="form.trigger_date"
            class="field__input wt-body1"
            type="date"
          />
        </div>

        <div class="form__actions">
          <BaseButton variant="weak" size="lg" @click="showForm = false">취소</BaseButton>
          <BaseButton size="lg" full-width :disabled="!canSave || saving" @click="save">
            {{ saving ? '저장 중…' : '안전하게 저장' }}
          </BaseButton>
        </div>
      </section>

      <!-- 추가 버튼 -->
      <BaseButton v-else class="add-btn" size="lg" full-width @click="openForm">
        <template #leading><AppIcon name="plus" :size="20" /></template>
        새 항목 남기기
      </BaseButton>
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

/* intro */
.intro {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-16);
  background: var(--accent-background-violet);
  color: var(--accent-foreground-violet);
}
.intro__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--background-normal);
  color: var(--accent-foreground-violet);
  flex-shrink: 0;
}
.intro__text {
  line-height: 1.5;
  align-self: center;
}
.intro__text strong {
  font-weight: 700;
}

/* list */
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.note {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-16);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
}
.note__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-12);
  background: var(--accent-background-violet);
  color: var(--accent-foreground-violet);
  flex-shrink: 0;
}
.note__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.note__title {
  color: var(--label-normal);
}
.note__meta {
  color: var(--label-alternative);
}
.note__sealed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--status-positive);
}
.note__del {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  color: var(--label-alternative);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.note__del:hover:not(:disabled) {
  background: var(--status-negative-bg);
  color: var(--status-negative);
}
.note__del:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* form */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 16px;
  border-radius: var(--radius-16);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
}
.form__title {
  color: var(--label-normal);
}
.form__actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
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
  resize: vertical;
  padding: 14px 16px;
  border-radius: var(--radius-12);
  border: none;
  background: var(--background-normal-alternative);
  box-shadow: inset 0 0 0 1px var(--line-normal);
  color: var(--label-normal);
  font-family: var(--font-sans);
}
.field__input:focus {
  outline: none;
  box-shadow: inset 0 0 0 1px var(--primary-normal), 0 0 0 3px var(--primary-tint);
}
.field__hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--status-positive);
}

/* segmented */
.seg {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.seg--2 {
  grid-template-columns: 1fr 1fr;
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
  height: 76px;
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
