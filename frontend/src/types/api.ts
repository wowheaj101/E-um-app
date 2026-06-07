/**
 * 공통 API 계약 — 백엔드 `schemas.py` 의 ApiResponse 래퍼와 1:1.
 * 모든 응답: { success, data, error }
 */

export interface ApiError {
  code: string
  message: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: ApiError | null
}

export interface DeletedResult {
  id: string
  deleted: boolean
}
