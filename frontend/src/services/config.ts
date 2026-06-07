/**
 * 데이터 소스 스위치 (단일 출처).
 * VITE_USE_MOCK 이 'false' 일 때만 실 백엔드를 호출하고,
 * 그 외(미설정 포함)에는 mock 으로 동작한다.
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

/** 인증 토큰 보관 키 (Supabase access_token) */
export const TOKEN_KEY = 'eum_access_token'
