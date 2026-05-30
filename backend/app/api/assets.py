"""자산 API (명세서 §3.2 자산, §3.3 예시)."""
from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..core.responses import ok
from ..deps import get_current_user
from ..schemas import (
    ApiResponse,
    Asset,
    AssetCreate,
    AssetSource,
    AssetType,
    AssetUpdate,
    DeletedResult,
    OcrExtracted,
    OcrResult,
    VoiceCandidate,
    VoiceParseRequest,
    VoiceParseResult,
)

router = APIRouter(prefix="/assets", tags=["assets"])

# --- mock 데이터 (4단계에서 Supabase 조회로 교체) ---
_SENIOR_ID = UUID("00000000-0000-0000-0000-000000000001")
_MOCK_ASSETS = [
    Asset(
        id=UUID("11111111-1111-1111-1111-111111111111"),
        user_id=_SENIOR_ID,
        asset_type=AssetType.bank,
        asset_name="정기예금",
        institution="국민은행",
        amount=5_000_000,
        source=AssetSource.ocr,
    ),
    Asset(
        id=UUID("22222222-2222-2222-2222-222222222222"),
        user_id=_SENIOR_ID,
        asset_type=AssetType.bank,
        asset_name="예금",
        institution="농협은행",
        amount=None,
        source=AssetSource.voice,
    ),
]


@router.get("", response_model=ApiResponse[list[Asset]], summary="자산 목록 조회")
async def list_assets(current=Depends(get_current_user)):
    return ok(_MOCK_ASSETS)


@router.post("", response_model=ApiResponse[Asset], summary="자산 직접 추가", status_code=201)
async def create_asset(body: AssetCreate, current=Depends(get_current_user)):
    asset = Asset(id=uuid4(), user_id=current.id, **body.model_dump())
    return ok(asset)


@router.post("/voice", response_model=ApiResponse[VoiceParseResult], summary="음성 텍스트 → 자산 파싱")
async def parse_voice(body: VoiceParseRequest, current=Depends(get_current_user)):
    # TODO(4단계): Gemini 구조화 프롬프트로 body.text 파싱 → JSON 강제 후 candidates 생성
    result = VoiceParseResult(
        candidates=[
            VoiceCandidate(
                asset_type=AssetType.bank,
                institution="농협은행",
                asset_name="예금",
                amount=None,
                confidence=0.82,
            )
        ]
    )
    return ok(result)


@router.post("/ocr", response_model=ApiResponse[OcrResult], summary="이미지 → OCR 자산 추출")
async def parse_ocr(file: UploadFile = File(...), current=Depends(get_current_user)):
    # TODO(4단계): Tesseract.js(클라) 또는 서버 OCR 텍스트 → Gemini 파싱
    result = OcrResult(
        extracted=OcrExtracted(institution="국민은행", asset_name="정기예금", amount=5_000_000),
        raw_text="국민은행 정기예금 ...",
    )
    return ok(result)


@router.patch("/{asset_id}", response_model=ApiResponse[Asset], summary="자산 수정")
async def update_asset(asset_id: UUID, body: AssetUpdate, current=Depends(get_current_user)):
    base = next((a for a in _MOCK_ASSETS if a.id == asset_id), None)
    if base is None:
        raise HTTPException(status_code=404, detail="자산을 찾을 수 없습니다.")
    updated = base.model_copy(update=body.model_dump(exclude_unset=True))
    return ok(updated)


@router.delete("/{asset_id}", response_model=ApiResponse[DeletedResult], summary="자산 삭제")
async def delete_asset(asset_id: UUID, current=Depends(get_current_user)):
    return ok(DeletedResult(id=asset_id))
