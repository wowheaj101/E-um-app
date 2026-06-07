/** helpers 테이블 / schemas.py Helper 계열과 1:1 */

import type { Asset } from './asset'
import type { User } from './user'

export type HelperStatus = 'pending' | 'active' | 'revoked'

export interface Helper {
  id: string
  senior_id: string
  helper_id: string
  permission_level: string
  invited_at: string
  accepted_at: string | null
  status: HelperStatus
}

export interface HelperInviteRequest {
  email: string
}

export interface HelperAcceptRequest {
  invitation_id: string
}

/** 조력자용 read-only 자산 대시보드 */
export interface HelperDashboard {
  senior: User
  assets: Asset[]
  asset_count: number
  total_amount: number
}
