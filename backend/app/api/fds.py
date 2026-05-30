"""FDS / 긴급 잠금 API (명세서 §3.2 FDS)."""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from ..core.responses import ok
from ..deps import get_current_user
from ..schemas import (
    ApiResponse,
    FdsLockRequest,
    FdsLockResult,
    FdsLog,
    FdsUnlockRequest,
    PatternType,
)

router = APIRouter(prefix="/fds", tags=["fds"])

_SENIOR_ID = UUID("00000000-0000-0000-0000-000000000001")
_MOCK_LOGS = [
    FdsLog(
        id=UUID("ff111111-1111-1111-1111-111111111111"),
        user_id=_SENIOR_ID,
        pattern_type=PatternType.time,
        detail={"time": "03:14", "note": "심야 시간대 접근"},
        is_locked=False,
        detected_at=datetime(2026, 5, 30, 3, 14, tzinfo=timezone.utc),
    ),
    FdsLog(
        id=UUID("ff222222-2222-2222-2222-222222222222"),
        user_id=_SENIOR_ID,
        pattern_type=PatternType.amount,
        detail={"amount": 9_000_000, "note": "평소 대비 큰 금액"},
        is_locked=True,
        detected_at=datetime(2026, 5, 30, 3, 15, tzinfo=timezone.utc),
    ),
]


@router.post("/lock", response_model=ApiResponse[FdsLockResult], summary="긴급 잠금 실행")
async def lock(body: FdsLockRequest, current=Depends(get_current_user)):
    # TODO(4단계): fds_logs(is_locked=true) 기록 + 계정 잠금 상태 반영
    return ok(FdsLockResult(is_locked=True, log_id=uuid4()))


@router.post("/unlock", response_model=ApiResponse[FdsLockResult], summary="OTP 인증 후 해제")
async def unlock(body: FdsUnlockRequest, current=Depends(get_current_user)):
    # TODO(4단계): OTP 검증 → 잠금 해제. 데모는 6자리 숫자면 통과.
    if not (body.otp.isdigit() and len(body.otp) == 6):
        raise HTTPException(status_code=400, detail="OTP는 6자리 숫자여야 합니다.")
    return ok(FdsLockResult(is_locked=False, log_id=None))


@router.get("/logs", response_model=ApiResponse[list[FdsLog]], summary="이상 감지 로그 조회")
async def logs(current=Depends(get_current_user)):
    return ok(_MOCK_LOGS)
