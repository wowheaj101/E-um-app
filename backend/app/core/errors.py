"""애플리케이션 예외 — 공통 응답 래퍼({success,data,error})로 직렬화된다.

main.py 에 등록된 app_error_handler 가 status_code/code/message 를 그대로 변환한다.
라우터에서 일일이 try/except 하지 않고 그대로 전파한다.
"""
from __future__ import annotations


class AppError(Exception):
    status_code: int = 500
    code: str = "INTERNAL_ERROR"

    def __init__(self, message: str, *, status_code: int | None = None, code: str | None = None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code


class ConfigError(AppError):
    """서버 구성(.env) 누락."""
    status_code = 503
    code = "NOT_CONFIGURED"


class SupabaseError(AppError):
    """Supabase(PostgREST) 호출 실패. 상태코드는 응답에 맞춰 설정."""
    status_code = 502
    code = "DB_ERROR"


class GeminiError(AppError):
    """Gemini 파싱 실패."""
    status_code = 502
    code = "AI_ERROR"
