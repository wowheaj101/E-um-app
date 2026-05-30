# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**이음(E-UM)** — 시니어-가족 연결 AI 자산관리 플랫폼 MVP. 모든 설계·범위·진행 순서는
`이음_기술명세서.md`가 단일 기준(SSOT)이며, 작업 전 해당 문서를 먼저 참조한다.

스택: Vue 3 + TS(프론트, Vercel) / FastAPI(백엔드, Render) / Supabase PostgreSQL + Auth /
Gemini·Tesseract.js·Web Speech(무료 AI 구성).

### 개발 순서와 현재 상태 (명세서 §5)

명세서는 **DB 스키마 → API 스펙 확정**이 먼저여야 프론트가 mock으로 병렬 개발 가능하다는
순서를 정의한다. 진행 상태:

1. ✅ Supabase DB 스키마 + RLS (`supabase/`)
2. ✅ FastAPI API 스펙 — 응답 형식 확정 (`backend/`)
3. ⬜ 디자인 시스템 + Vue3 컴포넌트 mock 개발 (아직 프론트 코드 없음)
4. ✅ **백엔드 실제 구현 완료** — 모든 `# TODO(4단계)` 제거. Supabase(PostgREST/RLS)
   조회·Gemini 파싱·JWT 검증·AES 암호화 구현 및 실제 자격증명으로 라이브 검증 완료.
5. ⬜ 프론트 ↔ 백엔드 실연동  6. ⬜ 모바일 기기 테스트(iOS STT 필수)

> 4단계를 3단계(프론트 mock)보다 먼저 완성했다. 프론트는 확정된 OpenAPI 스펙으로 병렬 진행 가능.

## 자주 쓰는 명령

환경: **Windows + PowerShell**. 한글/이모지를 출력하는 Python 스크립트는 콘솔(cp949)에서
깨지므로 `PYTHONIOENCODING=utf-8`을 설정한다.

```powershell
# 백엔드 실행 (Swagger: http://localhost:8000/docs)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 오프라인 스모크 — 서버/자격증명 없이 부팅·라우팅·응답래퍼·JWT·암호화 검증
cd backend
$env:PYTHONIOENCODING="utf-8"; python smoke_test.py

# 라이브 통합 — 실제 Supabase + Gemini 연동 검증 (.env 채움 + 사용자 토큰 필요)
$env:PYTHONIOENCODING="utf-8"; $env:TEST_ACCESS_TOKEN="<supabase access_token>"
python integration_test.py

# DB 마이그레이션 적용 + 검증 (psycopg2-binary 필요)
$env:SUPABASE_DB_URL="postgresql://...";  $env:PYTHONIOENCODING="utf-8"
python supabase/setup_db.py              # 적용 후 검증
python supabase/setup_db.py --verify-only # 적용 없이 검증만
```

테스트 러너(pytest 등)는 아직 없다. 테스트는 두 단일 스크립트다: `smoke_test.py`(오프라인,
자격증명 불필요)와 `integration_test.py`(라이브, `.env` + `TEST_ACCESS_TOKEN` 필요).

### Supabase 접속 제약 (중요)

로컬 네트워크가 **IPv4 전용**이라 IPv6-only인 **Direct connection
(`db.<ref>.supabase.co`)은 DNS 해석조차 실패**한다. 반드시 **Session Pooler**
(`postgres.<ref>@aws-1-<region>.pooler.<supabase-host>:5432`) 연결 문자열을 사용한다.
`setup_db.py`는 연결 문자열을 `SUPABASE_DB_URL` 환경변수로만 받고 출력하지 않으며
`sslmode=require`로 접속한다.

## 아키텍처

### DB / 보안 모델 (`supabase/migrations/`)

마이그레이션은 **순서대로** 적용한다(파일명 타임스탬프 순). 모두 재실행 안전(idempotent).

- `*_initial_schema.sql` — 테이블 5종(`users`, `assets`, `helpers`, `digital_legacy`,
  `fds_logs`), 인덱스, 트리거 2종.
  - `users.id`는 `auth.users.id`를 참조(1:1). 회원가입 시 `handle_new_user` 트리거가
    `public.users` 행을 자동 생성한다(메타데이터의 name/role 사용, 기본 role=`senior`).
  - `helpers`는 `users`를 두 번 참조하는 자기참조(senior ↔ helper).
- `*_rls_policies.sql` — RLS 활성화 + 정책 + 헬퍼 함수.

**핵심 보안 원칙**: 조력자의 이체·수정 차단은 애플리케이션 로직이 아니라 **RLS에서 SELECT
권한만 부여**해 구조적으로 보장한다. `assets`/`fds_logs`는 본인 전체 CRUD + 연결된 활성
조력자 SELECT만. `digital_legacy`는 본인만. RLS 정책이 `helpers`를 조회할 때 재귀를 피하려
**`SECURITY DEFINER` 함수 `is_active_helper()` / `is_connected()`** 로 RLS를 우회해 관계만
확인한다 — helpers 관계를 참조하는 정책을 추가할 때 이 함수들을 재사용할 것.

### 백엔드 (`backend/app/`)

FastAPI, 라우터는 `/api/v1` 프리픽스로 마운트. **4단계 실제 구현 완료** — 모든 도메인 로직이
Supabase(PostgREST/RLS)·Gemini·JWT·AES 로 동작한다. 외부 연동은 SDK 없이 **`httpx` 로만**
호출한다(supabase-py / google-generativeai 미사용 → 의존성 최소화).

핵심 설계: 사용자 access token 을 PostgREST 호출에 그대로 전달해 **DB RLS 가 적용**된다.
즉 조력자의 수정·삭제 차단 등 권한은 애플리케이션 if 문이 아니라 DB 정책이 보장한다.
이메일 조회·시스템 잠금 기록처럼 RLS 우회가 꼭 필요한 경우에만 `service_role`(admin 스코프)을 쓴다.

- `schemas.py` — **API 계약의 단일 출처**. 모든 요청/응답 Pydantic 모델. DB 컬럼 및 프론트
  `types/asset.ts`와 **1:1 매핑**, 필드는 snake_case, enum 값은 DB의 CHECK 제약과 동일.
  스키마를 바꾸면 DB·프론트 타입과의 정합성을 함께 확인한다.
- `core/config.py` — `pydantic-settings` 기반 `.env` 로드. Supabase URL/키, Gemini 키·모델,
  AES 키. `supabase_configured` 등 파생 속성과 REST/Auth URL 헬퍼 제공.
- `core/responses.py` + `core/errors.py` — 모든 응답을 공통 래퍼 `{success, data, error}`로
  통일. 성공은 `ok(data)`. 오류는 `HTTPException` 또는 `AppError` 하위(`ConfigError`=503,
  `SupabaseError`=502, `GeminiError`=502)를 던지면 예외 핸들러가 동일 형식으로 직렬화한다
  (`main.py`에서 등록). 라우터에서 직접 에러 JSON을 만들지 말 것.
- `core/http_client.py` — 공유 `httpx.AsyncClient` 싱글톤(커넥션 재사용). 이벤트 루프가
  바뀌면 자동 재생성한다(TestClient 다중요청 안전). `main.py` lifespan 이 종료 시 정리.
- `core/security.py` — Supabase JWT(HS256, `SUPABASE_JWT_SECRET`) 로컬 검증 + 디지털 유산
  AES(Fernet) 암복호화. 키가 Fernet 형식이 아니면 SHA-256 으로 유도한다.
- `core/supabase.py` — PostgREST REST 호출 레이어. `select/insert/update/delete` + `token`
  (사용자 스코프, RLS 적용) / `admin=True`(service_role, RLS 우회) 구분. PostgREST 필터
  문법을 그대로 쓴다(`{"id": "eq.<uuid>"}`, bool 은 `is.true`).
- `core/gemini.py` — Gemini REST(`generateContent`). `responseSchema` 로 구조화 JSON 강제.
  `parse_assets`(음성 텍스트→자산 후보), `ocr_assets`(이미지→Vision OCR). 모델은
  `gemini-2.5-flash`(2.0-flash 는 무료 티어 limit:0 → 429).
- `deps.py` — 인증 의존성 `get_current_principal`. Bearer 토큰을 JWT 검증 후 `public.users`
  를 조회해 `Principal`(프로필 `user` + RLS 호출용 `token`)을 주입한다. 라우터는
  `current.id`/`current.role`/`current.token`을 쓴다. (구 `MOCK_SENIOR` 제거됨.)
- `api/` — 도메인별 `APIRouter`(prefix+tags), `api/__init__.py`의 `api_router`로 집약.

## 비밀정보 취급

모든 비밀은 **`backend/.env` 단일 파일**에 모은다(Supabase URL/키, JWT secret, `SUPABASE_DB_URL`,
Gemini 키, AES 키). `.env`와 `.claude/settings.local.json`(권한 허용 목록에 접속 문자열이 평문으로
기록될 수 있음)은 `.gitignore`로 제외된다. 커밋 전 스테이징 diff에 연결 문자열·키·비밀번호가
없는지 확인한다. `.env.example`은 템플릿(빈 값)이므로 커밋 대상이다.

팀 공유·온보딩 절차와 키별 주의사항(anon은 공개 가능 / service_role·JWT·Gemini는 서버 전용 /
`LEGACY_ENCRYPTION_KEY`는 환경 간 동일 유지)은 `CONTRIBUTING.md`를 따른다. 실제 키는 git이
아니라 팀 공유 볼트로 전달하며, 노출 시 즉시 회전(rotate)한다.
