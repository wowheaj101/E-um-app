<script setup lang="ts">
/**
 * LoginView — 이메일/비밀번호 로그인.
 * real: Supabase GoTrue 로 access_token 발급(authStore.login).
 * mock: 이메일로 role 추론 + '데모로 둘러보기' 제공.
 * 로그인 성공 시 redirect 쿼리(또는 홈)로 이동.
 */
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { USE_MOCK } from '@/services'
import type { Role } from '@/types'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

function go() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(redirect)
}

async function submit() {
  if (!email.value.trim() || !password.value) return
  error.value = null
  submitting.value = true
  try {
    await auth.login(email.value, password.value)
    go()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '로그인에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

async function demo(role: Role) {
  error.value = null
  submitting.value = true
  try {
    await auth.loginAs(role)
    go()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="page">
    <section class="brand">
      <BrandLogo variant="lockup" :size="44" />
      <p class="wt-body1 brand__tag">시니어-가족을 잇는 안심 자산관리</p>
    </section>

    <form class="form" @submit.prevent="submit">
      <div class="field">
        <label class="wt-label1 field__label" for="login-email">이메일</label>
        <input
          id="login-email"
          v-model="email"
          class="field__input wt-body1"
          type="email"
          autocomplete="username"
          inputmode="email"
          placeholder="you@example.com"
        />
      </div>

      <div class="field">
        <label class="wt-label1 field__label" for="login-pw">비밀번호</label>
        <input
          id="login-pw"
          v-model="password"
          class="field__input wt-body1"
          type="password"
          autocomplete="current-password"
          placeholder="비밀번호"
          @keyup.enter="submit"
        />
      </div>

      <div v-if="error" class="error wt-label1">
        <AppIcon name="circleExclamation" :size="16" /> {{ error }}
      </div>

      <BaseButton
        type="submit"
        size="lg"
        full-width
        :disabled="!email.trim() || !password || submitting"
      >
        {{ submitting ? '로그인 중…' : '로그인' }}
      </BaseButton>
    </form>

    <p class="switch wt-body2">
      계정이 없으신가요?
      <button class="switch__link" @click="router.push({ name: 'signup', query: route.query })">회원가입</button>
    </p>

    <!-- mock 모드: 로그인 없이 둘러보기 -->
    <section v-if="USE_MOCK" class="demo">
      <div class="demo__divider"><span class="wt-label2">또는 데모로 둘러보기</span></div>
      <div class="demo__actions">
        <BaseButton variant="weak" size="md" full-width @click="demo('senior')">
          <template #leading><AppIcon name="person" :size="18" /></template>
          시니어로 체험
        </BaseButton>
        <BaseButton variant="weak" size="md" full-width @click="demo('helper')">
          <template #leading><AppIcon name="heart" :size="18" /></template>
          조력자로 체험
        </BaseButton>
      </div>
      <p class="demo__hint wt-label2">데모는 가짜 데이터로 동작해요. 실제 서버에 연결되지 않습니다.</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  padding: 32px var(--gutter-mobile) 48px;
  background: var(--background-normal-alternative);
  min-height: 100dvh;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.brand__tag {
  color: var(--label-alternative);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
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
.error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--status-negative);
}

.switch {
  text-align: center;
  color: var(--label-alternative);
}
.switch__link {
  border: none;
  background: transparent;
  color: var(--primary-normal);
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: inherit;
  cursor: pointer;
  padding: 0 2px;
}

/* demo */
.demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.demo__divider {
  position: relative;
  text-align: center;
  color: var(--label-assistive);
}
.demo__divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--line-normal);
}
.demo__divider span {
  position: relative;
  padding: 0 12px;
  background: var(--background-normal-alternative);
}
.demo__actions {
  display: flex;
  gap: 10px;
}
.demo__hint {
  text-align: center;
  color: var(--label-assistive);
}
</style>
