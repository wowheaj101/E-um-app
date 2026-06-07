/** fds_logs 테이블 / schemas.py FdsLog 계열과 1:1 */

export type PatternType = 'time' | 'amount' | 'device'

export interface FdsLog {
  id: string
  user_id: string
  pattern_type: PatternType
  detail: Record<string, unknown> | null
  is_locked: boolean
  detected_at: string
}

export interface FdsLockRequest {
  senior_id?: string | null
  reason?: string | null
}

export interface FdsUnlockRequest {
  otp: string
}

export interface FdsLockResult {
  is_locked: boolean
  log_id: string | null
}
