/**
 * 실 백엔드 호출 레이어 (axios).
 * - 공통 응답 래퍼 { success, data, error } 를 벗겨 data 만 반환.
 * - error 가 있으면 ApiRequestError 로 throw.
 * - Authorization: Bearer <token> 자동 부착 (localStorage).
 * mock 모드에서는 사용되지 않는다 (services/* 가 분기).
 */
import axios, { type AxiosRequestConfig } from 'axios'
import { API_BASE_URL, TOKEN_KEY } from './config'
import type { ApiError, ApiResponse } from '@/types'

export class ApiRequestError extends Error {
  code: string
  constructor(error: ApiError | null, fallback = '요청을 처리하지 못했습니다.') {
    super(error?.message || fallback)
    this.name = 'ApiRequestError'
    this.code = error?.code || 'UNKNOWN'
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

/** 공통 래퍼를 벗겨 내부 data 를 반환 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await client.request<ApiResponse<T>>(config)
    const body = res.data
    if (!body || body.success === false || body.error) {
      throw new ApiRequestError(body?.error ?? null)
    }
    return body.data as T
  } catch (err) {
    if (err instanceof ApiRequestError) throw err
    if (axios.isAxiosError(err)) {
      const apiErr = err.response?.data as ApiResponse<unknown> | undefined
      throw new ApiRequestError(apiErr?.error ?? null, err.message)
    }
    throw err
  }
}

export default client
