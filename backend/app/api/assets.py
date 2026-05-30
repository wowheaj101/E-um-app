"""자산 API (명세서 §3.2 자산, §3.3 예시)."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..core import gemini, supabase
from ..core.responses import ok
from ..deps import Principal, get_current_principal
from ..schemas import (
    ApiResponse,
    Asset,
    AssetCreate,
    AssetUpdate,
    DeletedResult,
    OcrResult,
    VoiceParseRequest,
    VoiceParseResult,
)

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=ApiResponse[list[Asset]], summary="자산 목록 조회")
async def list_assets(current: Principal = Depends(get_current_principal)):
    rows = await supabase.select(
        "assets", token=current.token,
        params={"user_id": f"eq.{current.id}", "order": "created_at.desc"},
    )
    return ok([Asset(**r) for r in rows])


@router.post("", response_model=ApiResponse[Asset], summary="자산 직접 추가", status_code=201)
async def create_asset(body: AssetCreate, current: Principal = Depends(get_current_principal)):
    payload = {"user_id": str(current.id), **body.model_dump(mode="json")}
    rows = await supabase.insert("assets", json=payload, token=current.token)
    return ok(Asset(**rows[0]))


@router.post("/voice", response_model=ApiResponse[VoiceParseResult], summary="음성 텍스트 → 자산 파싱")
async def parse_voice(body: VoiceParseRequest, current: Principal = Depends(get_current_principal)):
    candidates = await gemini.parse_assets(body.text)
    return ok(VoiceParseResult(candidates=candidates))


@router.post("/ocr", response_model=ApiResponse[OcrResult], summary="이미지 → OCR 자산 추출 (Gemini Vision)")
async def parse_ocr(file: UploadFile = File(...), current: Principal = Depends(get_current_principal)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="빈 파일입니다.")
    result = await gemini.ocr_assets(data, file.content_type or "image/jpeg")
    return ok(OcrResult(**result))


@router.patch("/{asset_id}", response_model=ApiResponse[Asset], summary="자산 수정")
async def update_asset(asset_id: UUID, body: AssetUpdate, current: Principal = Depends(get_current_principal)):
    payload = body.model_dump(exclude_unset=True, mode="json")
    if not payload:
        raise HTTPException(status_code=400, detail="수정할 내용이 없습니다.")
    rows = await supabase.update(
        "assets", params={"id": f"eq.{asset_id}"}, json=payload, token=current.token
    )
    if not rows:
        raise HTTPException(status_code=404, detail="자산을 찾을 수 없습니다.")
    return ok(Asset(**rows[0]))


@router.delete("/{asset_id}", response_model=ApiResponse[DeletedResult], summary="자산 삭제")
async def delete_asset(asset_id: UUID, current: Principal = Depends(get_current_principal)):
    await supabase.delete("assets", params={"id": f"eq.{asset_id}"}, token=current.token)
    return ok(DeletedResult(id=asset_id))
