# 이음(E-UM) — Backend (FastAPI)

개발 순서 **4단계: 백엔드 실제 구현(AI 연동 포함)** 산출물입니다.
(참조: `이음_기술명세서.md` §3 API 명세)

2단계에서 확정한 API 계약(스키마·응답 래퍼)을 유지한 채, 모든 `# TODO(4단계)` 자리표시자를
실제 구현으로 교체했습니다.

- **DB**: Supabase PostgREST 를 `httpx` 로 직접 호출. 사용자 access token 을 그대로 전달해
  **DB RLS 가 적용**됩니다(조력자의 수정·삭제 차단을 RLS 가 구조적으로 보장).
- **인증**: Supabase JWT(HS256)를 `SUPABASE_JWT_SECRET` 으로 로컬 검증 → `public.users` 프로필 조회.
- **AI**: Gemini REST 로 음성 텍스트 파싱(`/assets/voice`) · 이미지 OCR(`/assets/ocr`, Vision).
- **암호화**: 디지털 유산은 `cryptography` Fernet(AES)로 암호화해 저장, 응답에는 미노출.

> supabase-py / google-generativeai SDK 없이 `httpx` 로만 호출합니다(의존성 최소화).

## 구조

```
backend/
├── app/
│   ├── main.py            # FastAPI 앱 · CORS · 예외 핸들러 · lifespan · 라우터 등록
│   ├── deps.py            # 인증 의존성 (JWT 검증 → users 조회, Principal 주입)
│   ├── schemas.py         # 모든 Pydantic 요청/응답 스키마 = API 계약
│   ├── core/
│   │   ├── config.py      # 환경설정 (pydantic-settings)
│   │   ├── responses.py   # {success,data,error} 래퍼 + 예외 핸들러
│   │   ├── errors.py      # AppError(ConfigError/SupabaseError/GeminiError)
│   │   ├── http_client.py # 공유 httpx AsyncClient
│   │   ├── security.py    # JWT 검증 + AES(Fernet) 암복호화
│   │   ├── supabase.py    # PostgREST(REST) 호출 레이어 (user/admin 스코프)
│   │   └── gemini.py      # Gemini REST (텍스트 파싱 + Vision OCR)
│   └── api/               # auth / assets / helpers / fds / legacy 라우터
├── requirements.txt
├── .env.example
├── smoke_test.py          # 오프라인 검증(자격증명 불필요)
├── integration_test.py    # 라이브 검증(.env + 실제 토큰 필요)
└── README.md
```

## 환경변수 (.env)

`.env.example` 를 `.env` 로 복사 후 채웁니다. Supabase 대시보드 **Project Settings → API**
에서 anon/service_role 키와 JWT Secret 을, [Google AI Studio](https://aistudio.google.com/app/apikey)
에서 Gemini 키를 발급합니다.

| 변수 | 설명 |
|------|------|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | PostgREST `apikey` (사용자 스코프) |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회(이메일 조회/시스템 기록) |
| `SUPABASE_JWT_SECRET` | JWT(HS256) 검증 |
| `GEMINI_API_KEY` | Gemini 파싱 |
| `LEGACY_ENCRYPTION_KEY` | 디지털 유산 AES 키(Fernet) |

> 키가 없으면 인증/DB/AI 엔드포인트는 `503 NOT_CONFIGURED` 로 명확히 실패하고,
> `/health`·`/docs`·OpenAPI 는 정상 동작합니다.

## 실행

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- 헬스 체크: http://localhost:8000/health (`supabase_configured` 로 .env 적용 여부 확인)

## 테스트

```powershell
$env:PYTHONIOENCODING="utf-8"

# 오프라인 — 부팅/라우팅/응답래퍼/암호화/JWT 검증 (자격증명 불필요)
python smoke_test.py

# 라이브 — 실제 Supabase/Gemini 연동 (.env + TEST_ACCESS_TOKEN 필요)
$env:TEST_ACCESS_TOKEN="<로그인한 사용자의 supabase access_token>"
python integration_test.py
```

## 다음 단계

→ **5단계**: 프론트 ↔ 백엔드 실제 API 연동
→ **6단계**: 모바일 기기 테스트 (iOS STT 확인 필수)
