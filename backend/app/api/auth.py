"""인증 API (명세서 §3.2 인증)."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from ..core.responses import ok
from ..deps import MOCK_SENIOR, get_current_user
from ..schemas import ApiResponse, LoginRequest, User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=ApiResponse[User], summary="소셜 로그인 콜백 처리")
async def login(body: LoginRequest):
    # TODO(4단계): body.access_token(Supabase JWT) 검증 → public.users upsert 후 사용자 반환
    return ok(MOCK_SENIOR)


@router.get("/me", response_model=ApiResponse[User], summary="현재 사용자 정보")
async def me(current: User = Depends(get_current_user)):
    return ok(current)
