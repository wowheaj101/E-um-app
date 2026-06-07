/**
 * 인증 서비스. mock 에서는 role 만 골라 즉시 로그인된 사용자를 돌려주고,
 * real 에서는 /auth/me 로 현재 사용자 프로필을 가져온다.
 * (실제 Supabase 로그인 플로우는 실연동 단계에서 연결)
 */
import { USE_MOCK } from './config'
import { request } from './http'
import { delay, helperUser, seniorUser } from './mock/db'
import type { Role, User } from '@/types'

export const authService = {
  /** mock 전용: role 을 골라 데모 사용자로 로그인 */
  async mockLogin(role: Role): Promise<User> {
    return delay(role === 'helper' ? helperUser : seniorUser, 200)
  },

  async me(): Promise<User> {
    if (USE_MOCK) return delay(seniorUser, 200)
    return request<User>({ url: '/auth/me', method: 'GET' })
  },
}
