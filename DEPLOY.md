# 배포 가이드 (Render + Vercel)

이음(E-UM) 배포: **백엔드 → Render**, **프론트 → Vercel**. 무료 플랜 기준.

> 순서가 중요하다. **백엔드를 먼저 배포해 URL을 확보**한 뒤, 그 URL을 프론트
> 환경변수(`VITE_API_BASE_URL`)에 넣고 프론트를 배포한다.

배포 설정 파일은 레포에 포함되어 있다:
- `render.yaml` — 백엔드 Render Blueprint
- `frontend/vercel.json` — 프론트 SPA 라우팅(history 모드 새로고침 404 방지)

비밀값은 모두 **각 플랫폼 대시보드**에 입력한다(레포에 커밋하지 않는다). 값은
로컬 `backend/.env` / `frontend/.env` 와 동일하게 넣는다.

---

## A. 백엔드 — Render

### 1) 서비스 생성
Render 대시보드 → **New → Blueprint** → 이 GitHub 레포 선택 → `render.yaml` 자동 인식 →
서비스명 `eum-backend` 확인 후 생성. (배포 브랜치를 현재 작업 브랜치 또는 `main`으로 지정)

> Blueprint 대신 수동 생성 시: **New → Web Service**, Root Directory `backend`,
> Build `pip install -r requirements.txt`,
> Start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### 2) 환경변수 입력 (Environment 탭)
`backend/.env` 와 동일하게:

| 키 | 설명 |
|----|------|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | PostgREST apikey(사용자 스코프) |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회(관리자 작업) — 서버 전용 |
| `SUPABASE_JWT_SECRET` | HS256 하위호환용(ES256은 JWKS 자동 검증이라 없어도 됨) |
| `GEMINI_API_KEY` | 음성/OCR 파싱 |
| `LEGACY_ENCRYPTION_KEY` | 디지털 유산 AES 키 — **환경 간 동일 유지** |

(`PYTHON_VERSION=3.12.7`, `PYTHONIOENCODING=utf-8` 은 `render.yaml` 에 이미 지정됨)

### 3) 배포 확인
배포 완료 후 `https://eum-backend-xxxx.onrender.com/health` →
`{"success":true,"data":{"status":"ok",...,"supabase_configured":true}}` 이면 정상.
이 **베이스 URL** 을 메모(프론트에서 사용).

### 4) Cold start 대응 (무료 플랜)
무료 인스턴스는 15분 무요청 시 잠든다(첫 요청 ~30초 지연). 발표/시연 전:
[cron-job.org](https://cron-job.org) 에서 `…/health` 를 5분 간격 ping 등록.

---

## B. 프론트 — Vercel

### 1) 프로젝트 import
Vercel → **Add New → Project** → 이 레포 선택 →
**Root Directory** 를 `frontend` 로 지정. Framework 는 **Vite** 자동 감지
(Build `npm run build`, Output `dist`).

### 2) 환경변수 입력 (Settings → Environment Variables)

| 키 | 값 |
|----|----|
| `VITE_USE_MOCK` | `false` |
| `VITE_API_BASE_URL` | `https://eum-backend-xxxx.onrender.com/api/v1` (A-3의 URL + `/api/v1`) |
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **publishable(공개용)** 키 — service_role 금지 |

> env 를 바꾸면 **재배포(Redeploy)** 해야 반영된다(빌드 타임 주입).

### 3) 배포 확인
배포 URL 접속 → `/login` → 회원가입/로그인 → 화면에 실데이터 표시 확인.
새로고침해도 404 안 나면 SPA 라우팅 정상.

---

## C. 연결 점검 & CORS

- 백엔드 CORS 는 현재 전체 허용(`cors_origins=["*"]`)이라 Vercel 도메인에서 바로 호출된다.
- (선택, 권장) 배포 후 Render 환경변수에 `CORS_ORIGINS=["https://<vercel-domain>"]`
  형식(JSON 배열)으로 좁힐 수 있다.

## D. 모바일 테스트 (다음 단계)
배포 URL(HTTPS)을 QR 로 만들어 실기기 접속. **iOS Safari 의 음성(STT)** 동작을
반드시 확인(명세서 6단계). 카메라/마이크는 HTTPS 에서만 동작하므로 배포본이 필요하다.
