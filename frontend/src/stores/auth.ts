/**
 * 인증·모드 스토어.
 * - role(senior/helper) 과 화면 mode 를 보관.
 * - mode 변경 시 <html data-mode> 를 갱신 → 시니어 모드 글자/터치 확대.
 */
import { defineStore } from 'pinia'
import { authService } from '@/services'
import type { SignupPayload } from '@/services'
import { TOKEN_KEY } from '@/services/config'
import type { Role, User } from '@/types'

export type ViewMode = 'senior' | 'helper'

interface AuthState {
  user: User | null
  mode: ViewMode
  loading: boolean
}

function applyMode(mode: ViewMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.mode = mode
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    mode: 'senior',
    loading: false,
  }),
  getters: {
    role: (s): Role => (s.user?.role ?? 'senior'),
    isSenior: (s): boolean => s.mode === 'senior',
    isAuthenticated: (s): boolean => s.user !== null,
    displayName: (s): string => s.user?.name ?? '사용자',
  },
  actions: {
    setMode(mode: ViewMode) {
      this.mode = mode
      applyMode(mode)
    },
    /** 회원가입. 가입 즉시 로그인되면 user 설정, 메일 확인 필요면 needsConfirm=true */
    async signup(payload: SignupPayload): Promise<{ needsConfirm: boolean }> {
      this.loading = true
      try {
        const { user, needsConfirm } = await authService.signup(payload)
        if (user) {
          this.user = user
          this.setMode(user.role === 'helper' ? 'helper' : 'senior')
        }
        return { needsConfirm }
      } finally {
        this.loading = false
      }
    },
    /** 이메일/비밀번호 로그인 (real: Supabase, mock: 이메일로 role 추론) */
    async login(email: string, password: string) {
      this.loading = true
      try {
        this.user = await authService.login(email, password)
        this.setMode(this.user.role === 'helper' ? 'helper' : 'senior')
      } finally {
        this.loading = false
      }
    },
    /** mock 데모 로그인 (role 선택). 로그인 화면 없이 둘러보기용 */
    async loginAs(role: Role) {
      this.loading = true
      try {
        this.user = await authService.mockLogin(role)
        localStorage.setItem(TOKEN_KEY, `mock-${role}-token`)
        this.setMode(role === 'helper' ? 'helper' : 'senior')
      } finally {
        this.loading = false
      }
    },
    /** 부팅 시 저장된 토큰으로 프로필 복원. 토큰이 만료/무효면 폐기. */
    async restore() {
      if (!localStorage.getItem(TOKEN_KEY)) return
      this.loading = true
      try {
        this.user = await authService.me()
        this.setMode(this.user.role === 'helper' ? 'helper' : 'senior')
      } catch {
        this.logout()
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
    },
  },
})
