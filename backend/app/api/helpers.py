"""가족 / 조력자 API (명세서 §3.2 가족/조력자)."""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends

from ..core.responses import ok
from ..deps import get_current_user
from ..schemas import (
    ApiResponse,
    Helper,
    HelperAcceptRequest,
    HelperDashboard,
    HelperInviteRequest,
    HelperStatus,
    Role,
    User,
)
from .assets import _MOCK_ASSETS, _SENIOR_ID

router = APIRouter(prefix="/helpers", tags=["helpers"])

_HELPER_ID = UUID("00000000-0000-0000-0000-0000000000a1")
_MOCK_HELPER = Helper(
    id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    senior_id=_SENIOR_ID,
    helper_id=_HELPER_ID,
    permission_level="read_only",
    invited_at=datetime(2026, 5, 30, tzinfo=timezone.utc),
    accepted_at=None,
    status=HelperStatus.pending,
)


@router.post("/invite", response_model=ApiResponse[Helper], summary="조력자 초대 (이메일)", status_code=201)
async def invite_helper(body: HelperInviteRequest, current=Depends(get_current_user)):
    # TODO(4단계): email 로 조력자 조회/초대 메일 발송 → helpers(status=pending) 생성
    helper = _MOCK_HELPER.model_copy(update={"id": uuid4(), "senior_id": current.id})
    return ok(helper)


@router.post("/accept", response_model=ApiResponse[Helper], summary="초대 수락")
async def accept_invite(body: HelperAcceptRequest, current=Depends(get_current_user)):
    # TODO(4단계): invitation_id 조회 → status=active, accepted_at=now (helper 본인만)
    helper = _MOCK_HELPER.model_copy(
        update={
            "id": body.invitation_id,
            "helper_id": current.id,
            "status": HelperStatus.active,
            "accepted_at": datetime.now(timezone.utc),
        }
    )
    return ok(helper)


@router.get("", response_model=ApiResponse[list[Helper]], summary="연결된 조력자 목록")
async def list_helpers(current=Depends(get_current_user)):
    return ok([_MOCK_HELPER])


@router.get(
    "/dashboard/{senior_id}",
    response_model=ApiResponse[HelperDashboard],
    summary="조력자용 자산 대시보드 (read-only)",
)
async def helper_dashboard(senior_id: UUID, current=Depends(get_current_user)):
    # TODO(4단계): RLS로 연결된 조력자만 senior 자산 SELECT
    senior = User(
        id=senior_id,
        email="senior@example.com",
        name="김순자",
        role=Role.senior,
        created_at=datetime(2026, 5, 30, tzinfo=timezone.utc),
    )
    total = sum(a.amount for a in _MOCK_ASSETS if a.amount is not None)
    dashboard = HelperDashboard(
        senior=senior,
        assets=_MOCK_ASSETS,
        asset_count=len(_MOCK_ASSETS),
        total_amount=total,
    )
    return ok(dashboard)
