/**
 * 인증 서비스.
 * - real: Supabase GoTrue(/auth/v1/token)로 직접 로그인해 access_token 발급 →
 *   토큰 저장 후 백엔드 /auth/me 로 프로필 조회. (supabase-js SDK 미사용 — axios 직접)
 * - mock: 이메일로 role 을 추론해 데모 사용자를 즉시 반환.
 */
import axios from 'axios'
import { SUPABASE_ANON_KEY, SUPABASE_URL, TOKEN_KEY, USE_MOCK } from './config'
import { request } from './http'
import { delay, helperUser, seniorUser } from './mock/db'
import type { Role, User } from '@/types'

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: Role
}

export interface SignupResult {
  /** 가입 즉시 로그인된 사용자(Confirm email OFF). null 이면 메일 확인 필요 */
  user: User | null
  /** true 면 확인 메일을 보냈고 아직 로그인되지 않음 */
  needsConfirm: boolean
}

function ensureSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase 설정이 없습니다. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 확인하세요.')
  }
}

/** GoTrue 오류 메시지 추출 */
function gotrueMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as { error_description?: string; msg?: string; error?: string } | undefined
    return d?.error_description || d?.msg || d?.error || fallback
  }
  return err instanceof Error ? err.message : fallback
}

const GOTRUE_HEADERS = { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }

/** Supabase GoTrue password grant → access_token */
async function supabaseSignIn(email: string, password: string): Promise<string> {
  ensureSupabaseConfig()
  try {
    const res = await axios.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email, password },
      { headers: GOTRUE_HEADERS, timeout: 15000 }
    )
    const token = res.data?.access_token
    if (!token) throw new Error('로그인 응답에 토큰이 없습니다.')
    return token as string
  } catch (err) {
    throw new Error(gotrueMessage(err, '이메일 또는 비밀번호가 올바르지 않습니다.'))
  }
}

export const authService = {
  /** mock 전용: role 을 골라 데모 사용자로 로그인 */
  async mockLogin(role: Role): Promise<User> {
    return delay(role === 'helper' ? helperUser : seniorUser, 200)
  },

  /** 회원가입 → (Confirm email OFF면) 토큰 저장 후 사용자 반환, ON이면 메일 확인 안내 */
  async signup(payload: SignupPayload): Promise<SignupResult> {
    const { name, email, password, role } = payload
    if (USE_MOCK) {
      const user = await this.mockLogin(role)
      localStorage.setItem(TOKEN_KEY, `mock-${role}-token`)
      return { user: { ...user, name: name.trim() || user.name, role }, needsConfirm: false }
    }
    ensureSupabaseConfig()
    let res
    try {
      res = await axios.post(
        `${SUPABASE_URL}/auth/v1/signup`,
        { email: email.trim(), password, data: { name: name.trim(), role } },
        { headers: GOTRUE_HEADERS, timeout: 15000 }
      )
    } catch (err) {
      throw new Error(gotrueMessage(err, '회원가입에 실패했습니다.'))
    }
    const token = res.data?.access_token
    if (!token) {
      // Confirm email 이 켜져 있어 세션이 없는 경우
      return { user: null, needsConfirm: true }
    }
    localStorage.setItem(TOKEN_KEY, token)
    return { user: await this.me(), needsConfirm: false }
  },

  /** 이메일/비밀번호 로그인 → 토큰 저장 후 사용자 프로필 반환 */
  async login(email: string, password: string): Promise<User> {
    const trimmed = email.trim()
    if (USE_MOCK) {
      const role: Role = trimmed.toLowerCase().includes('helper') ? 'helper' : 'senior'
      const user = await this.mockLogin(role)
      localStorage.setItem(TOKEN_KEY, `mock-${role}-token`)
      return user
    }
    const token = await supabaseSignIn(trimmed, password)
    localStorage.setItem(TOKEN_KEY, token)
    return this.me()
  },

  async me(): Promise<User> {
    if (USE_MOCK) return delay(seniorUser, 200)
    return request<User>({ url: '/auth/me', method: 'GET' })
  },
}
