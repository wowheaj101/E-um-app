/**
 * assets 테이블 / schemas.py Asset 계열과 1:1 (snake_case 유지).
 * enum 값은 DB CHECK 제약과 동일.
 */

export type AssetType = 'bank' | 'insurance' | 'realestate' | 'crypto'
export type AssetSource = 'voice' | 'ocr' | 'manual'

export interface Asset {
  id: string
  user_id: string
  asset_type: AssetType
  asset_name: string
  institution: string | null
  amount: number | null
  source: AssetSource
}

export interface AssetCreate {
  asset_type: AssetType
  asset_name: string
  institution?: string | null
  amount?: number | null
  source?: AssetSource
}

export interface AssetUpdate {
  asset_type?: AssetType
  asset_name?: string
  institution?: string | null
  amount?: number | null
}

/* --- POST /assets/voice --- */
export interface VoiceParseRequest {
  text: string
}

export interface VoiceCandidate {
  asset_type: AssetType
  institution: string | null
  asset_name: string
  amount: number | null
  confidence: number
}

export interface VoiceParseResult {
  candidates: VoiceCandidate[]
}

/* --- POST /assets/ocr --- */
export interface OcrExtracted {
  institution: string | null
  asset_name: string | null
  amount: number | null
}

export interface OcrResult {
  extracted: OcrExtracted
  raw_text: string
}
