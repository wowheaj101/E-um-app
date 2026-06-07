/**
 * 인증·모드 스토어.
 * - role(senior/helper) 과 화면 mode 를 보관.
 * - mode 변경 시 <html data-mode> 를 갱신 → 시니어 모드 글자/터치 확대.
 */
import { defineStore } from 'pinia'
import { authService } from '@/services'
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
    /** mock 데모 로그인 (role 선택). 실연동 시 Supabase 세션으로 대체 */
    async loginAs(role: Role) {
      this.loading = true
      try {
        this.user = await authService.mockLogin(role)
        // mock 토큰 — 실연동 시 Supabase access_token 으로 교체
        localStorage.setItem(TOKEN_KEY, `mock-${role}-token`)
        this.setMode(role === 'helper' ? 'helper' : 'senior')
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
