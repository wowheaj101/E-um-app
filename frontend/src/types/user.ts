/** users 테이블 / schemas.py User 와 1:1 */

export type Role = 'senior' | 'helper'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  created_at: string
}
