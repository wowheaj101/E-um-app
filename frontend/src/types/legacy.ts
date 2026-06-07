/** digital_legacy 테이블 / schemas.py LegacyNote 계열과 1:1 */

export type LegacyCategory = 'sns' | 'crypto' | 'subscription'
export type TriggerType = 'date' | 'manual'

export interface LegacyNote {
  id: string
  user_id: string
  category: LegacyCategory
  title: string
  trigger_type: TriggerType
  trigger_date: string | null
  created_at: string
}

export interface LegacyCreate {
  category: LegacyCategory
  title: string
  /** 평문 — 서버에서 AES 암호화 후 encrypted_data 로 보관 */
  content: string
  trigger_type?: TriggerType
  trigger_date?: string | null
}
