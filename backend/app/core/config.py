"""애플리케이션 설정 (환경변수 기반)."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "이음(E-UM) API"
    api_v1_prefix: str = "/api/v1"

    # CORS — 기본 전체 허용(MVP). 배포 시 프론트 도메인으로 좁힐 것.
    cors_origins: list[str] = ["*"]

    # --- 4단계(실제 구현) ---
    # Supabase: REST(PostgREST) + Auth(GoTrue) 를 httpx 로 직접 호출한다.
    supabase_url: str | None = None            # 예: https://<ref>.supabase.co
    supabase_anon_key: str | None = None       # PostgREST apikey 헤더(사용자 스코프)
    supabase_service_role_key: str | None = None  # RLS 우회(관리자: 이메일 조회, 시스템 기록)
    supabase_jwt_secret: str | None = None     # HS256 JWT 서명 검증(로컬)
    supabase_jwt_aud: str = "authenticated"    # Supabase access token 의 aud 클레임

    # Gemini (음성/OCR 텍스트 파싱) — REST 호출, SDK 불필요
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"

    # 디지털 유산 AES 암호화 키 (Fernet, urlsafe base64 32바이트 권장)
    legacy_encryption_key: str | None = None

    @property
    def supabase_configured(self) -> bool:
        """사용자 스코프 PostgREST/Auth 호출에 필요한 최소 설정 여부."""
        return bool(self.supabase_url and self.supabase_anon_key)

    @property
    def supabase_rest_url(self) -> str | None:
        return f"{self.supabase_url.rstrip('/')}/rest/v1" if self.supabase_url else None

    @property
    def supabase_auth_url(self) -> str | None:
        return f"{self.supabase_url.rstrip('/')}/auth/v1" if self.supabase_url else None


settings = Settings()
