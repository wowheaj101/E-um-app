"""공통 응답 헬퍼 + 예외 핸들러 (모든 응답을 {success,data,error} 래퍼로 통일)."""
from __future__ import annotations

from fastapi import Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from ..schemas import ApiResponse
from .errors import AppError

_STATUS_CODE = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    500: "INTERNAL_ERROR",
}


def ok(data=None) -> ApiResponse:
    """성공 응답 래퍼."""
    return ApiResponse(success=True, data=data, error=None)


def _error_body(code: str, message: str) -> dict:
    return {"success": False, "data": None, "error": {"code": code, "message": message}}


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """AppError(ConfigError/SupabaseError/GeminiError)를 공통 래퍼로 직렬화."""
    return JSONResponse(status_code=exc.status_code, content=_error_body(exc.code, exc.message))


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = _STATUS_CODE.get(exc.status_code, "ERROR")
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(code, str(exc.detail)),
        headers=getattr(exc, "headers", None),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    # 디버깅 편의를 위해 첫 오류 위치만 간단히 노출
    errors = exc.errors()
    detail = "요청 형식이 올바르지 않습니다."
    if errors:
        loc = ".".join(str(p) for p in errors[0].get("loc", []))
        detail = f"요청 형식이 올바르지 않습니다: {loc} — {errors[0].get('msg', '')}"
    body = _error_body("VALIDATION_ERROR", detail)
    body["error"]["fields"] = jsonable_encoder(errors)
    return JSONResponse(status_code=422, content=body)
