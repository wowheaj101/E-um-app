/**
 * 디지털 유산 서비스 — 남기고 싶은 계정·자산 정보를 안전 보관.
 * USE_MOCK 분기. 핵심: content(평문) 는 서버에서 AES 암호화 후 보관되고
 * 목록 응답엔 내용이 포함되지 않는다(본인만 접근 — 명세서 §3).
 */
import { USE_MOCK } from './config'
import { request } from './http'
import { delay, legacyNotes as mockNotes, SENIOR_ID, uuid } from './mock/db'
import type { DeletedResult, LegacyCreate, LegacyNote } from '@/types'

export const legacyService = {
  async list(): Promise<LegacyNote[]> {
    if (USE_MOCK) return delay([...mockNotes])
    return request<LegacyNote[]>({ url: '/legacy', method: 'GET' })
  },

  async create(payload: LegacyCreate): Promise<LegacyNote> {
    if (USE_MOCK) {
      // mock: content 는 저장만(암호화 시뮬레이션) 하고 응답엔 노출하지 않음
      const note: LegacyNote = {
        id: uuid(),
        user_id: SENIOR_ID,
        category: payload.category,
        title: payload.title,
        trigger_type: payload.trigger_type ?? 'manual',
        trigger_date: payload.trigger_date ?? null,
        created_at: new Date().toISOString(),
      }
      mockNotes.unshift(note)
      return delay(note, 400)
    }
    return request<LegacyNote>({ url: '/legacy', method: 'POST', data: payload })
  },

  async remove(id: string): Promise<DeletedResult> {
    if (USE_MOCK) {
      const idx = mockNotes.findIndex((n) => n.id === id)
      if (idx >= 0) mockNotes.splice(idx, 1)
      return delay({ id, deleted: true })
    }
    return request<DeletedResult>({ url: `/legacy/${id}`, method: 'DELETE' })
  },
}
