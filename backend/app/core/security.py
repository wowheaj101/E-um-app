"""보안 — Supabase JWT 검증 + 디지털 유산 AES 암복호화.

- JWT: Supabase access token(HS256, SUPABASE_JWT_SECRET 서명)을 로컬 검증.
- 암호화: cryptography Fernet(AES-128-CBC + HMAC). LEGACY_ENCRYPTION_KEY 로부터
  유효한 Fernet 키를 유도해 사용(임의 문자열도 허용).
"""
from __future__ import annotations

import base64
import hashlib

import jwt
from cryptography.fernet import Fernet, InvalidToken

from .config import settings
from .errors import ConfigError


# =============================================================
# JWT 검증
# =============================================================
class AuthError(Exception):
    """JWT 검증 실패(유효하지 않은/만료된 토큰) — 401 로 변환."""


def verify_supabase_jwt(token: str) -> dict:
    """Supabase access token 을 검증하고 클레임(dict)을 반환한다.

    토큰이 유효하지 않으면 AuthError(→401), 서버에 JWT 시크릿이 없으면
    ConfigError(→503) 를 던진다.
    """
    if not settings.supabase_jwt_secret:
        raise ConfigError("SUPABASE_JWT_SECRET 미설정 (.env) — 서버 인증 구성 필요")
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience=settings.supabase_jwt_aud,
            options={"verify_aud": True},
        )
    except jwt.PyJWTError as e:  # 만료/서명오류/aud불일치 등
        raise AuthError(f"유효하지 않은 토큰: {e}") from e


# =============================================================
# AES 암복호화 (디지털 유산)
# =============================================================
def _fernet() -> Fernet:
    key = settings.legacy_encryption_key
    if not key:
        raise RuntimeError("LEGACY_ENCRYPTION_KEY 미설정 — 디지털 유산 암호화 불가")
    # 이미 유효한 Fernet 키(44자 urlsafe b64)면 그대로, 아니면 SHA-256 으로 유도.
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except (ValueError, TypeError):
        derived = base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest())
        return Fernet(derived)


def encrypt(plaintext: str) -> str:
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt(token: str) -> str:
    try:
        return _fernet().decrypt(token.encode()).decode()
    except InvalidToken as e:
        raise RuntimeError("복호화 실패 — 키 불일치 또는 손상된 데이터") from e
