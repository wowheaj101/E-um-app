/**
 * 조력자 도메인 서비스 — 가족 연결 + read-only 대시보드.
 * USE_MOCK 분기, 두 분기 모두 동일한 src/types 반환.
 * 핵심: 대시보드는 SELECT 전용. 이체·수정 권한은 RLS 가 차단(명세서 §3).
 */
import { USE_MOCK } from './config'
import { request } from './http'
import { assets as mockAssets, delay, helpers as mockHelpers, seniorUser } from './mock/db'
import type { Helper, HelperDashboard } from '@/types'

export const helperService = {
  /** 현재 사용자와 연결된 조력자 관계 목록 */
  async list(): Promise<Helper[]> {
    if (USE_MOCK) return delay([...mockHelpers])
    return request<Helper[]>({ url: '/helpers', method: 'GET' })
  },

  /** 조력자용 read-only 자산 대시보드 (특정 시니어) */
  async dashboard(seniorId: string): Promise<HelperDashboard> {
    if (USE_MOCK) {
      const list = [...mockAssets]
      return delay(
        {
          senior: seniorUser,
          assets: list,
          asset_count: list.length,
          total_amount: list.reduce((sum, a) => sum + (a.amount ?? 0), 0),
        },
        400
      )
    }
    return request<HelperDashboard>({ url: `/helpers/dashboard/${seniorId}`, method: 'GET' })
  },
}
