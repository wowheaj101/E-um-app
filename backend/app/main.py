"""이음(E-UM) FastAPI 진입점.

공통 응답 래퍼: { "success": bool, "data": <T>|null, "error": {code,message}|null }
인증: Authorization: Bearer <supabase_jwt>
2단계(API 스펙): 엔드포인트·스키마 확정 + mock 응답. 실제 구현은 4단계.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import __version__
from .api import api_router
from .core.config import settings
from .core.responses import (
    http_exception_handler,
    ok,
    validation_exception_handler,
)

app = FastAPI(
    title=settings.app_name,
    version=__version__,
    description=(
        "시니어-가족 연결 AI 자산관리 플랫폼 — MVP API.\n\n"
        "모든 응답은 `{success, data, error}` 래퍼를 따른다. "
        "인증은 `Authorization: Bearer <supabase_jwt>`."
    ),
)

# CORS — Bearer 헤더 인증이라 쿠키 미사용 → allow_credentials=False
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모든 오류를 공통 래퍼로 직렬화
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# 도메인 라우터 (/api/v1/...)
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health", tags=["meta"], summary="헬스 체크")
async def health():
    return ok({"status": "ok", "version": __version__})
