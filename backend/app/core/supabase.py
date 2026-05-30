"""Supabase 접근 계층 — PostgREST(REST) 를 httpx 로 직접 호출.

두 가지 스코프:
- **user** : 사용자 access token 을 Authorization 으로 전달 → DB RLS 가 그대로 적용
              (조력자의 수정/삭제 차단 등 보안은 RLS 가 구조적으로 보장).
- **admin**: service_role 키 사용 → RLS 우회. 이메일로 사용자 조회, 시스템 기록 등
              꼭 필요한 경우에만.

PostgREST 필터 문법(params)을 그대로 사용한다. 예: {"id": "eq.<uuid>", "select": "*"}.
"""
from __future__ import annotations

from typing import Any

import httpx

from .config import settings
from .errors import ConfigError, SupabaseError
from .http_client import get_client


def _require_config(admin: bool) -> None:
    if not settings.supabase_configured:
        raise ConfigError("Supabase 미설정 (.env 의 SUPABASE_URL / SUPABASE_ANON_KEY)")
    if admin and not settings.supabase_service_role_key:
        raise ConfigError("관리자 작업에 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.")


def _headers(token: str | None, admin: bool, *, write: bool = False, prefer: str | None = None) -> dict[str, str]:
    if admin:
        key = settings.supabase_service_role_key
        bearer = key
    else:
        key = settings.supabase_anon_key
        bearer = token or settings.supabase_anon_key  # 토큰 없으면 anon (RLS 가 차단)
    h = {"apikey": key, "Authorization": f"Bearer {bearer}"}
    if write:
        h["Content-Type"] = "application/json"
    if prefer:
        h["Prefer"] = prefer
    return h


def _raise_for_status(r: httpx.Response) -> None:
    if r.is_success:
        return
    message = r.text
    try:
        body = r.json()
        message = body.get("message") or body.get("hint") or body.get("details") or message
    except Exception:
        pass
    raise SupabaseError(f"Supabase 오류: {message}", status_code=r.status_code if r.status_code < 500 else 502)


async def select(table: str, *, token: str | None = None, params: dict | None = None, admin: bool = False) -> list[dict[str, Any]]:
    _require_config(admin)
    r = await get_client().get(
        f"{settings.supabase_rest_url}/{table}",
        headers=_headers(token, admin),
        params={"select": "*", **(params or {})},
    )
    _raise_for_status(r)
    return r.json()


async def insert(
    table: str, *, json: dict | list, token: str | None = None, admin: bool = False, returning: bool = True
) -> list[dict[str, Any]]:
    _require_config(admin)
    prefer = "return=representation" if returning else "return=minimal"
    r = await get_client().post(
        f"{settings.supabase_rest_url}/{table}",
        headers=_headers(token, admin, write=True, prefer=prefer),
        json=json,
    )
    _raise_for_status(r)
    return r.json() if returning else []


async def update(
    table: str, *, params: dict, json: dict, token: str | None = None, admin: bool = False
) -> list[dict[str, Any]]:
    _require_config(admin)
    r = await get_client().patch(
        f"{settings.supabase_rest_url}/{table}",
        headers=_headers(token, admin, write=True, prefer="return=representation"),
        params=params,
        json=json,
    )
    _raise_for_status(r)
    return r.json()


async def delete(table: str, *, params: dict, token: str | None = None, admin: bool = False) -> list[dict[str, Any]]:
    _require_config(admin)
    r = await get_client().request(
        "DELETE",
        f"{settings.supabase_rest_url}/{table}",
        headers=_headers(token, admin, prefer="return=representation"),
        params=params,
    )
    _raise_for_status(r)
    return r.json()


# --- 편의 함수 ---
async def select_one(table: str, **kwargs) -> dict[str, Any] | None:
    rows = await select(table, **kwargs)
    return rows[0] if rows else None


async def find_user_by_email(email: str) -> dict[str, Any] | None:
    """이메일로 public.users 조회 (admin — RLS 우회). 조력자 초대용."""
    return await select_one(
        "users", admin=True, params={"email": f"eq.{email}", "select": "id,email,name,role,created_at"}
    )
