"""보안 — Supabase JWT 검증 + 디지털 유산 AES 암복호화.

- JWT: Supabase access token 을 로컬 검증. 서명 방식 두 가지를 지원한다.
  - **ES256/RS256(비대칭)**: 신형 Supabase 기본. JWKS 공개키로 검증(시크릿 불필요).
  - **HS256(대칭)**: legacy 또는 자체 발급 토큰. SUPABASE_JWT_SECRET 로 검증.
  토큰 헤더의 alg 를 보고 분기한다.
- 암호화: cryptography Fernet(AES-128-CBC + HMAC). LEGACY_ENCRYPTION_KEY 로부터
  유효한 Fernet 키를 유도해 사용(임의 문자열도 허용).
"""
from __future__ import annotations

import base64
import hashlib

import jwt
from cryptography.fernet import Fernet, InvalidToken
from jwt import PyJWKClient

from .config import settings
from .errors import ConfigError


# =============================================================
# JWT 검증
# =============================================================
class AuthError(Exception):
    """JWT 검증 실패(유효하지 않은/만료된 토큰) — 401 로 변환."""


# JWKS 공개키 클라이언트(키를 캐시해 매 요청 네트워크 호출을 피한다).
_jwks_client: PyJWKClient | None = None


def _jwks() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        url = settings.supabase_jwks_url
        if not url:
            raise ConfigError("SUPABASE_URL 미설정 (.env) — JWKS 검증 불가")
        _jwks_client = PyJWKClient(url, cache_keys=True, lifespan=3600)
    return _jwks_client


def verify_supabase_jwt(token: str) -> dict:
    """Supabase access token 을 검증하고 클레임(dict)을 반환한다.

    토큰이 유효하지 않으면 AuthError(→401), 서버 설정이 없으면 ConfigError(→503).
    """
    try:
        alg = jwt.get_unverified_header(token).get("alg", "")
    except jwt.PyJWTError as e:
        raise AuthError(f"유효하지 않은 토큰: {e}") from e

    try:
        if alg == "HS256":
            if not settings.supabase_jwt_secret:
                raise ConfigError("SUPABASE_JWT_SECRET 미설정 (.env) — 서버 인증 구성 필요")
            key = settings.supabase_jwt_secret
        elif alg in ("ES256", "RS256"):
            key = _jwks().get_signing_key_from_jwt(token).key
        else:
            raise AuthError(f"허용되지 않은 토큰 알고리즘: {alg or 'none'}")
        return jwt.decode(
            token,
            key,
            algorithms=[alg],
            audience=settings.supabase_jwt_aud,
            options={"verify_aud": True},
        )
    except jwt.PyJWTError as e:  # 만료/서명오류/aud불일치/JWKS 키 없음 등
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
