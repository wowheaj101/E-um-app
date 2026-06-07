/**
 * mock 인메모리 데이터 (세션 동안 유지·변경 가능).
 * 타입은 백엔드 schemas.py 와 1:1 정렬된 src/types 를 그대로 사용 →
 * mock 과 real 의 응답 모양이 강제로 같아져 표류를 막는다.
 */
import type { Asset, FdsLog, Helper, LegacyNote, User } from '@/types'

export const SENIOR_ID = '11111111-1111-1111-1111-111111111111'
export const HELPER_ID = '22222222-2222-2222-2222-222222222222'

export const seniorUser: User = {
  id: SENIOR_ID,
  email: 'senior@example.com',
  name: '김순자',
  role: 'senior',
  created_at: '2026-01-04T09:00:00Z',
}

export const helperUser: User = {
  id: HELPER_ID,
  email: 'helper@example.com',
  name: '김민준',
  role: 'helper',
  created_at: '2026-01-05T09:00:00Z',
}

/** 시니어(김순자)의 자산 — 시연용 현실감 있는 구성 */
export const assets: Asset[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    user_id: SENIOR_ID,
    asset_type: 'bank',
    asset_name: '주거래 예금',
    institution: '농협은행',
    amount: 12_000_000,
    source: 'voice',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    user_id: SENIOR_ID,
    asset_type: 'bank',
    asset_name: '정기예금',
    institution: '국민은행',
    amount: 30_000_000,
    source: 'ocr',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    user_id: SENIOR_ID,
    asset_type: 'insurance',
    asset_name: '종신보험',
    institution: '삼성생명',
    amount: null,
    source: 'manual',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    user_id: SENIOR_ID,
    asset_type: 'realestate',
    asset_name: '자택 아파트',
    institution: null,
    amount: 250_000_000,
    source: 'manual',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    user_id: SENIOR_ID,
    asset_type: 'crypto',
    asset_name: '비트코인',
    institution: '업비트',
    amount: 3_500_000,
    source: 'manual',
  },
]

export const helpers: Helper[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    senior_id: SENIOR_ID,
    helper_id: HELPER_ID,
    permission_level: 'read_only',
    invited_at: '2026-01-06T09:00:00Z',
    accepted_at: '2026-01-06T10:30:00Z',
    status: 'active',
  },
]

export const legacyNotes: LegacyNote[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    user_id: SENIOR_ID,
    category: 'sns',
    title: '카카오 계정',
    trigger_type: 'manual',
    trigger_date: null,
    created_at: '2026-02-01T09:00:00Z',
  },
]

export const fdsLogs: FdsLog[] = []

/** mock 네트워크 지연 시뮬레이션 */
export function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
