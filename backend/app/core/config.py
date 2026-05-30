"""애플리케이션 설정 (환경변수 기반)."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "이음(E-UM) API"
    api_v1_prefix: str = "/api/v1"

    # CORS — 기본 전체 허용(MVP). 배포 시 프론트 도메인으로 좁힐 것.
    cors_origins: list[str] = ["*"]

    # --- 4단계(실제 구현)에서 사용 ---
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None
    supabase_jwt_secret: str | None = None
    gemini_api_key: str | None = None
    legacy_encryption_key: str | None = None  # 디지털 유산 AES 키


settings = Settings()
