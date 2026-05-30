"""의존성 — 인증 (Authorization: Bearer <supabase_jwt>).

Supabase access token(JWT)을 로컬 검증한 뒤 public.users 프로필을 조회한다.
라우터는 Principal 을 주입받아 신원(current.id/role)과 함께 RLS 적용을 위한
사용자 토큰(current.token)을 DB 호출에 사용한다.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from fastapi import Header, HTTPException

from .core import supabase
from .core.security import AuthError, verify_supabase_jwt
from .schemas import Role, User


@dataclass
class Principal:
    """인증된 요청 주체 — 사용자 프로필 + RLS 호출용 access token."""
    user: User
    token: str

    @property
    def id(self):
        return self.user.id

    @property
    def role(self) -> Role:
        return self.user.role

    @property
    def email(self) -> str:
        return self.user.email

    @property
    def name(self) -> str:
        return self.user.name


async def _load_user(token: str, claims: dict) -> User:
    """public.users 에서 프로필을 조회. 트리거 지연 등으로 없으면 클레임으로 구성."""
    uid = claims.get("sub")
    row = await supabase.select_one(
        "users", token=token, params={"id": f"eq.{uid}", "select": "id,email,name,role,created_at"}
    )
    if row:
        return User(**row)
    meta = claims.get("user_metadata") or {}
    email = claims.get("email") or meta.get("email") or "unknown@example.com"
    return User(
        id=uid,
        email=email,
        name=meta.get("name") or email.split("@")[0] or "사용자",
        role=meta.get("role") or Role.senior,
        created_at=datetime.now(timezone.utc),
    )


async def get_current_principal(authorization: str | None = Header(default=None)) -> Principal:
    """Bearer 토큰을 검증해 현재 사용자(Principal)를 반환한다."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰(Bearer)이 필요합니다.")
    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = verify_supabase_jwt(token)
    except AuthError as e:
        raise HTTPException(status_code=401, detail=str(e))
    user = await _load_user(token, claims)
    return Principal(user=user, token=token)
