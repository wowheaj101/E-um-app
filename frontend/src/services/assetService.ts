/**
 * 자산 도메인 서비스 — UI/스토어는 이 인터페이스만 바라본다.
 * USE_MOCK 에 따라 mock(인메모리) ↔ real(백엔드 /assets) 로 분기.
 * 두 분기 모두 동일한 src/types 를 반환한다.
 */
import { USE_MOCK } from './config'
import { request } from './http'
import { assets as mockAssets, delay, SENIOR_ID, uuid } from './mock/db'
import { parseVoiceText } from './mock/voiceParser'
import type {
  Asset,
  AssetCreate,
  AssetUpdate,
  DeletedResult,
  OcrResult,
  VoiceParseResult,
} from '@/types'

export const assetService = {
  async list(): Promise<Asset[]> {
    if (USE_MOCK) return delay([...mockAssets])
    return request<Asset[]>({ url: '/assets', method: 'GET' })
  },

  async create(payload: AssetCreate): Promise<Asset> {
    if (USE_MOCK) {
      const asset: Asset = {
        id: uuid(),
        user_id: SENIOR_ID,
        asset_type: payload.asset_type,
        asset_name: payload.asset_name,
        institution: payload.institution ?? null,
        amount: payload.amount ?? null,
        source: payload.source ?? 'manual',
      }
      mockAssets.unshift(asset)
      return delay(asset)
    }
    return request<Asset>({ url: '/assets', method: 'POST', data: payload })
  },

  async update(id: string, payload: AssetUpdate): Promise<Asset> {
    if (USE_MOCK) {
      const target = mockAssets.find((a) => a.id === id)
      if (!target) throw new Error('자산을 찾을 수 없습니다.')
      Object.assign(target, payload)
      return delay({ ...target })
    }
    return request<Asset>({ url: `/assets/${id}`, method: 'PATCH', data: payload })
  },

  async remove(id: string): Promise<DeletedResult> {
    if (USE_MOCK) {
      const idx = mockAssets.findIndex((a) => a.id === id)
      if (idx >= 0) mockAssets.splice(idx, 1)
      return delay({ id, deleted: true })
    }
    return request<DeletedResult>({ url: `/assets/${id}`, method: 'DELETE' })
  },

  async parseVoice(text: string): Promise<VoiceParseResult> {
    if (USE_MOCK) return delay({ candidates: parseVoiceText(text) }, 600)
    return request<VoiceParseResult>({
      url: '/assets/voice',
      method: 'POST',
      data: { text },
    })
  },

  async ocr(file: File): Promise<OcrResult> {
    if (USE_MOCK) {
      return delay(
        {
          extracted: { institution: '국민은행', asset_name: '정기예금', amount: 5_000_000 },
          raw_text: `국민은행 정기예금 5,000,000원 (mock OCR: ${file.name})`,
        },
        700
      )
    }
    const form = new FormData()
    form.append('file', file)
    return request<OcrResult>({
      url: '/assets/ocr',
      method: 'POST',
      data: form,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
