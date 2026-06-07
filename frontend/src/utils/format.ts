/** 금액·표시 포맷 유틸 */

/** 12000000 → "1,200만원" (시니어 가독성: 만/억 단위 한글 혼용) */
export function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined) return '미상'
  if (amount === 0) return '0원'

  const eok = Math.floor(amount / 100_000_000)
  const man = Math.floor((amount % 100_000_000) / 10_000)
  const won = amount % 10_000

  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString('ko-KR')}억`)
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`)
  if (won > 0) parts.push(`${won.toLocaleString('ko-KR')}`)
  return parts.join(' ') + '원'
}

/** 12000000 → "12,000,000원" (정확 표기용) */
export function formatWon(amount: number | null): string {
  if (amount === null || amount === undefined) return '미상'
  return `${amount.toLocaleString('ko-KR')}원`
}

const ASSET_TYPE_LABEL: Record<string, string> = {
  bank: '예금·적금',
  insurance: '보험',
  realestate: '부동산',
  crypto: '가상자산',
}

export function assetTypeLabel(type: string): string {
  return ASSET_TYPE_LABEL[type] ?? type
}

const SOURCE_LABEL: Record<string, string> = {
  voice: '음성',
  ocr: '사진',
  manual: '직접입력',
}

export function sourceLabel(source: string): string {
  return SOURCE_LABEL[source] ?? source
}
