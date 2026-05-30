"""Gemini 파싱 — 음성 텍스트 → 자산 후보, 이미지 → OCR 추출 (REST, SDK 불필요).

generativelanguage REST(v1beta) 의 generateContent 를 httpx 로 호출하고
responseMimeType=application/json + responseSchema 로 구조화 JSON 을 강제한다.
"""
from __future__ import annotations

import base64
import json as jsonlib
from typing import Any

from .config import settings
from .errors import ConfigError, GeminiError
from .http_client import get_client

_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

_ASSET_TYPES = {"bank", "insurance", "realestate", "crypto"}

_CANDIDATES_SCHEMA = {
    "type": "object",
    "properties": {
        "candidates": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "asset_type": {"type": "string", "enum": sorted(_ASSET_TYPES)},
                    "institution": {"type": "string", "nullable": True},
                    "asset_name": {"type": "string"},
                    "amount": {"type": "integer", "nullable": True},
                    "confidence": {"type": "number"},
                },
                "required": ["asset_type", "asset_name", "confidence"],
            },
        }
    },
    "required": ["candidates"],
}

_OCR_SCHEMA = {
    "type": "object",
    "properties": {
        "extracted": {
            "type": "object",
            "properties": {
                "institution": {"type": "string", "nullable": True},
                "asset_name": {"type": "string", "nullable": True},
                "amount": {"type": "integer", "nullable": True},
            },
        },
        "raw_text": {"type": "string"},
    },
    "required": ["extracted", "raw_text"],
}

_VOICE_PROMPT = (
    "너는 한국 시니어의 자산 메모를 정리하는 도우미다. 아래 발화에서 금융 자산 후보를 추출해라.\n"
    "- asset_type: bank(예적금/통장), insurance(보험), realestate(부동산), crypto(가상자산) 중 하나\n"
    "- institution: 금융사/기관명(예: 농협은행). 불명확하면 null\n"
    "- asset_name: 상품/자산명(예: 정기예금, 예금). 불명확하면 일반명\n"
    "- amount: 금액(원, 정수). 발화에 없으면 null. '오백만원'=5000000 처럼 한국어 숫자도 환산\n"
    "- confidence: 0~1 추출 확신도\n"
    "발화: "
)

_OCR_PROMPT = (
    "이 이미지는 한국 금융 서류/통장/증권 사진이다. 텍스트를 읽고(OCR) 자산 정보를 추출해라.\n"
    "- extracted.institution: 금융사/기관명(없으면 null)\n"
    "- extracted.asset_name: 상품/자산명(없으면 null)\n"
    "- extracted.amount: 금액(원, 정수, 없으면 null)\n"
    "- raw_text: 이미지에서 읽은 전체 텍스트\n"
)


def _require_key() -> str:
    if not settings.gemini_api_key:
        raise ConfigError("GEMINI_API_KEY 미설정 (.env)")
    return settings.gemini_api_key


async def _generate(parts: list[dict], schema: dict) -> dict[str, Any]:
    key = _require_key()
    url = f"{_API_BASE}/{settings.gemini_model}:generateContent"
    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "temperature": 0,
        },
    }
    try:
        r = await get_client().post(url, params={"key": key}, json=body)
    except Exception as e:  # 네트워크 오류
        raise GeminiError(f"Gemini 호출 실패: {e}") from e
    if not r.is_success:
        raise GeminiError(f"Gemini 오류({r.status_code}): {r.text[:300]}")
    try:
        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        return jsonlib.loads(text)
    except (KeyError, IndexError, ValueError) as e:
        raise GeminiError(f"Gemini 응답 파싱 실패: {e}") from e


def _to_int(v: Any) -> int | None:
    if v is None:
        return None
    try:
        return int(v)
    except (ValueError, TypeError):
        return None


def _norm_candidate(c: dict) -> dict:
    at = c.get("asset_type")
    return {
        "asset_type": at if at in _ASSET_TYPES else "bank",
        "institution": c.get("institution") or None,
        "asset_name": c.get("asset_name") or "자산",
        "amount": _to_int(c.get("amount")),
        "confidence": max(0.0, min(1.0, float(c.get("confidence", 0.5) or 0.5))),
    }


async def parse_assets(text: str) -> list[dict]:
    """음성 인식 텍스트 → 자산 후보 리스트(정규화된 dict)."""
    data = await _generate([{"text": _VOICE_PROMPT + text}], _CANDIDATES_SCHEMA)
    return [_norm_candidate(c) for c in data.get("candidates", []) if isinstance(c, dict)]


async def ocr_assets(image_bytes: bytes, mime_type: str) -> dict:
    """이미지(바이트) → {extracted:{institution,asset_name,amount}, raw_text} (Vision)."""
    b64 = base64.b64encode(image_bytes).decode()
    parts = [
        {"text": _OCR_PROMPT},
        {"inline_data": {"mime_type": mime_type or "image/jpeg", "data": b64}},
    ]
    data = await _generate(parts, _OCR_SCHEMA)
    ex = data.get("extracted") or {}
    return {
        "extracted": {
            "institution": ex.get("institution") or None,
            "asset_name": ex.get("asset_name") or None,
            "amount": _to_int(ex.get("amount")),
        },
        "raw_text": data.get("raw_text") or "",
    }
