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

/**
 * Supabase Auth(GoTrue) 직접 호출용 — 프론트에서 access_token 발급.
 * anon/publishable(공개) 키만 사용한다. service_role 키는 절대 넣지 말 것.
 * USE_MOCK=false 일 때만 필요.
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
