"""인증 API (명세서 §3.2 인증)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..core.responses import ok
from ..core.security import AuthError, verify_supabase_jwt
from ..deps import Principal, _load_user, get_current_principal
from ..schemas import ApiResponse, LoginRequest, User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=ApiResponse[User], summary="소셜 로그인 콜백 처리")
async def login(body: LoginRequest):
    """Supabase 소셜 로그인으로 발급된 access_token 을 검증하고 사용자 프로필을 반환.

    (회원가입 시 handle_new_user 트리거가 public.users 행을 자동 생성한다.)
    """
    try:
        claims = verify_supabase_jwt(body.access_token)
    except AuthError as e:
        raise HTTPException(status_code=401, detail=str(e))
    user = await _load_user(body.access_token, claims)
    return ok(user)


@router.get("/me", response_model=ApiResponse[User], summary="현재 사용자 정보")
async def me(current: Principal = Depends(get_current_principal)):
    return ok(current.user)
