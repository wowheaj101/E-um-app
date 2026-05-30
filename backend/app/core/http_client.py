"""공유 httpx AsyncClient — Supabase REST/Gemini 호출에서 커넥션 재사용.

같은 이벤트 루프 안에서는 커넥션을 재사용하되, 루프가 바뀌면(테스트의 TestClient 처럼
요청마다 새 루프를 도는 경우, 또는 재시작) 클라이언트를 재생성한다 —
죽은 루프에 묶인 클라이언트를 재사용해 'Event loop is closed' 가 나는 것을 방지.
main.py 의 lifespan 이 종료 시 aclose() 를 호출한다.
"""
from __future__ import annotations

import asyncio

import httpx

_client: httpx.AsyncClient | None = None
_loop: asyncio.AbstractEventLoop | None = None


def get_client() -> httpx.AsyncClient:
    """현재 실행 중인 이벤트 루프에 묶인 AsyncClient 를 반환(필요 시 생성)."""
    global _client, _loop
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    if _client is None or _client.is_closed or _loop is not loop:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0))
        _loop = loop
    return _client


async def aclose() -> None:
    """앱 종료 시 커넥션 정리(main.py lifespan 에서 호출)."""
    global _client, _loop
    if _client is not None and not _client.is_closed:
        await _client.aclose()
    _client = None
    _loop = None
