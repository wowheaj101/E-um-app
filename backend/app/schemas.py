"""
이음(E-UM) API 스키마 (Pydantic v2) — 요청/응답 계약.

명세서 §3 API 명세 + §2 DB 설계 + §4.4 프론트 타입(types/asset.ts)과 1:1 매핑.
snake_case 필드명 유지(명세서 §3.1).
"""
from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Any, Generic, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

# =============================================================
# 공통 응답 래퍼 (명세서 §3.1)
#   { "success": true, "data": {...}, "error": null }
# =============================================================
T = TypeVar("T")


class ApiError(BaseModel):
    code: str = Field(..., examples=["NOT_FOUND"])
    message: str = Field(..., examples=["리소스를 찾을 수 없습니다."])


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[ApiError] = None


class DeletedResult(BaseModel):
    id: UUID
    deleted: bool = True


# =============================================================
# 열거형 (DB CHECK 제약과 동일)
# =============================================================
class Role(str, Enum):
    senior = "senior"
    helper = "helper"


class AssetType(str, Enum):
    bank = "bank"
    insurance = "insurance"
    realestate = "realestate"
    crypto = "crypto"


class AssetSource(str, Enum):
    voice = "voice"
    ocr = "ocr"
    manual = "manual"


class HelperStatus(str, Enum):
    pending = "pending"
    active = "active"
    revoked = "revoked"


class LegacyCategory(str, Enum):
    sns = "sns"
    crypto = "crypto"
    subscription = "subscription"


class TriggerType(str, Enum):
    date = "date"
    manual = "manual"


class PatternType(str, Enum):
    time = "time"
    amount = "amount"
    device = "device"


# =============================================================
# 인증 / 사용자 (users)
# =============================================================
class User(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: Role
    created_at: datetime


class LoginRequest(BaseModel):
    access_token: str = Field(
        ..., description="Supabase 소셜 로그인으로 발급된 JWT (콜백에서 전달)"
    )


# =============================================================
# 자산 (assets) — 응답은 types/asset.ts 와 1:1
# =============================================================
class Asset(BaseModel):
    id: UUID
    user_id: UUID
    asset_type: AssetType
    asset_name: str
    institution: Optional[str] = None
    amount: Optional[int] = Field(default=None, description="금액(원), 미상 시 null")
    source: AssetSource


class AssetCreate(BaseModel):
    asset_type: AssetType
    asset_name: str
    institution: Optional[str] = None
    amount: Optional[int] = None
    source: AssetSource = AssetSource.manual


class AssetUpdate(BaseModel):
    asset_type: Optional[AssetType] = None
    asset_name: Optional[str] = None
    institution: Optional[str] = None
    amount: Optional[int] = None


# --- POST /assets/voice ---
class VoiceParseRequest(BaseModel):
    text: str = Field(..., examples=["농협에 돈 넣어뒀어"])


class VoiceCandidate(BaseModel):
    asset_type: AssetType
    institution: Optional[str] = None
    asset_name: str
    amount: Optional[int] = None
    confidence: float = Field(..., ge=0, le=1, examples=[0.82])


class VoiceParseResult(BaseModel):
    candidates: list[VoiceCandidate]


# --- POST /assets/ocr ---
class OcrExtracted(BaseModel):
    institution: Optional[str] = None
    asset_name: Optional[str] = None
    amount: Optional[int] = None


class OcrResult(BaseModel):
    extracted: OcrExtracted
    raw_text: str


# =============================================================
# 가족 / 조력자 (helpers)
# =============================================================
class Helper(BaseModel):
    id: UUID
    senior_id: UUID
    helper_id: UUID
    permission_level: str = "read_only"
    invited_at: datetime
    accepted_at: Optional[datetime] = None
    status: HelperStatus


class HelperInviteRequest(BaseModel):
    email: EmailStr = Field(..., description="초대할 조력자(자녀) 이메일")


class HelperAcceptRequest(BaseModel):
    invitation_id: UUID = Field(..., description="수락할 초대(helpers.id)")


class HelperDashboard(BaseModel):
    """조력자용 read-only 자산 대시보드."""
    senior: User
    assets: list[Asset]
    asset_count: int
    total_amount: int = Field(..., description="금액이 확인된 자산 합계(원)")


# =============================================================
# FDS / 긴급 잠금 (fds_logs)
# =============================================================
class FdsLog(BaseModel):
    id: UUID
    user_id: UUID
    pattern_type: PatternType
    detail: Optional[dict[str, Any]] = None
    is_locked: bool = False
    detected_at: datetime


class FdsLockRequest(BaseModel):
    senior_id: Optional[UUID] = Field(
        default=None, description="조력자가 대상 시니어를 잠글 때. 본인이면 생략"
    )
    reason: Optional[str] = None


class FdsUnlockRequest(BaseModel):
    otp: str = Field(..., min_length=4, max_length=8, examples=["123456"])


class FdsLockResult(BaseModel):
    is_locked: bool
    log_id: Optional[UUID] = None


# =============================================================
# 디지털 유산 (digital_legacy)
#   응답에는 encrypted_data(민감정보)를 포함하지 않는다.
# =============================================================
class LegacyNote(BaseModel):
    id: UUID
    user_id: UUID
    category: LegacyCategory
    title: str
    trigger_type: TriggerType
    trigger_date: Optional[date] = None
    created_at: datetime


class LegacyCreate(BaseModel):
    category: LegacyCategory
    title: str
    content: str = Field(..., description="저장할 평문 — 서버에서 AES 암호화 후 encrypted_data 로 보관")
    trigger_type: TriggerType = TriggerType.manual
    trigger_date: Optional[date] = None
