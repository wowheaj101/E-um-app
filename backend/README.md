# 이음(E-UM) — Backend (FastAPI)

개발 순서 **2단계: FastAPI API 스펙 정의 (응답 형식 확정)** 산출물입니다.
(참조: `이음_기술명세서.md` §3 API 명세)

이 단계는 **API 계약 확정**이 목적입니다. 엔드포인트·요청/응답 스키마를 모두 선언하고
**mock 데이터**로 응답하므로, 프론트가 이 스펙(Swagger)으로 병렬 mock 개발(3단계)을 시작할 수 있습니다.
실제 DB·AI 연동은 4단계에서 `# TODO(4단계)` 지점을 채웁니다.

## 구조

```
backend/
├── app/
│   ├── main.py            # FastAPI 앱 · CORS · 예외 핸들러 · 라우터 등록
│   ├── deps.py            # 인증 의존성 (Bearer JWT, 현재 mock)
│   ├── schemas.py         # 모든 Pydantic 요청/응답 스키마 = API 계약
│   ├── core/
│   │   ├── config.py      # 환경설정 (pydantic-settings)
│   │   └── responses.py   # {success,data,error} 래퍼 + 예외 핸들러
│   └── api/
│       ├── __init__.py    # /api/v1 라우터 집합
│       ├── auth.py        # /auth/login, /auth/me
│       ├── assets.py      # /assets (+ /voice, /ocr)
│       ├── helpers.py     # /helpers (+ /invite, /accept, /dashboard)
│       ├── fds.py         # /fds/lock, /unlock, /logs
│       └── legacy.py      # /legacy
├── requirements.txt
├── .env.example
└── README.md
```

## 공통 규약 (§3.1)

- Base URL: `/<API_V1_PREFIX>` (기본 `/api/v1`)
- 인증: `Authorization: Bearer <supabase_jwt>`
- 응답 래퍼:
  ```json
  { "success": true, "data": { }, "error": null }
  ```
  오류 시: `{ "success": false, "data": null, "error": { "code": "...", "message": "..." } }`

## 엔드포인트 (§3.2)

| 그룹 | 메서드 · 경로 |
|------|----------------|
| 인증 | `POST /auth/login`, `GET /auth/me` |
| 자산 | `GET·POST /assets`, `POST /assets/voice`, `POST /assets/ocr`, `PATCH·DELETE /assets/{id}` |
| 조력자 | `POST /helpers/invite`, `POST /helpers/accept`, `GET /helpers`, `GET /helpers/dashboard/{senior_id}` |
| FDS | `POST /fds/lock`, `POST /fds/unlock`, `GET /fds/logs` |
| 유산 | `GET·POST /legacy`, `DELETE /legacy/{id}` |
| 메타 | `GET /health` |

## 실행

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json
- 헬스 체크: http://localhost:8000/health

> 인증이 필요한 엔드포인트는 임의의 `Authorization: Bearer <아무값>` 헤더가 있으면 mock 사용자로 동작합니다(2단계 한정). Swagger 우측 상단 **Authorize**에 아무 토큰이나 넣어 테스트하세요.

## 다음 단계

→ **3단계(병렬)**: 디자인 시스템 + 프론트 컴포넌트 mock 개발 (이 OpenAPI 스펙 기준)
→ **4단계**: `# TODO(4단계)` 지점 실제 구현 — Supabase 조회, Gemini 파싱, JWT 검증, AES 암호화.
