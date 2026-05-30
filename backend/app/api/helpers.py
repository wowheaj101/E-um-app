"""가족 / 조력자 API (명세서 §3.2 가족/조력자)."""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from ..core import supabase
from ..core.responses import ok
from ..deps import Principal, get_current_principal
from ..schemas import (
    ApiResponse,
    Asset,
    Helper,
    HelperAcceptRequest,
    HelperDashboard,
    HelperInviteRequest,
    User,
)

router = APIRouter(prefix="/helpers", tags=["helpers"])


@router.post("/invite", response_model=ApiResponse[Helper], summary="조력자 초대 (이메일)", status_code=201)
async def invite_helper(body: HelperInviteRequest, current: Principal = Depends(get_current_principal)):
    target = await supabase.find_user_by_email(body.email)
    if target is None:
        raise HTTPException(status_code=404, detail="해당 이메일의 사용자를 찾을 수 없습니다. (먼저 가입 필요)")
    if str(target["id"]) == str(current.id):
        raise HTTPException(status_code=400, detail="자기 자신은 초대할 수 없습니다.")
    payload = {"senior_id": str(current.id), "helper_id": target["id"], "status": "pending"}
    rows = await supabase.insert("helpers", json=payload, token=current.token)
    return ok(Helper(**rows[0]))


@router.post("/accept", response_model=ApiResponse[Helper], summary="초대 수락")
async def accept_invite(body: HelperAcceptRequest, current: Principal = Depends(get_current_principal)):
    rows = await supabase.update(
        "helpers",
        # 초대받은 조력자 본인만 수락 가능
        params={"id": f"eq.{body.invitation_id}", "helper_id": f"eq.{current.id}"},
        json={"status": "active", "accepted_at": datetime.now(timezone.utc).isoformat()},
        token=current.token,
    )
    if not rows:
        raise HTTPException(status_code=404, detail="수락할 초대를 찾을 수 없습니다.")
    return ok(Helper(**rows[0]))


@router.get("", response_model=ApiResponse[list[Helper]], summary="연결된 조력자 목록")
async def list_helpers(current: Principal = Depends(get_current_principal)):
    # RLS: senior_id 또는 helper_id 가 본인인 행만 반환
    rows = await supabase.select("helpers", token=current.token, params={"order": "invited_at.desc"})
    return ok([Helper(**r) for r in rows])


@router.get(
    "/dashboard/{senior_id}",
    response_model=ApiResponse[HelperDashboard],
    summary="조력자용 자산 대시보드 (read-only)",
)
async def helper_dashboard(senior_id: UUID, current: Principal = Depends(get_current_principal)):
    # RLS: 연결된 활성 조력자만 시니어 프로필/자산 SELECT 가능
    srow = await supabase.select_one("users", token=current.token, params={"id": f"eq.{senior_id}"})
    if srow is None:
        raise HTTPException(status_code=404, detail="시니어 정보를 찾을 수 없습니다. (연결/권한 확인)")
    arows = await supabase.select(
        "assets", token=current.token,
        params={"user_id": f"eq.{senior_id}", "order": "created_at.desc"},
    )
    assets = [Asset(**r) for r in arows]
    total = sum(a.amount for a in assets if a.amount is not None)
    return ok(
        HelperDashboard(
            senior=User(**srow),
            assets=assets,
            asset_count=len(assets),
            total_amount=total,
        )
    )
