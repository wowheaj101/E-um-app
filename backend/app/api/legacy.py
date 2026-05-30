"""디지털 유산 API (명세서 §3.2 디지털 유산)."""
from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends

from ..core.responses import ok
from ..deps import get_current_user
from ..schemas import (
    ApiResponse,
    DeletedResult,
    LegacyCategory,
    LegacyCreate,
    LegacyNote,
    TriggerType,
)

router = APIRouter(prefix="/legacy", tags=["legacy"])

_SENIOR_ID = UUID("00000000-0000-0000-0000-000000000001")
_MOCK_NOTES = [
    LegacyNote(
        id=UUID("dd111111-1111-1111-1111-111111111111"),
        user_id=_SENIOR_ID,
        category=LegacyCategory.sns,
        title="카카오 계정",
        trigger_type=TriggerType.manual,
        trigger_date=None,
        created_at=datetime(2026, 5, 30, tzinfo=timezone.utc),
    ),
    LegacyNote(
        id=UUID("dd222222-2222-2222-2222-222222222222"),
        user_id=_SENIOR_ID,
        category=LegacyCategory.crypto,
        title="업비트 지갑 메모",
        trigger_type=TriggerType.date,
        trigger_date=date(2027, 1, 1),
        created_at=datetime(2026, 5, 30, tzinfo=timezone.utc),
    ),
]


@router.get("", response_model=ApiResponse[list[LegacyNote]], summary="유산 노트 목록")
async def list_notes(current=Depends(get_current_user)):
    # 목록에는 encrypted_data(민감정보)를 포함하지 않는다.
    return ok(_MOCK_NOTES)


@router.post("", response_model=ApiResponse[LegacyNote], summary="유산 항목 추가 (암호화 저장)", status_code=201)
async def create_note(body: LegacyCreate, current=Depends(get_current_user)):
    # TODO(4단계): body.content 를 AES 암호화 → encrypted_data 로 저장
    note = LegacyNote(
        id=uuid4(),
        user_id=current.id,
        category=body.category,
        title=body.title,
        trigger_type=body.trigger_type,
        trigger_date=body.trigger_date,
        created_at=datetime.now(timezone.utc),
    )
    return ok(note)


@router.delete("/{note_id}", response_model=ApiResponse[DeletedResult], summary="항목 삭제")
async def delete_note(note_id: UUID, current=Depends(get_current_user)):
    return ok(DeletedResult(id=note_id))
