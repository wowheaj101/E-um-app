/**
 * 자산 스토어 — 목록 캐시 + CRUD.
 * 화면은 assetService 를 직접 부르지 않고 이 스토어를 거친다.
 */
import { defineStore } from 'pinia'
import { assetService } from '@/services'
import type { Asset, AssetCreate, AssetUpdate } from '@/types'

interface AssetState {
  items: Asset[]
  loading: boolean
  error: string | null
  loaded: boolean
}

export const useAssetStore = defineStore('asset', {
  state: (): AssetState => ({
    items: [],
    loading: false,
    error: null,
    loaded: false,
  }),
  getters: {
    count: (s): number => s.items.length,
    /** 금액이 확인된 자산 합계(원) */
    totalAmount: (s): number =>
      s.items.reduce((sum, a) => sum + (a.amount ?? 0), 0),
    byType: (s) => {
      return (type: Asset['asset_type']) => s.items.filter((a) => a.asset_type === type)
    },
  },
  actions: {
    async fetch(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        this.items = await assetService.list()
        this.loaded = true
      } catch (e) {
        this.error = e instanceof Error ? e.message : '자산을 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    async add(payload: AssetCreate): Promise<Asset> {
      const created = await assetService.create(payload)
      this.items.unshift(created)
      return created
    },
    async edit(id: string, payload: AssetUpdate): Promise<Asset> {
      const updated = await assetService.update(id, payload)
      const idx = this.items.findIndex((a) => a.id === id)
      if (idx >= 0) this.items[idx] = updated
      return updated
    },
    async remove(id: string): Promise<void> {
      await assetService.remove(id)
      this.items = this.items.filter((a) => a.id !== id)
    },
  },
})
