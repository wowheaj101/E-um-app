/**
 * 디지털 유산 스토어 — 목록 캐시 + 추가/삭제.
 * 화면은 legacyService 를 직접 부르지 않고 이 스토어를 거친다(assetStore 와 동일 패턴).
 */
import { defineStore } from 'pinia'
import { legacyService } from '@/services'
import type { LegacyCreate, LegacyNote } from '@/types'

interface LegacyState {
  items: LegacyNote[]
  loading: boolean
  error: string | null
  loaded: boolean
}

export const useLegacyStore = defineStore('legacy', {
  state: (): LegacyState => ({
    items: [],
    loading: false,
    error: null,
    loaded: false,
  }),
  getters: {
    count: (s): number => s.items.length,
  },
  actions: {
    async fetch(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        this.items = await legacyService.list()
        this.loaded = true
      } catch (e) {
        this.error = e instanceof Error ? e.message : '유산 노트를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    async add(payload: LegacyCreate): Promise<LegacyNote> {
      const created = await legacyService.create(payload)
      this.items.unshift(created)
      return created
    },
    async remove(id: string): Promise<void> {
      await legacyService.remove(id)
      this.items = this.items.filter((n) => n.id !== id)
    },
  },
})
