<script setup lang="ts">
/**
 * SignupView — 회원가입 (이름·이메일·비밀번호·역할).
 * real: Supabase GoTrue /signup. role/name 을 user_metadata(data)로 보내
 * handle_new_user 트리거가 public.users 에 반영. Confirm email ON 이면 메일 확인 안내.
 * mock: 즉시 데모 로그인.
 */
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<Role>('senior')
const error = ref<string | null>(null)
const submitting = ref(false)
const confirmSent = ref(false)

const ROLES: { value: Role; label: string; icon: 'person' | 'heart'; desc: string }[] = [
  { value: 'senior', label: '시니어', icon: 'person', desc: '내 자산을 관리해요' },
  { value: 'helper', label: '조력자', icon: 'heart', desc: '가족 자산을 함께 지켜봐요' },
]

const canSubmit = computed(
  () => name.value.trim().length > 0 && email.value.trim().length > 0 && password.value.length >= 6
)

function goLogin() {
  router.replace({ name: 'login', query: route.query })
}

async function submit() {
  if (!canSubmit.value) return
  error.value = null
  submitting.value = true
  try {
    const { needsConfirm } = await auth.signup({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    })
    if (needsConfirm) {
      confirmSent.value = true
      return
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '회원가입에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="page">
    <section class="brand">
      <BrandLogo variant="lockup" :size="40" />
      <p class="wt-body1 brand__tag">처음 오셨나요? 계정을 만들어요.</p>
    </section>

    <!-- 가입 완료(메일 확인 필요) -->
    <section v-if="confirmSent" class="confirm">
      <span class="confirm__icon"><AppIcon name="circleCheck" :size="28" /></span>
      <h2 class="wt-heading1">확인 메일을 보냈어요</h2>
      <p class="wt-body1 confirm__text">
        <strong>{{ email }}</strong> 로 보낸 메일의 링크를 누른 뒤<br />로그인해 주세요.
      </p>
      <BaseButton size="lg" full-width @click="goLogin">로그인하러 가기</BaseButton>
    </section>

    <!-- 가입 폼 -->
    <form v-else class="form" @submit.prevent="submit">
      <div class="field">
        <span class="wt-label1 field__label">역할</span>
        <div class="roles">
          <button
            v-for="r in ROLES"
            :key="r.value"
            type="button"
            class="role"
            :class="{ 'role--on': role === r.value }"
            @click="role = r.value"
          >
            <AppIcon :name="r.icon" :size="22" />
            <span class="wt-headline2 role__label">{{ r.label }}</span>
            <span class="wt-label2 role__desc">{{ r.desc }}</span>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="wt-label1 field__label" for="su-name">이름</label>
        <input id="su-name" v-model="name" class="field__input wt-body1" autocomplete="name" placeholder="홍길동" />
      </div>

      <div class="field">
        <label class="wt-label1 field__label" for="su-email">이메일</label>
        <input
          id="su-email"
          v-model="email"
          class="field__input wt-body1"
          type="email"
          autocomplete="username"
          inputmode="email"
          placeholder="you@example.com"
        />
      </div>

      <div class="field">
        <label class="wt-label1 field__label" for="su-pw">비밀번호</label>
        <input
          id="su-pw"
          v-model="password"
          class="field__input wt-body1"
          type="password"
          autocomplete="new-password"
          placeholder="6자 이상"
        />
      </div>

      <div v-if="error" class="error wt-label1">
        <AppIcon name="circleExclamation" :size="16" /> {{ error }}
      </div>

      <BaseButton type="submit" size="lg" full-width :disabled="!canSubmit || submitting">
        {{ submitting ? '가입 중…' : '회원가입' }}
      </BaseButton>
    </form>

    <p v-if="!confirmSent" class="switch wt-body2">
      이미 계정이 있으신가요?
      <button class="switch__link" @click="goLogin">로그인</button>
    </p>
  </main>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
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

/* role picker */
.roles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.role {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px;
  border: none;
  border-radius: var(--radius-14);
  background: var(--background-normal);
  box-shadow: inset 0 0 0 1px var(--line-normal);
  color: var(--label-alternative);
  cursor: pointer;
  text-align: left;
  transition: box-shadow var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}
.role--on {
  color: var(--primary-normal);
  box-shadow: inset 0 0 0 2px var(--primary-normal);
  background: var(--primary-tint);
}
.role__label {
  color: var(--label-normal);
  margin-top: 2px;
}
.role--on .role__label {
  color: var(--primary-heavy);
}
.role__desc {
  color: var(--label-alternative);
}

/* switch */
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

/* confirm */
.confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 12px 0;
}
.confirm__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: var(--accent-background-green);
  color: var(--accent-foreground-green);
}
.confirm h2 {
  color: var(--label-normal);
}
.confirm__text {
  color: var(--label-alternative);
  margin-bottom: 8px;
}
.confirm__text strong {
  color: var(--label-normal);
}
</style>
