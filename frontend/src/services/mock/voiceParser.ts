/**
 * mock 음성 파서 — 실제로는 백엔드가 Gemini 로 구조화 파싱하지만,
 * mock 에서는 가벼운 키워드 규칙으로 그럴듯한 후보를 만든다.
 * 응답 모양(VoiceCandidate)은 실 API 와 동일.
 */
import type { AssetType, VoiceCandidate } from '@/types'

const BANKS = ['농협', '국민', '신한', '우리', '하나', '기업', '카카오뱅크', '토스뱅크', '새마을금고']
const INSURERS = ['삼성생명', '한화생명', '교보생명', '삼성화재', '현대해상', '메리츠']
const CRYPTO = ['비트코인', '이더리움', '업비트', '빗썸', '코인']
const REALESTATE = ['아파트', '집', '주택', '부동산', '오피스텔', '상가', '땅', '토지']

/** "삼천만원", "1억", "500만원" 같은 표현 → 원 단위 정수 (대표 케이스만) */
function parseAmount(text: string): number | null {
  const cleaned = text.replace(/,/g, '')
  // 1) "1억", "2억 5천" 류
  const eok = cleaned.match(/(\d+)\s*억/)
  const cheon = cleaned.match(/(\d+)\s*천만/)
  const man = cleaned.match(/(\d+)\s*만/)
  let total = 0
  if (eok) total += parseInt(eok[1], 10) * 100_000_000
  if (cheon) total += parseInt(cheon[1], 10) * 10_000_000
  if (man && !cheon) total += parseInt(man[1], 10) * 10_000
  if (total > 0) return total

  // 2) 한글 수사 간단 케이스
  const koMap: Record<string, number> = { 일: 1, 이: 2, 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9 }
  const koEok = cleaned.match(/([일이삼사오육칠팔구])\s*억/)
  const koCheonman = cleaned.match(/([일이삼사오육칠팔구])\s*천만/)
  if (koEok) total += koMap[koEok[1]] * 100_000_000
  if (koCheonman) total += koMap[koCheonman[1]] * 10_000_000
  return total > 0 ? total : null
}

function detect(text: string, list: string[]): string | null {
  return list.find((w) => text.includes(w)) ?? null
}

export function parseVoiceText(text: string): VoiceCandidate[] {
  const amount = parseAmount(text)

  const bank = detect(text, BANKS)
  const insurer = detect(text, INSURERS)
  const crypto = detect(text, CRYPTO)
  const realestate = detect(text, REALESTATE)

  let asset_type: AssetType = 'bank'
  let institution: string | null = null
  let asset_name = '예금'

  if (insurer) {
    asset_type = 'insurance'
    institution = insurer.endsWith('생명') || insurer.endsWith('화재') ? insurer : `${insurer}`
    asset_name = '보험'
  } else if (crypto) {
    asset_type = 'crypto'
    institution = ['업비트', '빗썸'].includes(crypto) ? crypto : null
    asset_name = crypto === '이더리움' ? '이더리움' : '비트코인'
  } else if (realestate) {
    asset_type = 'realestate'
    institution = null
    asset_name = '부동산'
  } else if (bank) {
    asset_type = 'bank'
    institution = bank.endsWith('뱅크') ? bank : `${bank}은행`
    asset_name = text.includes('정기') ? '정기예금' : '예금'
  }

  // 인식된 단서가 전혀 없으면 빈 후보 (UI 가 직접 입력 fallback 유도)
  if (!bank && !insurer && !crypto && !realestate && amount === null) {
    return []
  }

  const confidence = Math.min(
    0.95,
    0.55 + (institution ? 0.2 : 0) + (amount !== null ? 0.15 : 0)
  )

  return [
    {
      asset_type,
      institution,
      asset_name,
      amount,
      confidence: Math.round(confidence * 100) / 100,
    },
  ]
}
