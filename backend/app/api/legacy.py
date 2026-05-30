"""디지털 유산 API (명세서 §3.2 디지털 유산).

응답에는 encrypted_data(민감정보)를 포함하지 않는다. 저장 시 평문(content)을
AES(Fernet)로 암호화해 encrypted_data 컬럼에만 보관한다.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from ..core import supabase
from ..core.responses import ok
from ..core.security import encrypt
from ..deps import Principal, get_current_principal
from ..schemas import ApiResponse, DeletedResult, LegacyCreate, LegacyNote

router = APIRouter(prefix="/legacy", tags=["legacy"])

# 목록/단건 응답에 노출할 컬럼(encrypted_data 제외)
_SELECT_COLS = "id,user_id,category,title,trigger_type,trigger_date,created_at"


@router.get("", response_model=ApiResponse[list[LegacyNote]], summary="유산 노트 목록")
async def list_notes(current: Principal = Depends(get_current_principal)):
    rows = await supabase.select(
        "digital_legacy", token=current.token,
        params={"user_id": f"eq.{current.id}", "select": _SELECT_COLS, "order": "created_at.desc"},
    )
    return ok([LegacyNote(**r) for r in rows])


@router.post("", response_model=ApiResponse[LegacyNote], summary="유산 항목 추가 (암호화 저장)", status_code=201)
async def create_note(body: LegacyCreate, current: Principal = Depends(get_current_principal)):
    payload = {
        "user_id": str(current.id),
        "category": body.category.value,
        "title": body.title,
        "encrypted_data": encrypt(body.content),
        "trigger_type": body.trigger_type.value,
        "trigger_date": body.trigger_date.isoformat() if body.trigger_date else None,
    }
    rows = await supabase.insert("digital_legacy", json=payload, token=current.token)
    return ok(LegacyNote(**rows[0]))


@router.delete("/{note_id}", response_model=ApiResponse[DeletedResult], summary="항목 삭제")
async def delete_note(note_id: UUID, current: Principal = Depends(get_current_principal)):
    await supabase.delete("digital_legacy", params={"id": f"eq.{note_id}"}, token=current.token)
    return ok(DeletedResult(id=note_id))
