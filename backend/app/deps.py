"""의존성 — 인증 (Authorization: Bearer <supabase_jwt>)."""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import Header, HTTPException

from .schemas import Role, User

# 시연/스펙용 mock 사용자. 4단계에서 Supabase JWT 검증 + users 조회로 대체.
MOCK_SENIOR = User(
    id=UUID("00000000-0000-0000-0000-000000000001"),
    email="senior@example.com",
    name="김순자",
    role=Role.senior,
    created_at=datetime(2026, 5, 30, tzinfo=timezone.utc),
)


async def get_current_user(authorization: str | None = Header(default=None)) -> User:
    """Bearer 토큰을 검증해 현재 사용자를 반환한다.

    2단계(스펙)에서는 토큰 '존재'만 확인하고 mock 사용자를 반환한다.
    TODO(4단계): Supabase JWT 서명 검증 → public.users 조회로 교체.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰(Bearer)이 필요합니다.")
    return MOCK_SENIOR
