/**
 * 조력자 스토어 — 연결 관계 + read-only 대시보드 캐시.
 * 화면은 helperService 를 직접 부르지 않고 이 스토어를 거친다(assetStore 와 동일 패턴).
 */
import { defineStore } from 'pinia'
import { helperService } from '@/services'
import type { Helper, HelperDashboard } from '@/types'

interface HelperState {
  links: Helper[]
  dashboard: HelperDashboard | null
  loading: boolean
  error: string | null
}

export const useHelperStore = defineStore('helper', {
  state: (): HelperState => ({
    links: [],
    dashboard: null,
    loading: false,
    error: null,
  }),
  getters: {
    senior: (s) => s.dashboard?.senior ?? null,
    assets: (s) => s.dashboard?.assets ?? [],
    totalAmount: (s): number => s.dashboard?.total_amount ?? 0,
    assetCount: (s): number => s.dashboard?.asset_count ?? 0,
    /** 활성 연결(없으면 첫 관계) */
    activeLink: (s): Helper | null =>
      s.links.find((l) => l.status === 'active') ?? s.links[0] ?? null,
  },
  actions: {
    /** 연결된 시니어의 read-only 대시보드를 불러온다 */
    async loadDashboard(force = false) {
      if (this.dashboard && !force) return
      this.loading = true
      this.error = null
      try {
        this.links = await helperService.list()
        const link = this.activeLink
        if (!link) {
          this.error = '연결된 가족이 없습니다.'
          return
        }
        this.dashboard = await helperService.dashboard(link.senior_id)
      } catch (e) {
        this.error = e instanceof Error ? e.message : '가족 자산을 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
  },
})
