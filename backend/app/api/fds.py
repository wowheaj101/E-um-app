"""FDS / 긴급 잠금 API (명세서 §3.2 FDS)."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from ..core import supabase
from ..core.responses import ok
from ..deps import Principal, get_current_principal
from ..schemas import (
    ApiResponse,
    FdsLockRequest,
    FdsLockResult,
    FdsLog,
    FdsUnlockRequest,
)

router = APIRouter(prefix="/fds", tags=["fds"])


async def _assert_active_helper(senior_id, helper_id) -> None:
    """helper_id 가 senior_id 의 활성 조력자인지 확인(아니면 403)."""
    rel = await supabase.select_one(
        "helpers", admin=True,
        params={"senior_id": f"eq.{senior_id}", "helper_id": f"eq.{helper_id}", "status": "eq.active"},
    )
    if rel is None:
        raise HTTPException(status_code=403, detail="해당 시니어의 활성 조력자가 아닙니다.")


@router.post("/lock", response_model=ApiResponse[FdsLockResult], summary="긴급 잠금 실행")
async def lock(body: FdsLockRequest, current: Principal = Depends(get_current_principal)):
    target = body.senior_id or current.id
    detail = {"reason": body.reason or "긴급 잠금", "locked_by": str(current.id)}
    record = {"pattern_type": "device", "detail": detail, "is_locked": True}

    if str(target) == str(current.id):
        # 본인 잠금 — RLS 적용(user 스코프)
        rows = await supabase.insert("fds_logs", json={"user_id": str(current.id), **record}, token=current.token)
    else:
        # 조력자가 시니어를 잠금 — 관계 확인 후 service_role 로 기록(RLS 우회)
        await _assert_active_helper(target, current.id)
        rows = await supabase.insert("fds_logs", json={"user_id": str(target), **record}, admin=True)

    return ok(FdsLockResult(is_locked=True, log_id=UUID(rows[0]["id"])))


@router.post("/unlock", response_model=ApiResponse[FdsLockResult], summary="OTP 인증 후 해제")
async def unlock(body: FdsUnlockRequest, current: Principal = Depends(get_current_principal)):
    # 데모: 6자리 숫자면 통과. (실서비스는 Supabase Auth OTP/MFA 연동)
    if not (body.otp.isdigit() and len(body.otp) == 6):
        raise HTTPException(status_code=400, detail="OTP는 6자리 숫자여야 합니다.")
    await supabase.update(
        "fds_logs",
        params={"user_id": f"eq.{current.id}", "is_locked": "is.true"},
        json={"is_locked": False},
        token=current.token,
    )
    return ok(FdsLockResult(is_locked=False, log_id=None))


@router.get("/logs", response_model=ApiResponse[list[FdsLog]], summary="이상 감지 로그 조회")
async def logs(current: Principal = Depends(get_current_principal)):
    rows = await supabase.select("fds_logs", token=current.token, params={"order": "detected_at.desc"})
    return ok([FdsLog(**r) for r in rows])
