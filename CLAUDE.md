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
2. ✅ FastAPI API 스펙 — 응답 형식 확정, **mock 응답 단계** (`backend/`)
3. ⬜ 디자인 시스템 + Vue3 컴포넌트 mock 개발 (아직 프론트 코드 없음)
4. ⬜ 백엔드 실제 구현 (AI 연동) — `backend/`의 `# TODO(4단계)` 지점을 채운다
5. ⬜ 프론트 ↔ 백엔드 실연동  6. ⬜ 모바일 기기 테스트(iOS STT 필수)

## 자주 쓰는 명령

환경: **Windows + PowerShell**. 한글/이모지를 출력하는 Python 스크립트는 콘솔(cp949)에서
깨지므로 `PYTHONIOENCODING=utf-8`을 설정한다.

```powershell
# 백엔드 실행 (Swagger: http://localhost:8000/docs)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# API 스모크 테스트 — 서버 없이 TestClient로 전체 엔드포인트 검증
cd backend
$env:PYTHONIOENCODING="utf-8"; python smoke_test.py

# DB 마이그레이션 적용 + 검증 (psycopg2-binary 필요)
$env:SUPABASE_DB_URL="postgresql://...";  $env:PYTHONIOENCODING="utf-8"
python supabase/setup_db.py              # 적용 후 검증
python supabase/setup_db.py --verify-only # 적용 없이 검증만
```

테스트 러너(pytest 등)는 아직 없다. `smoke_test.py`가 유일한 테스트이며 단일 스크립트로 실행한다.

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

FastAPI, 라우터는 `/api/v1` 프리픽스로 마운트. 현재는 **스펙+mock 단계**로, 비즈니스 로직은
`# TODO(4단계)` 주석으로 표시된 자리표시자다. 4단계에서 Supabase 조회·Gemini 파싱·JWT
검증·AES 암호화로 이 지점들을 교체한다.

- `schemas.py` — **API 계약의 단일 출처**. 모든 요청/응답 Pydantic 모델. DB 컬럼 및 프론트
  `types/asset.ts`와 **1:1 매핑**, 필드는 snake_case, enum 값은 DB의 CHECK 제약과 동일.
  스키마를 바꾸면 DB·프론트 타입과의 정합성을 함께 확인한다.
- `core/responses.py` — 모든 응답을 공통 래퍼 `{success, data, error}`로 통일. 성공은
  `ok(data)` 헬퍼, 오류는 `HTTPException`/검증오류를 예외 핸들러가 동일 형식으로 직렬화
  (`main.py`에서 등록). 라우터에서 직접 에러 JSON을 만들지 말고 `HTTPException`을 던진다.
- `deps.py` — 인증 의존성 `get_current_user`. **현재는 Bearer 토큰 '존재'만 확인하고
  `MOCK_SENIOR`를 반환**한다(JWT 미검증). 인증 필요한 엔드포인트는 이 의존성을 주입한다.
- `api/` — 도메인별 `APIRouter`(prefix+tags), `api/__init__.py`의 `api_router`로 집약.
  라우터 간 mock 데이터는 `api/assets.py`의 `_MOCK_ASSETS`/`_SENIOR_ID`를 공유 참조한다.
- `core/config.py` — `pydantic-settings` 기반 `.env` 로드. Supabase/Gemini 키는 4단계용으로
  선언만 되어 있고 현재 미사용.

## 비밀정보 취급

`DBpw.md`(DB 비밀번호 보관)와 `.claude/settings.local.json`(권한 허용 목록에 접속 문자열이
평문으로 기록될 수 있음)은 `.gitignore`로 제외되어 있다. 커밋 전 스테이징 diff에 연결 문자열·
비밀번호가 없는지 확인한다. `.env.example`은 템플릿이므로 커밋 대상이다.
